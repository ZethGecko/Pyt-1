package com.example.demo.service;

import com.example.demo.dto.EmisionTUCRequestDTO;
import com.example.demo.dto.EmpresaHabilitadaDTO;
import com.example.demo.dto.TUCDTO;
import com.example.demo.dto.VehiculoTucDTO;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.Inspeccion;
import com.example.demo.model.TUC;
import com.example.demo.model.Vehiculo;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.TUCRepository;
import com.example.demo.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TUCService {

    private final TUCRepository tucRepository;
    private final FichaInspeccionRepository fichaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final InspeccionRepository inspeccionRepository;

    public TUCService(TUCRepository tucRepository,
                      FichaInspeccionRepository fichaRepository,
                      VehiculoRepository vehiculoRepository,
                      InspeccionRepository inspeccionRepository) {
        this.tucRepository = tucRepository;
        this.fichaRepository = fichaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.inspeccionRepository = inspeccionRepository;
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

    /**
     * Emite un TUC para el vehículo asociado a una ficha de inspección aprobada.
     * Valida que la ficha esté aprobada y que el vehículo no tenga un TUC activo.
     * Calcula fecha de vencimiento según el tipo.
     */
    @Transactional
    public TUCDTO emitirTUCDesdeFicha(EmisionTUCRequestDTO request) {
        if (request.getTipo() == null || (!request.getTipo().equals("12_MESES") && !request.getTipo().equals("HASTA_FIN_ANIO"))) {
            throw new IllegalArgumentException("Tipo de TUC inválido. Use '12_MESES' o 'HASTA_FIN_ANIO'");
        }

        // 1) Obtener ficha
        FichaInspeccion ficha = fichaRepository.findById(request.getFichaId())
                .orElseThrow(() -> new IllegalArgumentException("Ficha de inspección no encontrada"));

        // 2) Validar que la ficha esté aprobada
        Boolean estadoFicha = ficha.getEstado();
        String resultadoFicha = ficha.getResultado();
        if (estadoFicha == null || !estadoFicha || !"APROBADO".equals(resultadoFicha)) {
            throw new IllegalStateException("La ficha de inspección debe estar APROBADA para emitir TUC");
        }

        // 3) Obtener vehículo
        Long vehiculoId = ficha.getVehiculo();
        if (vehiculoId == null) {
            throw new IllegalStateException("La ficha no tiene asociado un vehículo");
        }
        Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado"));

        // 4) Validar que el vehículo no tenga un TUC activo
        LocalDateTime now = LocalDateTime.now();
        List<TUC> tucsActivos = tucRepository.findByVehiculosIdVehiculoAndFechaVencimientoAfter(vehiculoId, now);
        if (tucsActivos != null && !tucsActivos.isEmpty()) {
            TUC existente = tucsActivos.get(0);
            throw new IllegalStateException("El vehículo ya tiene un TUC activo (Código: " + existente.getCodigo() + ", vence: " + existente.getFechaVencimiento() + ")");
        }

        // 5) Calcular fechas
        LocalDateTime fechaEmision = now;
        LocalDateTime fechaVencimiento;
        Integer duracionMeses;

        if ("12_MESES".equals(request.getTipo())) {
            duracionMeses = 12;
            fechaVencimiento = fechaEmision.plusMonths(12);
        } else { // HASTA_FIN_ANIO
            duracionMeses = 0;
            LocalDate finAnio = LocalDate.of(fechaEmision.getYear(), 12, 31);
            fechaVencimiento = finAnio.atTime(23, 59, 59);
        }

        // 6) Crear TUC
        TUC tuc = new TUC();
        tuc.setCodigo(generarCodigoTUC());
        tuc.setEstado("ACTIVO");
        tuc.setFechaEmision(fechaEmision);
        tuc.setFechaVencimiento(fechaVencimiento);
        tuc.setDuracionMeses(duracionMeses);
        tuc.setTipo(request.getTipo());
        tuc.setObservaciones("Emitido desde inspección (ficha_id=" + ficha.getIdFichaInspeccion() + ")");

        // Asignar empresa: primero desde la inspección (si existe), luego desde el vehículo
        if (ficha.getInspeccion() != null) {
            Inspeccion inspeccion = inspeccionRepository.findById(ficha.getInspeccion()).orElse(null);
            if (inspeccion != null && inspeccion.getEmpresa() != null) {
                tuc.setEmpresa(inspeccion.getEmpresa());
            }
        }
        if (tuc.getEmpresa() == null && vehiculo.getEmpresa() != null) {
            tuc.setEmpresa(vehiculo.getEmpresa());
        }
        if (tuc.getEmpresa() == null) {
            throw new IllegalStateException("No se pudo determinar la empresa para el TUC (ni de inspección ni de vehículo)");
        }

        tuc = tucRepository.save(tuc);

        // 7) Asociar TUC al vehículo
        vehiculo.setTuc(tuc);
        vehiculoRepository.save(vehiculo);

        // 8) Devolver DTO
        return convertirATUCDTO(tuc, vehiculo);
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

    private String generarCodigoTUC() {
        return "TUC-" + System.currentTimeMillis() % 1000000;
    }
}