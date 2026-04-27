package com.example.demo.controller;

import com.example.demo.dto.VehiculoCreateRequest;
import com.example.demo.dto.VehiculoResponseDTO;
import com.example.demo.dto.VehiculoUpdateRequest;
import com.example.demo.model.Vehiculo;
import com.example.demo.service.VehiculoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    @GetMapping
    public List<VehiculoResponseDTO> listarTodos() {
        return vehiculoService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/activos")
    public List<VehiculoResponseDTO> listarActivos() {
        return vehiculoService.listarActivos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehiculoResponseDTO> obtener(@PathVariable Long id) {
        return vehiculoService.buscarPorIdConAsociaciones(id)
                .map(vehiculo -> ResponseEntity.ok(toResponseDTO(vehiculo)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/placa/{placa}")
    public ResponseEntity<VehiculoResponseDTO> obtenerPorPlaca(@PathVariable String placa) {
        return vehiculoService.buscarPorPlaca(placa)
                .map(vehiculo -> ResponseEntity.ok(toResponseDTO(vehiculo)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public List<VehiculoResponseDTO> buscar(@RequestParam String termino) {
        return vehiculoService.buscarPorTermino(termino).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/empresa/{empresaId}")
    public List<VehiculoResponseDTO> listarPorEmpresa(@PathVariable Long empresaId) {
        return vehiculoService.listarPorEmpresa(empresaId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/subtipo-transporte/{subtipoId}")
    public List<VehiculoResponseDTO> listarPorSubtipoTransporte(@PathVariable Long subtipoId) {
        return vehiculoService.listarPorSubtipoTransporte(subtipoId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/gerente/{gerenteId}")
    public List<VehiculoResponseDTO> listarPorGerente(@PathVariable Long gerenteId) {
        return vehiculoService.listarPorGerente(gerenteId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public VehiculoResponseDTO crear(@RequestBody VehiculoCreateRequest request) {
        Vehiculo vehiculo = vehiculoService.crearDesdeDTO(request);
        return toResponseDTO(vehiculo);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<VehiculoResponseDTO> actualizar(@PathVariable Long id, @RequestBody VehiculoUpdateRequest request) {
        try {
            Vehiculo actualizado = vehiculoService.actualizarDesdeDTO(id, request);
            return ResponseEntity.ok(toResponseDTO(actualizado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            vehiculoService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== VALIDACIONES ==========

    @GetMapping("/validar/placa/{placa}")
    public Map<String, Boolean> validarPlaca(@PathVariable String placa, @RequestParam(required = false) Long idExcluir) {
        boolean disponible = !vehiculoService.existePorPlaca(placa, idExcluir != null ? idExcluir : -1L);
        return Map.of("disponible", disponible);
    }

    @GetMapping("/validar/motor/{numeroMotor}")
    public Map<String, Boolean> validarNumeroMotor(@PathVariable String numeroMotor, @RequestParam(required = false) Long idExcluir) {
        boolean disponible = !vehiculoService.existePorNumeroMotor(numeroMotor, idExcluir != null ? idExcluir : -1L);
        return Map.of("disponible", disponible);
    }

    @GetMapping("/validar/chasis/{numeroChasis}")
    public Map<String, Boolean> validarNumeroChasis(@PathVariable String numeroChasis, @RequestParam(required = false) Long idExcluir) {
        boolean disponible = !vehiculoService.existePorNumeroChasis(numeroChasis, idExcluir != null ? idExcluir : -1L);
        return Map.of("disponible", disponible);
    }

    @GetMapping("/validar/placa-existe/{placa}")
    public Map<String, Boolean> existeConPlaca(@PathVariable String placa) {
        boolean existe = vehiculoService.existePorPlaca(placa, -1L);
        return Map.of("existe", existe);
    }

    // ========== ESTADÍSTICAS ==========

    @GetMapping("/estadisticas/empresa/{empresaId}")
    public Map<String, Long> estadisticasPorEmpresa(@PathVariable Long empresaId) {
        Long total = vehiculoService.contarPorEmpresa(empresaId);
        return Map.of("totalVehiculos", total != null ? total : 0L);
    }

    // ========== ESTADOS ==========

    @GetMapping("/habilitados")
    public List<VehiculoResponseDTO> listarHabilitados() {
        return vehiculoService.listarTodos().stream()
                .filter(v -> "HABILITADO".equals(v.getEstado()))
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/habilitar")
    public ResponseEntity<VehiculoResponseDTO> habilitar(@PathVariable Long id) {
        try {
            Vehiculo vehiculo = vehiculoService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Vehiculo no encontrado"));
            vehiculo.setEstado("HABILITADO");
            vehiculo.setFechaActualizacion(LocalDateTime.now());
            Vehiculo actualizado = vehiculoService.guardar(vehiculo);
            return ResponseEntity.ok(toResponseDTO(actualizado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/deshabilitar")
    public ResponseEntity<VehiculoResponseDTO> deshabilitar(@PathVariable Long id) {
        try {
            Vehiculo vehiculo = vehiculoService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Vehiculo no encontrado"));
            vehiculo.setEstado("DESHABILITADO");
            vehiculo.setFechaActualizacion(LocalDateTime.now());
            Vehiculo actualizado = vehiculoService.guardar(vehiculo);
            return ResponseEntity.ok(toResponseDTO(actualizado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private VehiculoResponseDTO toResponseDTO(Vehiculo v) {
        if (v == null) return null;

        // Información de empresa
        Long empresaId = null;
        String empresaNombre = null;
        String empresaRuc = null;
        if (v.getEmpresa() != null) {
            empresaId = (long) v.getEmpresa().getIdEmpresa();
            empresaNombre = v.getEmpresa().getNombre();
            empresaRuc = v.getEmpresa().getRuc();
        }

        // Información de subtipo transporte y tipo transporte
        Long subtipoTransporteId = null;
        String subtipoTransporteNombre = null;
        Long tipoTransporteId = null;
        String tipoTransporteNombre = null;
        Long categoriaTransporteId = null;
        String categoriaTransporteNombre = null;
        if (v.getSubtipoTransporte() != null) {
            subtipoTransporteId = v.getSubtipoTransporte().getIdSubtipoTransporte();
            subtipoTransporteNombre = v.getSubtipoTransporte().getNombre();
            if (v.getSubtipoTransporte().getTipoTransporte() != null) {
                tipoTransporteId = v.getSubtipoTransporte().getTipoTransporte().getIdTipoTransporte();
                tipoTransporteNombre = v.getSubtipoTransporte().getTipoTransporte().getNombre();
                if (v.getSubtipoTransporte().getTipoTransporte().getCategoriaTransporte() != null) {
                    categoriaTransporteId = v.getSubtipoTransporte().getTipoTransporte().getCategoriaTransporte().getIdCategoriaTransporte();
                    categoriaTransporteNombre = v.getSubtipoTransporte().getTipoTransporte().getCategoriaTransporte().getNombre();
                }
            }
        }

        // Información de gerente responsable
        Long gerenteResponsableId = null;
        String gerenteResponsableNombre = null;
        if (v.getGerenteResponsable() != null) {
            gerenteResponsableId = v.getGerenteResponsable().getIdGerente();
            gerenteResponsableNombre = v.getGerenteResponsable().getNombre();
        }

        // TUC vinculado
        LocalDateTime fechaVencimientoTUC = null;
        if (v.getTuc() != null) {
            fechaVencimientoTUC = v.getTuc().getFechaVencimiento();
        }

        VehiculoResponseDTO dto = new VehiculoResponseDTO(
                v.getIdVehiculo(),
                v.getPlaca(),
                v.getNumeroMotor(),
                v.getNumeroChasis(),
                v.getMarca(),
                v.getModelo(),
                v.getAnioFabricacion(),
                v.getColor(),
                v.getCapacidadPasajeros(),
                v.getCapacidadCarga(),
                v.getEstado(),
                v.getObservaciones(),
                v.getFechaRegistro(),
                v.getFechaActualizacion(),
                subtipoTransporteId,
                subtipoTransporteNombre,
                gerenteResponsableId,
                gerenteResponsableNombre
        );

        // Campos adicionales
        dto.setCategoria(v.getCategoria());
        dto.setPesoNeto(v.getPesoNeto());
        dto.setEstadoTecnico(v.getEstadoTecnico());
        dto.setFechaHabilitacion(v.getFechaHabilitacion());
        dto.setFechaVencimientoTUC(fechaVencimientoTUC);
        dto.setTipoTransporteId(tipoTransporteId);
        dto.setTipoTransporteNombre(tipoTransporteNombre);
         dto.setCategoriaTransporteId(categoriaTransporteId);
         dto.setCategoriaTransporteNombre(categoriaTransporteNombre);
         dto.setActivo("ACTIVO".equals(v.getEstado()));
         dto.setTotalTucs(v.getTuc() != null ? 1 : 0);
        dto.setInspeccionesCount(v.getInspecciones() != null ? v.getInspecciones().size() : 0);

        // Establecer campos planos de empresa para que getEmpresa() los retorne
        dto.setEmpresaId(empresaId);
        dto.setEmpresaNombre(empresaNombre);
        dto.setEmpresaRuc(empresaRuc);

        return dto;
    }

    // Método para listar enriquecidos
}