package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.EmisionTUCRequestDTO;
import com.example.demo.dto.EmpresaHabilitadaDTO;
import com.example.demo.dto.HabilitacionTucRequestDTO;
import com.example.demo.dto.HabilitacionTucResponseDTO;
import com.example.demo.dto.InspeccionParaHabilitarTucDTO;
import com.example.demo.dto.TUCDTO;
import com.example.demo.dto.VehiculoHabilitacionTucRequestDTO;
import com.example.demo.dto.VehiculoParaHabilitarTucDTO;
import com.example.demo.dto.VehiculoTucDTO;
import com.example.demo.model.Empresa;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.Inspeccion;
import com.example.demo.model.SubtipoTransporte;
import com.example.demo.model.TUC;
import com.example.demo.model.Vehiculo;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.TUCRepository;
import com.example.demo.repository.SubtipoTransporteRepository;
import com.example.demo.repository.VehiculoRepository;

@Service
public class TUCService {

    private final TUCRepository tucRepository;
    private final FichaInspeccionRepository fichaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final InspeccionRepository inspeccionRepository;
    private final EmpresaRepository empresaRepository;
    private final SubtipoTransporteRepository subtipoTransporteRepository;
    private final AtomicBoolean deshabilitarTucsVencidosRunning = new AtomicBoolean(false);

    public TUCService(TUCRepository tucRepository,
                      FichaInspeccionRepository fichaRepository,
                      VehiculoRepository vehiculoRepository,
                      InspeccionRepository inspeccionRepository,
                      EmpresaRepository empresaRepository,
                      SubtipoTransporteRepository subtipoTransporteRepository) {
        this.tucRepository = tucRepository;
        this.fichaRepository = fichaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.inspeccionRepository = inspeccionRepository;
        this.empresaRepository = empresaRepository;
        this.subtipoTransporteRepository = subtipoTransporteRepository;
    }

    public List<TUC> listarTodos() {
        return tucRepository.findAll();
    }

    public TUC guardar(TUC tuc) {
        return tucRepository.save(tuc);
    }

    @Scheduled(initialDelay = 60_000, fixedDelay = 3_600_000)
    @Transactional
    public int deshabilitarTucsVencidos() {
        if (!deshabilitarTucsVencidosRunning.compareAndSet(false, true)) {
            return 0;
        }
        try {
            LocalDateTime now = LocalDateTime.now();
            long tucsVencidos = tucRepository.countActivosVencidos(now);
            if (tucsVencidos == 0) {
                return 0;
            }
            int actualizadosTucs = tucRepository.marcarTucsVencidos(now, "TUC vencido automáticamente");
            int actualizadosVehiculos = tucRepository.deshabilitarVehiculosDeTucsVencidos(now, now, "TUC vencido automáticamente");
            return Math.max(actualizadosTucs, actualizadosVehiculos);
        } finally {
            deshabilitarTucsVencidosRunning.set(false);
        }
    }

    public TUC buscarPorId(Long id) {
        return tucRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        tucRepository.deleteById(id);
    }

    @Transactional
    public TUCDTO emitirTUCDesdeFicha(EmisionTUCRequestDTO request) {
        validarTipo(request.getTipo());

        FichaInspeccion ficha = fichaRepository.findById(request.getFichaId())
                .orElseThrow(() -> new IllegalArgumentException("Ficha de inspección no encontrada"));

        if (!"APROBADO".equals(ficha.getResultado()) || !Boolean.TRUE.equals(ficha.getEstado())) {
            throw new IllegalStateException("La ficha de inspección debe estar aprobada");
        }

        Long vehiculoId = ficha.getVehiculo();
        if (vehiculoId == null) {
            throw new IllegalStateException("La ficha no tiene asociado un vehículo");
        }

        Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado con id: " + vehiculoId));

        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucsActivos = tucRepository.findTopByVehiculosIdVehiculoAndFechaVencimientoAfterOrderByFechaEmisionDesc(vehiculoId, now);
        if (tucsActivos != null && !tucsActivos.isEmpty()) {
            throw new IllegalStateException("El vehículo ya tiene un TUC activo");
        }

        return emitirOActualizarTUC(vehiculo, request.getTipo(), null, "TUC emitido desde ficha de inspección ID: " + ficha.getIdFichaInspeccion(), false);
    }

    @Transactional
    public TUCDTO emitirTUCDesdeVehiculo(Long vehiculoId, String tipo) {
        validarTipo(tipo);

        List<FichaInspeccion> fichas = fichaRepository.findApprovedByVehiculoOrderByFechaCreacionDesc(vehiculoId);
        if (fichas == null || fichas.isEmpty()) {
            throw new IllegalStateException("El vehículo no tiene una ficha de inspección aprobada");
        }

        FichaInspeccion ficha = fichas.get(0);
        return crearTUCDesdeFicha(ficha, tipo);
    }

