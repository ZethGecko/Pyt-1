package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

        return inspeccionRepository.findByEmpresaIdEmpresaOrderByFechaDesc(empresaId)
                .stream()
                .map(this::convertirInspeccionParaHabilitarDTO)
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

        if (inspeccion.getEmpresaId() != null && !inspeccion.getEmpresaId().equals(empresa.getIdEmpresa())) {
            throw new IllegalArgumentException("La inspección no pertenece a la empresa seleccionada");
        }

        List<TUCDTO> tucs = request.getVehiculos().stream()
                .map(item -> habilitarVehiculo(item, empresa, request.getTipo(), request.getAnioVencimiento()))
                .collect(Collectors.toList());

        HabilitacionTucResponseDTO response = new HabilitacionTucResponseDTO();
        response.setInspeccion(convertirInspeccionParaHabilitarDTO(inspeccion));
        response.setTucs(tucs);
        response.setTotalHabilitados(tucs.size());
        return response;
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

    private TUCDTO habilitarVehiculo(VehiculoHabilitacionTucRequestDTO item, Empresa empresa, String tipo, Integer anioVencimiento) {
        Vehiculo vehiculo = obtenerOCrearVehiculo(item, empresa);
        return emitirOActualizarTUC(vehiculo, tipo, anioVencimiento, item.getObservaciones(), true);
    }

    private Vehiculo obtenerOCrearVehiculo(VehiculoHabilitacionTucRequestDTO item, Empresa empresa) {
        Vehiculo vehiculo = null;
        if (item.getIdVehiculo() != null) {
            vehiculo = vehiculoRepository.findById(item.getIdVehiculo())
                    .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado con id: " + item.getIdVehiculo()));
        } else if (item.getPlaca() != null && !item.getPlaca().trim().isEmpty()) {
            vehiculo = vehiculoRepository.findByPlaca(item.getPlaca()).orElse(null);
        }

        boolean crear = vehiculo == null;
        if (crear) {
            vehiculo = new Vehiculo();
        }

        if (item.getPlaca() != null && !item.getPlaca().trim().isEmpty()) {
            vehiculo.setPlaca(item.getPlaca().trim().toUpperCase());
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

        vehiculo.setEmpresa(empresa);
        vehiculo.setEstado("HABILITADO");
        vehiculo.setFechaHabilitacion(LocalDateTime.now());
        vehiculo.setObservaciones(combinarObservaciones(vehiculo.getObservaciones(), "Habilitación TUC desde inspección"));

        return vehiculoRepository.save(vehiculo);
    }

    private TUCDTO emitirOActualizarTUC(Vehiculo vehiculo, String tipo, Integer anioVencimiento, String observaciones, boolean permitirRenovacion) {
        validarTipo(tipo);
        LocalDateTime fechaEmision = LocalDateTime.now();
        LocalDateTime fechaVencimiento = calcularFechaVencimiento(tipo, anioVencimiento, fechaEmision);
        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucsActivos = tucRepository.findTopByVehiculosIdVehiculoAndFechaVencimientoAfterOrderByFechaEmisionDesc(vehiculo.getIdVehiculo(), now);

        if (tucsActivos != null && !tucsActivos.isEmpty() && !permitirRenovacion) {
            throw new IllegalStateException("El vehículo ya tiene un TUC activo");
        }

        TUC tuc;
        if (tucsActivos != null && !tucsActivos.isEmpty()) {
            tuc = tucsActivos.get(0);
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

    private InspeccionParaHabilitarTucDTO convertirInspeccionParaHabilitarDTO(Inspeccion inspeccion) {
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

        List<FichaInspeccion> fichas = fichaRepository.findByInspeccion(inspeccion.getIdInspeccion());
        List<VehiculoParaHabilitarTucDTO> vehiculos = fichas.stream()
                .filter(ficha -> ficha.getVehiculo() != null)
                .map(ficha -> convertirVehiculoParaHabilitarDTO(ficha))
                .collect(Collectors.toList());
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

        return dto;
    }

    @Transactional(readOnly = true)
    public List<EmpresaHabilitadaDTO> listarEmpresasHabilitadas() {
        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucsActivos = tucRepository.findByFechaVencimientoAfterOrderByFechaEmisionDesc(now);
        List<TUC> tucsActivosYActivos = tucsActivos.stream()
                .filter(t -> "ACTIVO".equals(t.getEstado()))
                .collect(Collectors.toList());

        return tucsActivosYActivos.stream()
                .collect(Collectors.groupingBy(t -> t.getEmpresa().getIdEmpresa()))
                .entrySet().stream()
                .map(entry -> {
                    Long empresaId = entry.getKey();
                    List<TUC> tucsEmpresa = entry.getValue();
                    TUC tuc = tucsEmpresa.get(0);
                    return construirEmpresaHabilitadaDTO(tuc);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TUCDTO> listarTUCsPorEmpresa(Long empresaId) {
        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucs = tucRepository.findByEmpresaIdEmpresaAndFechaVencimientoAfter(empresaId, now);
        return tucs.stream()
                .map(tuc -> {
                    List<Vehiculo> vehiculos = vehiculoRepository.findByTucId(tuc.getIdTuc());
                    Vehiculo vehiculo = vehiculos.isEmpty() ? null : vehiculos.get(0);
                    return convertirATUCDTO(tuc, vehiculo);
                })
                .collect(Collectors.toList());
    }

    private EmpresaHabilitadaDTO construirEmpresaHabilitadaDTO(TUC tuc) {
        EmpresaHabilitadaDTO dto = new EmpresaHabilitadaDTO();
        if (tuc.getEmpresa() != null) {
            dto.setEmpresaId(tuc.getEmpresa().getIdEmpresa());
            dto.setEmpresaNombre(tuc.getEmpresa().getNombre());
            dto.setEmpresaRuc(tuc.getEmpresa().getRuc());
        }
        dto.setFechaEmisionTUC(tuc.getFechaEmision());
        dto.setFechaVencimientoTUC(tuc.getFechaVencimiento());
        dto.setEstadoTUC(tuc.getEstado());

        List<Vehiculo> vehiculos = vehiculoRepository.findByTucId(tuc.getIdTuc());
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
        return vehiculos(tuc).stream().anyMatch(v -> v.getIdVehiculo().equals(vehiculo.getIdVehiculo()));
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
        return "TUC-" + System.currentTimeMillis() % 1000000;
    }
}
