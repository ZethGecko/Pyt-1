package com.example.demo.controller;

import com.example.demo.dto.SubtipoTransporteResponseDTO;
import com.example.demo.model.SubtipoTransporte;
import com.example.demo.model.TipoTransporte;
import com.example.demo.repository.TipoTransporteRepository;
import com.example.demo.service.SubtipoTransporteService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subtipos-transporte")
public class SubtipoTransporteController {
    private final SubtipoTransporteService subtipoTransporteService;
    private final TipoTransporteRepository tipoTransporteRepository;

    public SubtipoTransporteController(SubtipoTransporteService subtipoTransporteService, 
                                        TipoTransporteRepository tipoTransporteRepository) {
        this.subtipoTransporteService = subtipoTransporteService;
        this.tipoTransporteRepository = tipoTransporteRepository;
    }

    @GetMapping
    public List<SubtipoTransporteResponseDTO> listar() {
        return subtipoTransporteService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public SubtipoTransporteResponseDTO obtener(@PathVariable Long id) {
        SubtipoTransporte s = subtipoTransporteService.buscarPorId(id);
        if (s == null) return null;
        return toResponseDTO(s);
    }

    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    @PostMapping
    public SubtipoTransporteResponseDTO crear(@RequestBody Map<String, Object> payload) {
        System.out.println("[SubtipoTransporteController] Recibido payload: " + payload);

        String nombre = (String) payload.get("nombre");
        System.out.println("[SubtipoTransporteController] Nombre extraído: " + nombre);

        // Intentar obtener el ID del tipo de transporte de diferentes formas
        Integer tipoTransporteId = null;

        // Primero intentar tipoTransporteId directo
        Object tipoTransporteIdObj = payload.get("tipoTransporteId");
        if (tipoTransporteIdObj != null) {
            if (tipoTransporteIdObj instanceof Integer) {
                tipoTransporteId = (Integer) tipoTransporteIdObj;
            } else if (tipoTransporteIdObj instanceof Number) {
                tipoTransporteId = ((Number) tipoTransporteIdObj).intValue();
            } else if (tipoTransporteIdObj instanceof String) {
                try {
                    tipoTransporteId = Integer.parseInt((String) tipoTransporteIdObj);
                } catch (NumberFormatException e) {
                    System.out.println("[SubtipoTransporteController] No se pudo parsear tipoTransporteId: " + tipoTransporteIdObj);
                }
            }
            System.out.println("[SubtipoTransporteController] tipoTransporteId encontrado: " + tipoTransporteId);
        }

        // Si no se encontró, intentar desde tipoTransporte.id o tipoTransporte.idTipoTransporte
        if (tipoTransporteId == null) {
            Object tipoTransporteObj = payload.get("tipoTransporte");
            System.out.println("[SubtipoTransporteController] tipoTransporte object: " + tipoTransporteObj);
            if (tipoTransporteObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> tipoTransporteMap = (Map<String, Object>) tipoTransporteObj;

                // Intentar primero "id"
                Object idObj = tipoTransporteMap.get("id");
                System.out.println("[SubtipoTransporteController] ID desde tipoTransporte.id: " + idObj);

                if (idObj == null) {
                    // Si no hay "id", intentar "idTipoTransporte"
                    idObj = tipoTransporteMap.get("idTipoTransporte");
                    System.out.println("[SubtipoTransporteController] ID desde tipoTransporte.idTipoTransporte: " + idObj);
                }

                if (idObj instanceof Integer) {
                    tipoTransporteId = (Integer) idObj;
                } else if (idObj instanceof Number) {
                    tipoTransporteId = ((Number) idObj).intValue();
                } else if (idObj instanceof String) {
                    try {
                        tipoTransporteId = Integer.parseInt((String) idObj);
                    } catch (NumberFormatException e) {
                        System.out.println("[SubtipoTransporteController] No se pudo parsear ID desde tipoTransporte: " + idObj);
                    }
                }
            }
        }

        System.out.println("[SubtipoTransporteController] TipoTransporte ID final: " + tipoTransporteId);

        // Validar datos
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es requerido");
        }
        if (tipoTransporteId == null) {
            throw new IllegalArgumentException("El ID del tipo de transporte es requerido. Payload recibido: " + payload);
        }

        final Integer finalTipoTransporteId = tipoTransporteId;

        // Cargar la entidad TipoTransporte desde la base de datos
        TipoTransporte tipoTransporte = tipoTransporteRepository.findById(finalTipoTransporteId.longValue())
                .orElseThrow(() -> new IllegalArgumentException("TipoTransporte no encontrado con ID: " + finalTipoTransporteId));

        // Crear la entidad SubtipoTransporte
        SubtipoTransporte subtipo = new SubtipoTransporte();
        subtipo.setNombre(nombre);
        subtipo.setTipoTransporte(tipoTransporte);

        System.out.println("[SubtipoTransporteController] SubtipoTransporte creado: " + subtipo);
        System.out.println("[SubtipoTransporteController] TipoTransporte asignado: " + tipoTransporte);

        SubtipoTransporte saved = subtipoTransporteService.guardar(subtipo);
        System.out.println("[SubtipoTransporteController] SubtipoTransporte guardado: " + saved);

        return toResponseDTO(saved);
    }

    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    @PutMapping("/{id}")
    public SubtipoTransporteResponseDTO actualizar(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        System.out.println("[SubtipoTransporteController] Actualizar - Recibido payload: " + payload);

        SubtipoTransporte existing = subtipoTransporteService.buscarPorId(id);
        if (existing == null) {
            throw new IllegalArgumentException("SubtipoTransporte no encontrado con ID: " + id);
        }

        // Actualizar nombre si se proporciona
        String nombre = (String) payload.get("nombre");
        if (nombre != null && !nombre.trim().isEmpty()) {
            existing.setNombre(nombre);
        }

        // Actualizar tipoTransporte si se proporciona
        Integer tipoTransporteId = null;
        Object tipoTransporteIdObj = payload.get("tipoTransporteId");
        if (tipoTransporteIdObj instanceof Integer) {
            tipoTransporteId = (Integer) tipoTransporteIdObj;
        } else if (tipoTransporteIdObj instanceof Number) {
            tipoTransporteId = ((Number) tipoTransporteIdObj).intValue();
        }

        if (tipoTransporteId == null) {
            // Intentar desde tipoTransporte.idTipoTransporte
            @SuppressWarnings("unchecked")
            Map<String, Object> tipoTransporteMap = (Map<String, Object>) payload.get("tipoTransporte");
            if (tipoTransporteMap != null) {
                Object idObj = tipoTransporteMap.get("idTipoTransporte");
                if (idObj instanceof Integer) {
                    tipoTransporteId = (Integer) idObj;
                } else if (idObj instanceof Number) {
                    tipoTransporteId = ((Number) idObj).intValue();
                }
            }
        }

        final Integer finalTipoTransporteId = tipoTransporteId;
        if (finalTipoTransporteId != null) {
            TipoTransporte tipoTransporte = tipoTransporteRepository.findById(finalTipoTransporteId.longValue())
                    .orElseThrow(() -> new IllegalArgumentException("TipoTransporte no encontrado con ID: " + finalTipoTransporteId));
            existing.setTipoTransporte(tipoTransporte);
        }

        System.out.println("[SubtipoTransporteController] Actualizando subtipo: " + existing);
        SubtipoTransporte updated = subtipoTransporteService.guardar(existing);
        System.out.println("[SubtipoTransporteController] Subtipo actualizado: " + updated);

        return toResponseDTO(updated);
    }

    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        System.out.println("[SubtipoTransporteController] Eliminando subtipo con ID: " + id);
        subtipoTransporteService.eliminar(id);
        System.out.println("[SubtipoTransporteController] Subtipo eliminado");
    }

    @GetMapping("/tipo/{tipoId}")
    public List<SubtipoTransporteResponseDTO> listarPorTipo(@PathVariable Long tipoId) {
        return subtipoTransporteService.listarPorTipoTransporte(tipoId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private SubtipoTransporteResponseDTO toResponseDTO(SubtipoTransporte s) {
        Long tipoId = null;
        String tipoNombre = null;
        if (s.getTipoTransporte() != null) {
            tipoId = s.getTipoTransporte().getIdTipoTransporte();
            tipoNombre = s.getTipoTransporte().getNombre();
        }
        return new SubtipoTransporteResponseDTO(
                s.getIdSubtipoTransporte(),
                s.getNombre(),
                tipoId,
                tipoNombre
        );
    }
}
