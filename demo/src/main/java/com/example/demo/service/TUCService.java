package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.EmisionTUCRequestDTO;
import com.example.demo.dto.EmpresaHabilitadaDTO;
import com.example.demo.dto.TUCDTO;
import com.example.demo.dto.VehiculoTucDTO;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.TUC;
import com.example.demo.model.Vehiculo;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.TUCRepository;
import com.example.demo.repository.VehiculoRepository;

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

     return crearTUCDesdeFicha(ficha, request.getTipo());
     }

     /**
      * Emite un TUC para un vehículo a partir de su ficha aprobada más reciente.
      * Útil para la vista de empresas donde se selecciona directamente el vehículo.
      */
     @Transactional
     public TUCDTO emitirTUCDesdeVehiculo(Long vehiculoId, String tipo) {
         if (tipo == null || (!tipo.equals("12_MESES") && !tipo.equals("HASTA_FIN_ANIO"))) {
             throw new IllegalArgumentException("Tipo de TUC inválido. Use '12_MESES' o 'HASTA_FIN_ANIO'");
         }

         // Obtener la ficha aprobada más reciente del vehículo
         List<FichaInspeccion> fichas = fichaRepository.findApprovedByVehiculoOrderByFechaCreacionDesc(vehiculoId);
         if (fichas == null || fichas.isEmpty()) {
             throw new IllegalStateException("El vehículo no tiene una ficha de inspección aprobada");
         }
         FichaInspeccion ficha = fichas.get(0);

         return crearTUCDesdeFicha(ficha, tipo);
     }

     /**
      * Lógica compartida para crear el TUC a partir de una ficha aprobada.
      * Asume que la ficha ya ha sido validada (aprobada, existe, vehículo tiene TUC activo, etc.)
      */
     private TUCDTO crearTUCDesdeFicha(FichaInspeccion ficha, String tipo) {
         // 1) Obtener vehículo
         Long vehiculoId = ficha.getVehiculo();
         if (vehiculoId == null) {
             throw new IllegalStateException("La ficha no tiene asociado un vehículo");
         }
         Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                 .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado con id: " + vehiculoId));

         // 2) Validar que el vehículo no tenga un TUC activo
         LocalDateTime now = LocalDateTime.now();
         List<TUC> tucsActivos = tucRepository.findByVehiculosIdVehiculoAndFechaVencimientoAfter(vehiculoId, now);
         if (tucsActivos != null && !tucsActivos.isEmpty()) {
             throw new IllegalStateException("El vehículo ya tiene un TUC activo");
         }

         // 3) Calcular fecha de vencimiento según tipo
         LocalDateTime fechaEmision = LocalDateTime.now();
         LocalDateTime fechaVencimiento;
         if ("HASTA_FIN_ANIO".equals(tipo)) {
             fechaVencimiento = fechaEmision.withDayOfYear(31).withMonth(12);
         } else { // 12_MESES
             fechaVencimiento = fechaEmision.plusMonths(12);
         }

         // 4) Generar código único
         String codigo = generarCodigoTUC();

         // 5) Crear y guardar TUC
         TUC tuc = new TUC();
         tuc.setCodigo(codigo);
         tuc.setEstado("ACTIVO");
         tuc.setFechaEmision(fechaEmision);
         tuc.setFechaVencimiento(fechaVencimiento);
         tuc.setDuracionMeses("12_MESES".equals(tipo) ? 12 : 12);
         tuc.setTipo(tipo);
          tuc.setObservaciones("TUC emitido desde ficha de inspección ID: " + ficha.getIdFichaInspeccion());

         // Asociar vehículo
         tuc.getVehiculos().add(vehiculo);

         TUC guardado = tucRepository.save(tuc);

         // 6) Devolver DTO
          return convertirATUCDTO(guardado, vehiculo);
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