package com.example.demo.controller;

import com.example.demo.model.Inspeccion;
import com.example.demo.service.InspeccionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspecciones")
public class InspeccionController {

    private final InspeccionService inspeccionService;

    public InspeccionController(InspeccionService inspeccionService) {
        this.inspeccionService = inspeccionService;
    }

    @GetMapping
    public List<Inspeccion> listar() {
        return inspeccionService.listarTodas();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public Inspeccion crear(@RequestBody Inspeccion inspeccion) {
        return inspeccionService.guardar(inspeccion);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        inspeccionService.eliminar(id);
    }

    @GetMapping("/{id}")
    public Inspeccion obtener(@PathVariable Integer id) {
        return inspeccionService.buscarPorId(id);
    }
}
