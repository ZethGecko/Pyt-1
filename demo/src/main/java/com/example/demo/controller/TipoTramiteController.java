package com.example.demo.controller;

import com.example.demo.dto.TipoTramiteEnriquecidoDTO;
import com.example.demo.dto.TipoTramiteResponseDTO;
import com.example.demo.dto.TupacSimpleDTO;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.TipoTramite;
import com.example.demo.service.RequisitoTUPACService;
import com.example.demo.service.TipoTramiteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tipos-tramite")
public class TipoTramiteController {

    private final TipoTramiteService service;
    private final RequisitoTUPACService requisitoService;

    public TipoTramiteController(TipoTramiteService service, RequisitoTUPACService requisitoService) {
        this.service = service;
        this.requisitoService = requisitoService;
    }

    @GetMapping
    public List<TipoTramite> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/activos")
    public List<TipoTramite> listarActivos() {
        return service.listarTodos().stream()
                .filter(t -> "ACTIVO".equals(t.getEstado()) || t.getEstado() == null)
                .collect(Collectors.toList());
    }

    @GetMapping("/enriquecidos")
    public List<TipoTramiteEnriquecidoDTO> listarEnriquecidos() {
        return service.listarTodos().stream()
                .map(this::toEnriquecidoDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/buscar")
    public List<TipoTramite> buscar(@RequestParam String termino) {
        return service.buscar(termino);
    }

    @GetMapping("/persona-natural")
    public List<TipoTramite> listarParaPersonaNatural() {
        return service.listarParaPersonaNatural();
    }

    @GetMapping("/empresa")
    public List<TipoTramite> listarParaEmpresa() {
        return service.listarParaEmpresa();
    }

    @GetMapping("/codigo/{codigo}")
    public TipoTramite obtenerPorCodigo(@PathVariable String codigo) {
        return service.buscarPorCodigo(codigo).orElse(null);
    }

    @GetMapping("/verificar/existe-codigo/{codigo}")
    public Map<String, Boolean> existeConCodigo(@PathVariable String codigo) {
        boolean existe = service.buscarPorCodigo(codigo).isPresent();
        return Map.of("existe", existe);
    }

    @GetMapping("/{id}")
    public TipoTramiteResponseDTO obtener(@PathVariable Long id) {
        TipoTramite tipo = service.buscarPorIdConTupac(id);
        if (tipo == null) {
            return null;
        }
        return toResponseDTO(tipo);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public TipoTramite crear(@RequestBody TipoTramite tipo) {
        return service.crear(tipo);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public TipoTramite actualizar(@PathVariable Long id, @RequestBody TipoTramite tipo) {
        return service.actualizar(id, tipo);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/requisitos")
    public ResponseEntity<List<RequisitoTUPAC>> obtenerRequisitos(@PathVariable Long id) {
        TipoTramite tipo = service.buscarPorIdConTupac(id);
        if (tipo == null || tipo.getTupac() == null) {
            return ResponseEntity.ok(List.of());
        }
        Long tupacId = tipo.getTupac().getIdTupac();
        List<RequisitoTUPAC> requisitos = requisitoService.listarPorTupac(tupacId);
        return ResponseEntity.ok(requisitos);
    }

    @GetMapping("/{id}/requisitos/tupac/{tupacId}")
    public ResponseEntity<List<RequisitoTUPAC>> obtenerRequisitosDeTupac(@PathVariable Long id, @PathVariable Long tupacId) {
        List<RequisitoTUPAC> requisitos = requisitoService.listarPorTupac(tupacId);
        return ResponseEntity.ok(requisitos);
    }

    @PostMapping("/{id}/requisitos")
    public ResponseEntity<Void> asociarRequisitos(@PathVariable Long id, @RequestBody List<Long> requisitoIds) {
        TipoTramite tipo = service.buscarPorId(id).orElse(null);
        if (tipo == null) {
            return ResponseEntity.notFound().build();
        }

        // Convertir lista de IDs a string
        String requisitosStr = requisitoIds.stream()
                .map(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));
        tipo.setRequisitosIds(requisitosStr);
        service.actualizar(id, tipo);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/requisitos/aplicar-todos")
    public ResponseEntity<Void> aplicarTodosLosRequisitosDelTupac(@PathVariable Long id) {
        TipoTramite tipo = service.buscarPorIdConTupac(id);
        if (tipo == null || tipo.getTupac() == null) {
            return ResponseEntity.notFound().build();
        }

        Long tupacId = tipo.getTupac().getIdTupac();
        List<RequisitoTUPAC> requisitos = requisitoService.listarPorTupac(tupacId);

        List<Long> requisitoIds = requisitos.stream()
                .map(RequisitoTUPAC::getId)
                .collect(java.util.stream.Collectors.toList());

        String requisitosStr = requisitoIds.stream()
                .map(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));

        tipo.setRequisitosIds(requisitosStr);
        service.actualizar(id, tipo);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/requisitos/{requisitoId}")
    public ResponseEntity<Void> eliminarRequisito(@PathVariable Long id, @PathVariable Long requisitoId) {
        TipoTramite tipo = service.buscarPorId(id).orElse(null);
        if (tipo == null) {
            return ResponseEntity.notFound().build();
        }

        // Obtener lista actual de requisitos
        List<Long> currentIds = new java.util.ArrayList<>();
        if (tipo.getRequisitosIds() != null) {
            String[] parts = tipo.getRequisitosIds().split(",");
            for (String part : parts) {
                if (!part.trim().isEmpty()) {
                    try {
                        currentIds.add(Long.parseLong(part.trim()));
                    } catch (NumberFormatException e) {
                        // Ignorar IDs inválidos
                    }
                }
            }
        }

        // Remover el requisito específico
        currentIds.remove(requisitoId);

        // Actualizar el string
        String requisitosStr = currentIds.stream()
                .map(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));

        tipo.setRequisitosIds(requisitosStr);
        service.actualizar(id, tipo);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/requisitos")
    public ResponseEntity<Void> eliminarTodosLosRequisitos(@PathVariable Long id) {
        TipoTramite tipo = service.buscarPorId(id).orElse(null);
        if (tipo == null) {
            return ResponseEntity.notFound().build();
        }

        tipo.setRequisitosIds("");
        service.actualizar(id, tipo);
        return ResponseEntity.ok().build();
    }

    private TipoTramiteEnriquecidoDTO toEnriquecidoDTO(TipoTramite t) {
        if (t == null) return null;
        TipoTramiteEnriquecidoDTO dto = new TipoTramiteEnriquecidoDTO();
        dto.setId(t.getIdTipoTramite());
        dto.setCodigo(t.getCodigo());
        dto.setDescripcion(t.getDescripcion());
        dto.setDiasDescargo(t.getDiasDescargo());
        // Convertir requisitosIds string a array de numbers
        if (t.getRequisitosIds() != null) {
            try {
                String[] parts = t.getRequisitosIds().split(",");
                List<Long> ids = new java.util.ArrayList<>();
                for (String part : parts) {
                    if (!part.trim().isEmpty()) {
                        ids.add(Long.parseLong(part.trim()));
                    }
                }
                dto.setRequisitosIds(ids);
            } catch (NumberFormatException e) {
                dto.setRequisitosIds(List.of());
            }
        } else {
            dto.setRequisitosIds(List.of());
        }
        if (t.getTupac() != null) {
            dto.setTupacId(t.getTupac().getIdTupac());
            dto.setTupacCodigo(t.getTupac().getCodigo());
            dto.setTupacDescripcion(t.getTupac().getDescripcion());
            dto.setTupacEstado(t.getTupac().getEstado());
        }
        dto.setTotalTramites(0);
        dto.setTramitesPendientes(0);
        dto.setTramitesRechazados(0);
        dto.setTotalEtapas(0);
        dto.setTotalRequisitos(dto.getRequisitosIds() != null ? dto.getRequisitosIds().size() : 0);
        return dto;
    }

    private TipoTramiteResponseDTO toResponseDTO(TipoTramite t) {
        if (t == null) return null;
        TipoTramiteResponseDTO dto = new TipoTramiteResponseDTO();
        dto.setId(t.getIdTipoTramite());
        dto.setCodigo(t.getCodigo());
        dto.setDescripcion(t.getDescripcion());
        dto.setDiasDescargo(t.getDiasDescargo());
        // Tupac
        if (t.getTupac() != null) {
            TupacSimpleDTO tupacDto = new TupacSimpleDTO();
            tupacDto.setId(t.getTupac().getIdTupac());
            tupacDto.setCodigo(t.getTupac().getCodigo());
            tupacDto.setNombre(t.getTupac().getDescripcion());
            tupacDto.setCategoria(t.getTupac().getCategoria());
            tupacDto.setDescripcion(t.getTupac().getDescripcion());
            dto.setTupac(tupacDto);
        }
        return dto;
    }
}