    @Transactional(readOnly = true)
    public List<InspeccionParaHabilitarTucDTO> listarInspeccionesParaHabilitarTuc(Long empresaId) {
        if (empresaId == null || empresaId <= 0) {
            throw new IllegalArgumentException("Empresa inválida");
        }

        List<Inspeccion> inspecciones = inspeccionRepository.findByEmpresaIdEmpresaOrderByFechaDesc(empresaId);
        if (inspecciones.isEmpty()) {
            return List.of();
        }

        List<Long> inspeccionIds = inspecciones.stream()
                .map(Inspeccion::getIdInspeccion)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        List<FichaInspeccion> fichas = fichaRepository.findByInspeccionIn(inspeccionIds);
        Map<Long, List<FichaInspeccion>> fichasPorInspeccion = fichas.stream()
                .collect(Collectors.groupingBy(FichaInspeccion::getInspeccion));
        List<Long> vehiculoIds = fichas.stream()
                .map(FichaInspeccion::getVehiculo)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, TUC> tucActivoPorVehiculo = obtenerTucsActivosPorVehiculo(vehiculoIds);

        Set<Long> inspeccionesVistas = new HashSet<>();
        return inspecciones.stream()
                .filter(inspeccion -> inspeccionesVistas.add(inspeccion.getIdInspeccion()))
                .map(inspeccion -> convertirInspeccionParaHabilitarDTO(inspeccion, fichasPorInspeccion, tucActivoPorVehiculo))
                .collect(Collectors.toList());
    }

