package com.example.demo.controller;

import com.example.demo.dto.CategoriaTransporteResponseDTO;
import com.example.demo.model.CategoriaTransporte;
import com.example.demo.service.CategoriaTransporteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categorias-transporte")
public class CategoriaTransporteController {
    private final CategoriaTransporteService service;
    public CategoriaTransporteController(CategoriaTransporteService service) { this.service = service; }

    @GetMapping
    public List<CategoriaTransporteResponseDTO> listar() {
        return service.listarTodos().stream()
                .map(cat -> new CategoriaTransporteResponseDTO(
                        cat.getIdCategoriaTransporte(),
                        cat.getNombre()
                ))
                .collect(Collectors.toList());
    }

    @PostMapping
    public CategoriaTransporteResponseDTO crear(@RequestBody CategoriaTransporte c) {
        CategoriaTransporte guardado = service.guardar(c);
        return new CategoriaTransporteResponseDTO(guardado.getIdCategoriaTransporte(), guardado.getNombre());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaTransporteResponseDTO> obtener(@PathVariable Long id) {
        CategoriaTransporte cat = service.buscarPorId(id);
        if (cat == null) {
            return ResponseEntity.notFound().build();
        }
        CategoriaTransporteResponseDTO dto = new CategoriaTransporteResponseDTO(
                cat.getIdCategoriaTransporte(),
                cat.getNombre()
        );
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaTransporteResponseDTO> actualizar(@PathVariable Long id, @RequestBody CategoriaTransporte categoria) {
        categoria.setIdCategoriaTransporte(id);
        CategoriaTransporte guardado = service.guardar(categoria);
        CategoriaTransporteResponseDTO dto = new CategoriaTransporteResponseDTO(
                guardado.getIdCategoriaTransporte(),
                guardado.getNombre()
        );
        return ResponseEntity.ok(dto);
    }
}
