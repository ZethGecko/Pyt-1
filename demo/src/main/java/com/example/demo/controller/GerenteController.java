package com.example.demo.controller;

import com.example.demo.model.Gerente;
import com.example.demo.service.GerenteService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gerentes")
public class GerenteController {

    private final GerenteService gerenteService;

    public GerenteController(GerenteService gerenteService) {
        this.gerenteService = gerenteService;
    }

    @GetMapping
    public List<Gerente> listar() {
        return gerenteService.listarTodos();
    }

    @GetMapping("/activos")
    public List<Gerente> listarActivos() {
        return gerenteService.listarTodos().stream()
                .filter(Gerente::getActivo)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Gerente crear(@RequestBody Gerente gerente) {
        return gerenteService.guardar(gerente);
    }

    @GetMapping("/{id}")
    public Gerente obtener(@PathVariable Integer id) {
        return gerenteService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        gerenteService.eliminar(id);
    }
}
