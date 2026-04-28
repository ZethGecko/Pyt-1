package com.example.demo.controller;

import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.service.FichaInspeccionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fichas-inspeccion")
public class FichaInspeccionController {

    private final FichaInspeccionService fichaInspeccionService;

    public FichaInspeccionController(FichaInspeccionService fichaInspeccionService) {
        this.fichaInspeccionService = fichaInspeccionService;
    }

    @GetMapping
    public List<FichaInspeccionResponseDTO> listar() {
        return fichaInspeccionService.listarTodas();
    }

    /**
     * Lista todas las fichas de inspección asociadas a un trámite.
     * Recorre VehiculoApto → FichaInspeccion.
     */
    @GetMapping("/tramite/{tramiteId}")
    public List<FichaInspeccionResponseDTO> listarPorTramite(@PathVariable Long tramiteId) {
        return fichaInspeccionService.listarPorTramite(tramiteId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FichaInspeccionResponseDTO> crear(@RequestBody FichaInspeccionCreateRequestDTO request) {
        // Para creación directa (no recomendado). Usar POST /inspecciones/{id}/fichas en su lugar.
        FichaInspeccionResponseDTO creado = fichaInspeccionService.guardar(request);
        return ResponseEntity.ok(creado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FichaInspeccionResponseDTO> obtener(@PathVariable Long id) {
        FichaInspeccionResponseDTO ficha = fichaInspeccionService.buscarPorId(id);
        return ficha != null ? ResponseEntity.ok(ficha) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public void eliminar(@PathVariable Long id) {
        fichaInspeccionService.eliminar(id);
    }
}