    @Transactional
    public HabilitacionTucResponseDTO habilitarPorInspeccion(HabilitacionTucRequestDTO request) {
        validarTipo(request.getTipo());
        if (request.getEmpresaId() == null || request.getEmpresaId() <= 0) {
            throw new IllegalArgumentException("Empresa inválida");
        }
        if (request.getInspeccionId() == null || request.getInspeccionId() <= 0) {
            throw new IllegalArgumentException("Inspección inválida");
        }
        if (request.getVehiculos() == null || request.getVehiculos().isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar al menos un vehículo");
        }

        Empresa empresa = empresaRepository.findById(Math.toIntExact(request.getEmpresaId()))
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        Inspeccion inspeccion = inspeccionRepository.findById(request.getInspeccionId())
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));

        if (!empresa.getIdEmpresa().equals(inspeccion.getEmpresaId())) {
            throw new IllegalArgumentException("La inspección no pertenece a la empresa seleccionada");
        }
        if (!"FINALIZADA".equals(inspeccion.getEstado())) {
            throw new IllegalStateException("La inspección debe estar FINALIZADA antes de habilitar TUC");
        }

        List<VehiculoHabilitacionTucRequestDTO> items = request.getVehiculos();
        List<Long> vehiculoIds = items.stream().map(VehiculoHabilitacionTucRequestDTO::getIdVehiculo).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        List<String> placas = items.stream().map(VehiculoHabilitacionTucRequestDTO::getPlaca).map(this::normalizarPlaca).filter(p -> p != null && !p.isEmpty()).distinct().collect(Collectors.toList());
        Map<Long, Vehiculo> vehiculosPorId = vehiculoIds.isEmpty() ? Map.of() : vehiculoRepository.findByIdIn(vehiculoIds).stream().collect(Collectors.toMap(Vehiculo::getIdVehiculo, v -> v));
        Map<String, Vehiculo> vehiculosPorPlaca = placas.isEmpty() ? Map.of() : vehiculoRepository.findByPlacaIn(placas).stream().collect(Collectors.toMap(v -> v.getPlaca() != null ? v.getPlaca().trim().toUpperCase() : "", v -> v));
        validarVehiculosAprobadosParaInspeccion(inspeccion.getIdInspeccion(), items, vehiculosPorId, vehiculosPorPlaca);
        vehiculoIds = new ArrayList<>(vehiculoIds);
        vehiculoIds.addAll(vehiculosPorPlaca.values().stream()
                .map(Vehiculo::getIdVehiculo)
                .filter(Objects::nonNull)
                .distinct()
                .toList());
        Map<Long, TUC> tucActivoPorVehiculo = obtenerTucsActivosPorVehiculo(vehiculoIds);
        List<TUCDTO> tucs = items.stream()
                .map(item -> habilitarVehiculo(item, empresa, request.getTipo(), request.getAnioVencimiento(), vehiculosPorId, vehiculosPorPlaca, tucActivoPorVehiculo))
                .collect(Collectors.toList());

        Map<Long, List<FichaInspeccion>> fichasPorInspeccion = Map.of(inspeccion.getIdInspeccion(), fichaRepository.findByInspeccion(inspeccion.getIdInspeccion()));
        Map<Long, TUC> tucActivoResponse = obtenerTucsActivosPorVehiculo(fichasPorInspeccion.getOrDefault(inspeccion.getIdInspeccion(), List.of()).stream().map(FichaInspeccion::getVehiculo).filter(Objects::nonNull).distinct().collect(Collectors.toList()));

        HabilitacionTucResponseDTO response = new HabilitacionTucResponseDTO();
        response.setInspeccion(convertirInspeccionParaHabilitarDTO(inspeccion, fichasPorInspeccion, tucActivoResponse));
        response.setTucs(tucs);
        response.setTotalHabilitados(tucs.size());
        return response;
    }

    private void validarVehiculosAprobadosParaInspeccion(Long inspeccionId,
                                                         List<VehiculoHabilitacionTucRequestDTO> items,
                                                         Map<Long, Vehiculo> vehiculosPorId,
                                                         Map<String, Vehiculo> vehiculosPorPlaca) {
        List<FichaInspeccion> fichas = fichaRepository.findByInspeccion(inspeccionId);
        Map<Long, FichaInspeccion> fichasAprobadasPorVehiculo = fichas.stream()
                .filter(this::esFichaAprobadaFinalizada)
                .collect(Collectors.toMap(
                        FichaInspeccion::getVehiculo,
                        ficha -> ficha,
                        (actual, nuevo) -> actual
                ));

        for (VehiculoHabilitacionTucRequestDTO item : items) {
            Long vehiculoId = obtenerVehiculoIdParaValidacion(item, vehiculosPorId, vehiculosPorPlaca);
            if (vehiculoId == null || !fichasAprobadasPorVehiculo.containsKey(vehiculoId)) {
                throw new IllegalStateException("Cada vehículo debe tener una ficha aprobada y finalizada en la inspección seleccionada");
            }
        }
    }

    private Long obtenerVehiculoIdParaValidacion(VehiculoHabilitacionTucRequestDTO item,
                                                 Map<Long, Vehiculo> vehiculosPorId,
                                                 Map<String, Vehiculo> vehiculosPorPlaca) {
        if (item.getIdVehiculo() != null) {
            return item.getIdVehiculo();
        }

        String placa = normalizarPlaca(item.getPlaca());
        if (placa == null || placa.isBlank()) {
            return null;
        }

        Vehiculo vehiculo = vehiculosPorPlaca.get(placa);
        return vehiculo != null ? vehiculo.getIdVehiculo() : null;
    }

    private boolean esFichaAprobadaFinalizada(FichaInspeccion ficha) {
        return ficha != null
                && ficha.getVehiculo() != null
                && Boolean.TRUE.equals(ficha.getEstado())
                && "APROBADO".equals(normalizarResultado(ficha.getResultado()))
                && ficha.getFirmaResponsable() != null
                && !ficha.getFirmaResponsable().isBlank()
                && ficha.getFechaFirma() != null
                && !ficha.getFechaFirma().isBlank();
    }

    private String normalizarResultado(String resultado) {
        if (resultado == null || resultado.trim().isEmpty()) {
            return null;
        }
        String normalizado = resultado.trim().toUpperCase();
        if (!"APROBADO".equals(normalizado) && !"OBSERVADO".equals(normalizado) && !"DESAPROBADO".equals(normalizado)) {
            throw new IllegalArgumentException("Resultado inválido. Use APROBADO, OBSERVADO o DESAPROBADO");
        }
        return normalizado;
    }

    private TUCDTO crearTUCDesdeFicha(FichaInspeccion ficha, String tipo) {
        Long vehiculoId = ficha.getVehiculo();
        if (vehiculoId == null) {
            throw new IllegalStateException("La ficha no tiene asociado un vehículo");
        }

        Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado con id: " + vehiculoId));

        return emitirOActualizarTUC(vehiculo, tipo, null, "TUC emitido desde ficha de inspección ID: " + ficha.getIdFichaInspeccion(), false);
    }

    private TUCDTO habilitarVehiculo(VehiculoHabilitacionTucRequestDTO item,
                                     Empresa empresa,
                                     String tipo,
                                     Integer anioVencimiento,
                                     Map<Long, Vehiculo> vehiculosPorId,
                                     Map<String, Vehiculo> vehiculosPorPlaca,
                                     Map<Long, TUC> tucActivoPorVehiculo) {
        Vehiculo vehiculo = obtenerOCrearVehiculo(item, empresa, vehiculosPorId, vehiculosPorPlaca);
        Long idVehiculo = vehiculo.getIdVehiculo();
        TUC tucActivo = idVehiculo != null ? tucActivoPorVehiculo.get(idVehiculo) : null;
        return emitirOActualizarTUCConTucActivo(vehiculo, tipo, anioVencimiento, item.getObservaciones(), true, tucActivo);
    }

    private Vehiculo obtenerOCrearVehiculo(VehiculoHabilitacionTucRequestDTO item,
                                           Empresa empresa,
                                           Map<Long, Vehiculo> vehiculosPorId,
                                           Map<String, Vehiculo> vehiculosPorPlaca) {
        Vehiculo vehiculo = null;
        if (item.getIdVehiculo() != null) {
            vehiculo = vehiculosPorId.get(item.getIdVehiculo());
            if (vehiculo == null) {
                throw new IllegalArgumentException("Vehículo no encontrado con id: " + item.getIdVehiculo());
            }
        } else {
            String placa = normalizarPlaca(item.getPlaca());
            if (placa != null && !placa.isEmpty()) {
                vehiculo = vehiculosPorPlaca.get(placa);
            }
        }

        boolean crear = vehiculo == null;
        if (crear) {
            vehiculo = new Vehiculo();
        }

        String placa = normalizarPlaca(item.getPlaca());
        if (placa != null && !placa.isEmpty()) {
            vehiculo.setPlaca(placa);
        }
        if (vehiculo.getPlaca() == null || vehiculo.getPlaca().trim().isEmpty()) {
            throw new IllegalArgumentException("La placa del vehículo es obligatoria");
        }
        if (item.getMarca() != null && !item.getMarca().trim().isEmpty()) {
            vehiculo.setMarca(item.getMarca().trim());
        }
        if (crear && (vehiculo.getMarca() == null || vehiculo.getMarca().trim().isEmpty())) {
            throw new IllegalArgumentException("La marca del vehículo es obligatoria al crearlo");
        }
        if (item.getModelo() != null && !item.getModelo().trim().isEmpty()) {
            vehiculo.setModelo(item.getModelo().trim());
        }
        if (crear && (vehiculo.getModelo() == null || vehiculo.getModelo().trim().isEmpty())) {
            throw new IllegalArgumentException("El modelo del vehículo es obligatorio al crearlo");
        }
        if (item.getAnioFabricacion() != null) {
            vehiculo.setAnioFabricacion(item.getAnioFabricacion());
        }
        if (item.getColor() != null) {
            vehiculo.setColor(item.getColor());
        }
        if (item.getCategoria() != null) {
            vehiculo.setCategoria(item.getCategoria());
        }
        if (item.getPesoNeto() != null) {
            vehiculo.setPesoNeto(item.getPesoNeto());
        }
        if (item.getSubtipoTransporteId() != null) {
            SubtipoTransporte subtipoTransporte = subtipoTransporteRepository.findById(item.getSubtipoTransporteId())
                    .orElseThrow(() -> new IllegalArgumentException("Subtipo de transporte no encontrado con id: " + item.getSubtipoTransporteId()));
            vehiculo.setSubtipoTransporte(subtipoTransporte);
        }

        if (!crear && vehiculo.getEmpresa() != null && !empresa.getIdEmpresa().equals(vehiculo.getEmpresa().getIdEmpresa())) {
            throw new IllegalArgumentException("El vehículo no pertenece a la empresa seleccionada");
        }

        vehiculo.setEmpresa(empresa);
        vehiculo.setEstado("HABILITADO");
        vehiculo.setFechaHabilitacion(LocalDateTime.now());
        vehiculo.setObservaciones(combinarObservaciones(vehiculo.getObservaciones(), "Habilitación TUC desde inspección"));

        return vehiculoRepository.save(vehiculo);
    }

    private Map<Long, TUC> obtenerTucsActivosPorVehiculo(List<Long> vehiculoIds) {
        if (vehiculoIds == null || vehiculoIds.isEmpty()) {
            return Map.of();
        }

        List<Long> ids = vehiculoIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (ids.isEmpty()) {
            return Map.of();
        }

        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucsActivos = tucRepository.findActiveByVehiculoIds(ids, now);
        Map<Long, TUC> tucsActivosPorId = tucsActivos.stream()
                .filter(tuc -> tuc != null && tuc.getIdTuc() != null)
                .collect(Collectors.toMap(
                        TUC::getIdTuc,
                        tuc -> tuc,
                        (actual, nuevo) -> {
                            if (actual.getFechaEmision() == null) {
                                return nuevo;
                            }
                            if (nuevo.getFechaEmision() == null) {
                                return actual;
                            }
                            return nuevo.getFechaEmision().isAfter(actual.getFechaEmision()) ? nuevo : actual;
                        }
                ));

        if (tucsActivosPorId.isEmpty()) {
            return Map.of();
        }

        List<Long> tucIds = new ArrayList<>(tucsActivosPorId.keySet());
        Map<Long, List<Vehiculo>> vehiculosPorTucId = vehiculoRepository.findByTucIdIn(tucIds).stream()
                .filter(vehiculo -> vehiculo != null && vehiculo.getTuc() != null && vehiculo.getTuc().getIdTuc() != null)
                .collect(Collectors.groupingBy(vehiculo -> vehiculo.getTuc().getIdTuc()));

        Map<Long, TUC> resultado = new HashMap<>();
        for (Map.Entry<Long, List<Vehiculo>> entry : vehiculosPorTucId.entrySet()) {
            TUC tuc = tucsActivosPorId.get(entry.getKey());
            if (tuc == null) {
                continue;
            }
            for (Vehiculo vehiculo : entry.getValue()) {
                if (vehiculo == null || vehiculo.getIdVehiculo() == null) {
                    continue;
                }
                TUC actual = resultado.get(vehiculo.getIdVehiculo());
                if (actual == null
                        || (tuc.getFechaEmision() != null
                        && (actual.getFechaEmision() == null || tuc.getFechaEmision().isAfter(actual.getFechaEmision())))) {
                    resultado.put(vehiculo.getIdVehiculo(), tuc);
                }
            }
        }
        return resultado;
    }

    private String normalizarPlaca(String placa) {
        return placa == null || placa.trim().isEmpty() ? null : placa.trim().toUpperCase();
    }


    private TUCDTO emitirOActualizarTUC(Vehiculo vehiculo,
                                        String tipo,
                                        Integer anioVencimiento,
                                        String observaciones,
                                        boolean permitirRenovacion,
                                        TUC tucActivo) {
        validarTipo(tipo);
        LocalDateTime fechaEmision = LocalDateTime.now();
        LocalDateTime fechaVencimiento = calcularFechaVencimiento(tipo, anioVencimiento, fechaEmision);
        LocalDateTime now = LocalDateTime.now();
        if (tucActivo == null && vehiculo.getIdVehiculo() != null) {
            List<TUC> tucsActivos = tucRepository.findTopByVehiculosIdVehiculoAndFechaVencimientoAfterOrderByFechaEmisionDesc(vehiculo.getIdVehiculo(), now);
            tucActivo = tucsActivos != null && !tucsActivos.isEmpty() ? tucsActivos.get(0) : null;
        }

        if (tucActivo != null && !permitirRenovacion) {
            throw new IllegalStateException("El vehículo ya tiene un TUC activo");
        }

        TUC tuc;
        if (tucActivo != null && permitirRenovacion) {
            tucActivo.setEstado("RENOVADO");
            tucActivo.setFechaActualizacion(now);
            tucRepository.save(tucActivo);

            tuc = new TUC();
            tuc.setCodigo(generarCodigoTUC());
            tuc.setEstado("ACTIVO");
            tuc.setFechaEmision(fechaEmision);
            tuc.setDuracionMeses(12);
            tuc.setFechaCreacion(now);
            tuc.setVehiculos(new ArrayList<>());
        } else if (tucActivo != null) {
            tuc = tucActivo;
        } else {
            tuc = new TUC();
            tuc.setCodigo(generarCodigoTUC());
            tuc.setEstado("ACTIVO");
            tuc.setFechaEmision(fechaEmision);
            tuc.setDuracionMeses(12);
            tuc.setFechaCreacion(now);
            tuc.setVehiculos(new ArrayList<>());
        }

        tuc.setFechaVencimiento(fechaVencimiento);
        tuc.setTipo(tipo);
        tuc.setObservaciones(combinarObservaciones(tuc.getObservaciones(), observaciones));
        tuc.setFechaActualizacion(now);
        tuc.setEmpresa(vehiculo.getEmpresa());

        if (!contieneVehiculo(tuc, vehiculo)) {
            vehiculos(tuc).add(vehiculo);
        }
        vehiculo.setTuc(tuc);
        vehiculo.setEstado("HABILITADO");
        vehiculo.setFechaHabilitacion(now);
        vehiculo.setFechaVencimientoTUC(fechaVencimiento);
        vehiculo.setObservaciones(combinarObservaciones(vehiculo.getObservaciones(), "TUC " + tipo + " hasta " + fechaVencimiento.toLocalDate()));

        TUC guardado = tucRepository.save(tuc);
        Vehiculo vehiculoGuardado = vehiculoRepository.save(vehiculo);
        return convertirATUCDTO(guardado, vehiculoGuardado);
    }

    private TUCDTO emitirOActualizarTUC(Vehiculo vehiculo, String tipo, Integer anioVencimiento, String observaciones, boolean permitirRenovacion) {
        return emitirOActualizarTUC(vehiculo, tipo, anioVencimiento, observaciones, permitirRenovacion, null);
    }

    private TUCDTO emitirOActualizarTUCConTucActivo(Vehiculo vehiculo,
                                                    String tipo,
                                                    Integer anioVencimiento,
                                                    String observaciones,
                                                    boolean permitirRenovacion,
                                                    TUC tucActivoPreloaded) {
        validarTipo(tipo);
        LocalDateTime fechaEmision = LocalDateTime.now();
        LocalDateTime fechaVencimiento = calcularFechaVencimiento(tipo, anioVencimiento, fechaEmision);
        LocalDateTime now = LocalDateTime.now();

        if (tucActivoPreloaded != null && !permitirRenovacion) {
            throw new IllegalStateException("El vehículo ya tiene un TUC activo");
        }

        TUC tuc;
        if ((tucActivoPreloaded != null && permitirRenovacion) || tucActivoPreloaded == null) {
            if (tucActivoPreloaded != null) {
                tucActivoPreloaded.setEstado("RENOVADO");
                tucActivoPreloaded.setFechaActualizacion(now);
                tucRepository.save(tucActivoPreloaded);
            }

            tuc = new TUC();
            tuc.setCodigo(generarCodigoTUC());
            tuc.setEstado("ACTIVO");
            tuc.setFechaEmision(fechaEmision);
            tuc.setDuracionMeses(12);
            tuc.setFechaCreacion(now);
            tuc.setVehiculos(new ArrayList<>());
        } else if (tucActivoPreloaded != null) {
            tuc = tucActivoPreloaded;
        } else {
            throw new IllegalStateException("No se pudo determinar el TUC a emitir o renovar");
        }

        tuc.setFechaVencimiento(fechaVencimiento);
        tuc.setTipo(tipo);
        tuc.setObservaciones(combinarObservaciones(tuc.getObservaciones(), observaciones));
        tuc.setFechaActualizacion(now);
        tuc.setEmpresa(vehiculo.getEmpresa());

        if (!contieneVehiculo(tuc, vehiculo)) {
            vehiculos(tuc).add(vehiculo);
        }
        vehiculo.setTuc(tuc);
        vehiculo.setEstado("HABILITADO");
        vehiculo.setFechaHabilitacion(now);
        vehiculo.setFechaVencimientoTUC(fechaVencimiento);
        vehiculo.setObservaciones(combinarObservaciones(vehiculo.getObservaciones(), "TUC " + tipo + " hasta " + fechaVencimiento.toLocalDate()));

        TUC guardado = tucRepository.save(tuc);
        Vehiculo vehiculoGuardado = vehiculoRepository.save(vehiculo);
        return convertirATUCDTO(guardado, vehiculoGuardado);
    }

    private LocalDateTime calcularFechaVencimiento(String tipo, Integer anioVencimiento, LocalDateTime fechaEmision) {
        LocalDate fechaBase = fechaEmision.toLocalDate();
        LocalDate fechaFinal;
        if ("HASTA_FIN_ANIO".equals(tipo)) {
            int anio = anioVencimiento != null && anioVencimiento > 0 ? anioVencimiento : fechaBase.getYear() + 1;
            fechaFinal = LocalDate.of(anio, 12, 31);
        } else {
            fechaFinal = fechaBase.plusMonths(12);
        }
        return fechaFinal.atTime(23, 59, 59, 999_999_999);
    }

    private void validarTipo(String tipo) {
        if (tipo == null || (!"12_MESES".equals(tipo) && !"HASTA_FIN_ANIO".equals(tipo))) {
            throw new IllegalArgumentException("Tipo de TUC inválido. Use '12_MESES' o 'HASTA_FIN_ANIO'");
        }
    }

    private InspeccionParaHabilitarTucDTO convertirInspeccionParaHabilitarDTO(Inspeccion inspeccion,
                                                                               Map<Long, List<FichaInspeccion>> fichasPorInspeccion,
                                                                               Map<Long, TUC> tucActivoPorVehiculo) {
        InspeccionParaHabilitarTucDTO dto = new InspeccionParaHabilitarTucDTO();
        dto.setIdInspeccion(inspeccion.getIdInspeccion());
        dto.setCodigo(inspeccion.getCodigo());
        dto.setFechaProgramada(inspeccion.getFechaProgramada());
        dto.setHora(inspeccion.getHora());
        dto.setLugar(inspeccion.getLugar());
        dto.setEstado(inspeccion.getEstado());
        dto.setResultadoGeneral(inspeccion.getResultadoGeneral());
        dto.setFechaEjecucion(inspeccion.getFechaEjecucion() != null ? inspeccion.getFechaEjecucion() : inspeccion.getFechaCreacion());
        dto.setFechaCreacion(inspeccion.getFechaCreacion());
        dto.setEmpresaId(inspeccion.getEmpresaId());
        dto.setEmpresaNombre(inspeccion.getEmpresaNombre());
        dto.setEmpresaRuc(inspeccion.getEmpresaRuc());

        List<FichaInspeccion> fichas = fichasPorInspeccion.getOrDefault(inspeccion.getIdInspeccion(), List.of());
        List<VehiculoParaHabilitarTucDTO> vehiculos = fichas.stream()
                .map(ficha -> convertirVehiculoParaHabilitarDTO(ficha, tucActivoPorVehiculo))
                .collect(Collectors.toList());
        dto.setVehiculos(vehiculos);
        return dto;
    }

    private VehiculoParaHabilitarTucDTO convertirVehiculoParaHabilitarDTO(FichaInspeccion ficha,
                                                                           Map<Long, TUC> tucActivoPorVehiculo) {
        Vehiculo vehiculo = ficha.getVehiculoEntity();
        if (vehiculo == null) {
            VehiculoParaHabilitarTucDTO dto = new VehiculoParaHabilitarTucDTO();
            dto.setFichaId(ficha.getIdFichaInspeccion());
            dto.setInspeccionId(ficha.getInspeccion());
            dto.setResultadoFicha(ficha.getResultado());
            dto.setEstadoFicha(ficha.getEstado());
            return dto;
        }

        TUC tucActivo = tucActivoPorVehiculo.get(ficha.getVehiculo());

        VehiculoParaHabilitarTucDTO dto = new VehiculoParaHabilitarTucDTO();
        dto.setFichaId(ficha.getIdFichaInspeccion());
        dto.setInspeccionId(ficha.getInspeccion());
        dto.setResultadoFicha(ficha.getResultado());
        dto.setEstadoFicha(ficha.getEstado());
        dto.setIdVehiculo(vehiculo.getIdVehiculo());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setMarca(vehiculo.getMarca());
        dto.setModelo(vehiculo.getModelo());
        dto.setColor(vehiculo.getColor());
        dto.setCategoria(vehiculo.getCategoria());
        dto.setAnioFabricacion(vehiculo.getAnioFabricacion());
        if (vehiculo.getSubtipoTransporte() != null) {
            dto.setSubtipoTransporteId(vehiculo.getSubtipoTransporte().getIdSubtipoTransporte());
        }
        if (vehiculo.getEmpresa() != null) {
            dto.setEmpresaId(vehiculo.getEmpresa().getIdEmpresa());
        }
        dto.setEstado(vehiculo.getEstado());
        dto.setTieneTucActivo(tucActivo != null);
        dto.setFechaVencimientoTuc(tucActivo != null ? tucActivo.getFechaVencimiento() : vehiculo.getFechaVencimientoTUC());
        dto.setObservaciones(vehiculo.getObservaciones());
        return dto;
    }

    private VehiculoParaHabilitarTucDTO convertirVehiculoParaHabilitarDTO(FichaInspeccion ficha) {
        Vehiculo vehiculo = vehiculoRepository.findById(ficha.getVehiculo())
                .orElse(null);

        VehiculoParaHabilitarTucDTO dto = new VehiculoParaHabilitarTucDTO();
        dto.setFichaId(ficha.getIdFichaInspeccion());
        dto.setInspeccionId(ficha.getInspeccion());
        dto.setResultadoFicha(ficha.getResultado());
        dto.setEstadoFicha(ficha.getEstado());

        if (vehiculo == null) {
            return dto;
        }

        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucsActivos = tucRepository.findTopByVehiculosIdVehiculoAndFechaVencimientoAfterOrderByFechaEmisionDesc(vehiculo.getIdVehiculo(), now);
        TUC tucActivo = tucsActivos != null && !tucsActivos.isEmpty() ? tucsActivos.get(0) : null;

        dto.setIdVehiculo(vehiculo.getIdVehiculo());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setMarca(vehiculo.getMarca());
        dto.setModelo(vehiculo.getModelo());
        dto.setColor(vehiculo.getColor());
        dto.setCategoria(vehiculo.getCategoria());
        dto.setAnioFabricacion(vehiculo.getAnioFabricacion());
        if (vehiculo.getSubtipoTransporte() != null) {
            dto.setSubtipoTransporteId(vehiculo.getSubtipoTransporte().getIdSubtipoTransporte());
        }
        if (vehiculo.getEmpresa() != null) {
            dto.setEmpresaId(vehiculo.getEmpresa().getIdEmpresa());
        }
        dto.setEstado(vehiculo.getEstado());
        dto.setTieneTucActivo(tucActivo != null);
        dto.setFechaVencimientoTuc(tucActivo != null ? tucActivo.getFechaVencimiento() : vehiculo.getFechaVencimientoTUC());
        dto.setObservaciones(vehiculo.getObservaciones());
        return dto;
    }

    private VehiculoTucDTO convertirVehiculoTucDTO(Vehiculo vehiculo) {
        return convertirVehiculoTucDTO(vehiculo, null);
    }

    private VehiculoTucDTO convertirVehiculoTucDTO(Vehiculo vehiculo, TUC tuc) {
        VehiculoTucDTO dto = new VehiculoTucDTO();
        if (vehiculo == null) {
            return dto;
        }
        dto.setIdVehiculo(vehiculo.getIdVehiculo());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setMarca(vehiculo.getMarca());
        dto.setModelo(vehiculo.getModelo());
        LocalDateTime fechaEmision = tuc != null ? tuc.getFechaEmision() : null;
        LocalDateTime fechaVencimiento = tuc != null ? tuc.getFechaVencimiento() : vehiculo.getFechaVencimientoTUC();
        dto.setFechaEmisionTUC(fechaEmision);
        dto.setFechaVencimientoTUC(fechaVencimiento);
        return dto;
    }

    private TUCDTO convertirATUCDTO(TUC tuc, Vehiculo vehiculo) {
        TUCDTO dto = new TUCDTO();
        dto.setIdTuc(tuc.getIdTuc());
        dto.setCodigo(tuc.getCodigo());
        dto.setEstado(tuc.getEstado());
        dto.setFechaEmision(tuc.getFechaEmision());
        dto.setFechaVencimiento(tuc.getFechaVencimiento());
        dto.setDuracionMeses(tuc.getDuracionMeses());
        dto.setTipo(tuc.getTipo());
        dto.setObservaciones(tuc.getObservaciones());

        if (tuc.getEmpresa() != null) {
            dto.setEmpresaId(tuc.getEmpresa().getIdEmpresa());
            dto.setEmpresaNombre(tuc.getEmpresa().getNombre());
            dto.setEmpresaRuc(tuc.getEmpresa().getRuc());
        }

        if (vehiculo != null) {
            dto.setVehiculoId(vehiculo.getIdVehiculo());
            dto.setVehiculoPlaca(vehiculo.getPlaca());
            dto.setVehiculoMarca(vehiculo.getMarca());
            dto.setVehiculoModelo(vehiculo.getModelo());
        }

        List<VehiculoTucDTO> vehiculosDto = vehiculos(tuc).stream()
                .filter(Objects::nonNull)
                .map(this::convertirVehiculoTucDTO)
                .collect(Collectors.toList());
        if (vehiculosDto.isEmpty() && vehiculo != null) {
            vehiculosDto = List.of(convertirVehiculoTucDTO(vehiculo, tuc));
        }
        dto.setVehiculos(vehiculosDto);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<EmpresaHabilitadaDTO> listarEmpresasHabilitadas() {
        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucsActivos = tucRepository.findByFechaVencimientoAfterOrderByFechaEmisionDesc(now);
        List<TUC> tucsActivosYActivos = tucsActivos.stream()
                .filter(t -> "ACTIVO".equals(t.getEstado()))
                .collect(Collectors.toList());
        Map<Long, List<TUC>> tucsPorEmpresa = tucsActivosYActivos.stream()
                .filter(t -> t.getEmpresa() != null && t.getEmpresa().getIdEmpresa() != null)
                .collect(Collectors.groupingBy(t -> t.getEmpresa().getIdEmpresa()));
        Map<Long, List<Long>> tucIdsPorEmpresa = tucsPorEmpresa.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream()
                                .map(TUC::getIdTuc)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList())
                ));

        List<Long> tucIds = tucIdsPorEmpresa.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());
        final Map<Long, List<Vehiculo>> vehiculosPorTucId = tucIds.isEmpty()
                ? Collections.emptyMap()
                : vehiculoRepository.findByTucIdIn(tucIds).stream()
                        .filter(v -> v.getTuc() != null && v.getTuc().getIdTuc() != null)
                        .collect(Collectors.groupingBy(v -> v.getTuc().getIdTuc()));

        return tucsPorEmpresa.entrySet().stream()
                .map(entry -> {
                    Long empresaId = entry.getKey();
                    Map<Long, List<Vehiculo>> vehiculosPorTucIdGrupo = tucIdsPorEmpresa.get(empresaId).stream()
                            .collect(Collectors.toMap(
                                    id -> id,
                                    id -> vehiculosPorTucId.getOrDefault(id, Collections.emptyList())
                            ));
                    return construirEmpresaHabilitadaDTO(entry.getValue().get(0), vehiculosPorTucIdGrupo);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TUCDTO> listarTUCsPorEmpresa(Long empresaId) {
        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucs = tucRepository.findByEmpresaIdEmpresaAndFechaVencimientoAfter(empresaId, now)
                .stream()
                .filter(tuc -> tuc != null && "ACTIVO".equals(tuc.getEstado()))
                .collect(Collectors.toList());
        List<Long> tucIds = tucs.stream()
                .map(TUC::getIdTuc)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        final Map<Long, List<Vehiculo>> vehiculosPorTucId = tucIds.isEmpty()
                ? Collections.emptyMap()
                : vehiculoRepository.findByTucIdIn(tucIds).stream()
                        .filter(v -> v.getTuc() != null && v.getTuc().getIdTuc() != null)
                        .collect(Collectors.groupingBy(v -> v.getTuc().getIdTuc()));

        return tucs.stream()
                .map(tuc -> {
                    List<Vehiculo> vehiculos = vehiculosPorTucId.getOrDefault(tuc.getIdTuc(), Collections.emptyList());
                    Vehiculo vehiculo = vehiculos.isEmpty() ? null : vehiculos.get(0);
                    return convertirATUCDTO(tuc, vehiculo);
                })
                .collect(Collectors.toList());
    }

    private EmpresaHabilitadaDTO construirEmpresaHabilitadaDTO(TUC tuc, Map<Long, List<Vehiculo>> vehiculosPorTucId) {
        EmpresaHabilitadaDTO dto = new EmpresaHabilitadaDTO();
        if (tuc.getEmpresa() != null) {
            dto.setEmpresaId(tuc.getEmpresa().getIdEmpresa());
            dto.setEmpresaNombre(tuc.getEmpresa().getNombre());
            dto.setEmpresaRuc(tuc.getEmpresa().getRuc());
        }
        dto.setFechaEmisionTUC(tuc.getFechaEmision());
        dto.setFechaVencimientoTUC(tuc.getFechaVencimiento());
        dto.setEstadoTUC(tuc.getEstado());

        List<Vehiculo> vehiculos = vehiculosPorTucId.getOrDefault(tuc.getIdTuc(), Collections.emptyList());
        dto.setTotalVehiculosHabilitados(vehiculos.size());
        dto.setVehiculos(vehiculos.stream()
                .map(v -> {
                    VehiculoTucDTO vt = new VehiculoTucDTO();
                    vt.setIdVehiculo(v.getIdVehiculo());
                    vt.setPlaca(v.getPlaca());
                    vt.setMarca(v.getMarca());
                    vt.setModelo(v.getModelo());
                    vt.setFechaEmisionTUC(tuc.getFechaEmision());
                    vt.setFechaVencimientoTUC(tuc.getFechaVencimiento());
                    return vt;
                })
                .collect(Collectors.toList()));

        return dto;
    }

    private boolean contieneVehiculo(TUC tuc, Vehiculo vehiculo) {
        if (tuc == null
                || vehiculo == null
                || tuc.getIdTuc() == null
                || vehiculo.getIdVehiculo() == null
                || tuc.getVehiculos() == null) {
            return false;
        }

        return tuc.getVehiculos().stream()
                .filter(Objects::nonNull)
                .map(Vehiculo::getIdVehiculo)
                .filter(Objects::nonNull)
                .anyMatch(vehiculo.getIdVehiculo()::equals);
    }

    private List<Vehiculo> vehiculos(TUC tuc) {
        if (tuc.getVehiculos() == null) {
            tuc.setVehiculos(new ArrayList<>());
        }
        return tuc.getVehiculos();
    }

    private String combinarObservaciones(String actual, String nueva) {
        if (nueva == null || nueva.trim().isEmpty()) {
            return actual;
        }
        String entrada = nueva.trim();
        if (actual == null || actual.trim().isEmpty()) {
            return entrada;
        }
        String base = actual.trim();
        if (base.contains(entrada)) {
            return base;
        }
        return base + " | " + entrada;
    }

    private String generarCodigoTUC() {
        return "TUC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
