package com.example.demo.controller;

import com.example.demo.dto.PuntoRutaResponseDTO;
import com.example.demo.model.PuntoRuta;
import com.example.demo.service.PuntoRutaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/puntos-ruta")
public class PuntoRutaController {

    private final PuntoRutaService puntoRutaService;

    public PuntoRutaController(PuntoRutaService puntoRutaService) {
        this.puntoRutaService = puntoRutaService;
    }

    @GetMapping
    public List<PuntoRutaResponseDTO> listarTodos() {
        return puntoRutaService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/activos")
    public List<PuntoRutaResponseDTO> listarActivos() {
        return puntoRutaService.listarActivos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PuntoRutaResponseDTO> obtener(@PathVariable Long id) {
        return puntoRutaService.buscarPorId(id)
                .map(punto -> ResponseEntity.ok(toResponseDTO(punto)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public List<PuntoRutaResponseDTO> buscar(@RequestParam String termino) {
        return puntoRutaService.buscarPorTermino(termino).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/ruta/{rutaId}")
    public List<PuntoRutaResponseDTO> listarPorRuta(@PathVariable Long rutaId) {
        return puntoRutaService.listarPorRuta(rutaId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/empresa/{empresaId}")
    public List<PuntoRutaResponseDTO> listarPorEmpresa(@PathVariable Long empresaId) {
        return puntoRutaService.listarPorEmpresa(empresaId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/tipo/{tipo}")
    public List<PuntoRutaResponseDTO> listarPorTipo(@PathVariable String tipo) {
        return puntoRutaService.listarPorTipo(tipo).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public PuntoRutaResponseDTO crear(@RequestBody PuntoRuta puntoRuta) {
        return toResponseDTO(puntoRutaService.guardar(puntoRuta));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<PuntoRutaResponseDTO> actualizar(@PathVariable Long id, @RequestBody PuntoRuta puntoRuta) {
        puntoRuta.setIdPuntoRuta(id);
        try {
            PuntoRuta actualizado = puntoRutaService.guardar(puntoRuta);
            return ResponseEntity.ok(toResponseDTO(actualizado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            puntoRutaService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== VALIDACIONES ==========

    @GetMapping("/validar/nombre")
    public Map<String, Boolean> validarNombre(@RequestParam String nombre,
                                            @RequestParam Long rutaId,
                                            @RequestParam(required = false) Long idExcluir) {
        Long idExcluirValue = idExcluir != null ? idExcluir : -1L;
        boolean disponible = !puntoRutaService.existePorNombreEnRuta(nombre, rutaId, idExcluirValue);
        return Map.of("disponible", disponible);
    }

    private PuntoRutaResponseDTO toResponseDTO(PuntoRuta p) {
        if (p == null) return null;

        // Información de ruta
        Long rutaId = null;
        String rutaNombre = null;
        String rutaCodigo = null;
        if (p.getRuta() != null) {
            rutaId = p.getRuta().getIdRuta();
            rutaNombre = p.getRuta().getNombre();
            rutaCodigo = p.getRuta().getCodigo();
        }

        // Información de empresa
        Long empresaId = null;
        String empresaNombre = null;
        if (p.getEmpresa() != null) {
            empresaId = p.getEmpresa().getIdEmpresa();
            empresaNombre = p.getEmpresa().getNombre();
        }

        // Información de usuario registra
        Long usuarioRegistraId = null;
        String usuarioRegistraNombre = null;
        if (p.getUsuarioRegistra() != null) {
            usuarioRegistraId = p.getUsuarioRegistra().getIdUsuarios();
            usuarioRegistraNombre = p.getUsuarioRegistra().getUsername();
        }

        return new PuntoRutaResponseDTO(
                p.getIdPuntoRuta(),
                p.getNombre(),
                p.getDescripcion(),
                p.getLatitud(),
                p.getLongitud(),
                p.getOrden(),
                p.getTipo(),
                p.getEstado(),
                p.getFechaRegistro(),
                p.getFechaActualizacion(),
                rutaId,
                rutaNombre,
                rutaCodigo,
                empresaId,
                empresaNombre,
                usuarioRegistraId,
                usuarioRegistraNombre
        );
    }
}