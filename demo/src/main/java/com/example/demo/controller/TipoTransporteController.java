package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CategoriaTransporteResponseDTO;
import com.example.demo.dto.SubtipoTransporteResponseDTO;
import com.example.demo.dto.TipoTransporteResponseDTO;
import com.example.demo.model.TipoTransporte;
import com.example.demo.service.TipoTransporteService;

@RestController
@RequestMapping("/api/tipos-transporte")
public class TipoTransporteController {

    private final TipoTransporteService tipoTransporteService;

    public TipoTransporteController(TipoTransporteService tipoTransporteService) {
        this.tipoTransporteService = tipoTransporteService;
    }

    @GetMapping
    public List<TipoTransporteResponseDTO> listarTodos() {
        return tipoTransporteService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/enriquecidos")
    public List<TipoTransporteResponseDTO> listarEnriquecidos() {
        return tipoTransporteService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public TipoTransporteResponseDTO obtener(@PathVariable Long id) {
        return toResponseDTO(tipoTransporteService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public TipoTransporteResponseDTO crear(@RequestBody TipoTransporte tipo) {
        return toResponseDTO(tipoTransporteService.guardar(tipo));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public TipoTransporteResponseDTO actualizar(@PathVariable Long id, @RequestBody TipoTransporte tipo) {
        tipo.setIdTipoTransporte(id);
        return toResponseDTO(tipoTransporteService.guardar(tipo));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        tipoTransporteService.eliminar(id);
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<TipoTransporteResponseDTO> listarPorCategoria(@PathVariable Long categoriaId) {
        return tipoTransporteService.listarPorCategoria(categoriaId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private TipoTransporteResponseDTO toResponseDTO(TipoTransporte t) {
        if (t == null) return null;
        
        // Convertir categoría a DTO
        CategoriaTransporteResponseDTO catDto = null;
        if (t.getCategoriaTransporte() != null) {
            catDto = new CategoriaTransporteResponseDTO(
                t.getCategoriaTransporte().getIdCategoriaTransporte(),
                t.getCategoriaTransporte().getNombre()
            );
        }
        
        Long categoriaId = t.getCategoriaTransporte() != null ? t.getCategoriaTransporte().getIdCategoriaTransporte() : null;
        
        // Convertir subtipos
        List<SubtipoTransporteResponseDTO> subtiposDto = null;
        if (t.getSubtipos() != null) {
            subtiposDto = t.getSubtipos().stream().map(s -> {
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
            }).collect(Collectors.toList());
        }
        
        return new TipoTransporteResponseDTO(
                t.getIdTipoTransporte(),
                t.getNombre(),
                categoriaId,
                catDto,
                subtiposDto
        );
    }
}