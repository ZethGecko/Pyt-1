package com.example.demo.controller;

import com.example.demo.model.FichaInspeccion;
import com.example.demo.service.FichaInspeccionService;
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
    public List<FichaInspeccion> listar() {
        return fichaInspeccionService.listarTodas();
    }

    @PostMapping
    public FichaInspeccion crear(@RequestBody FichaInspeccion fichaInspeccion) {
        return fichaInspeccionService.guardar(fichaInspeccion);
    }

    @GetMapping("/{id}")
    public FichaInspeccion obtener(@PathVariable Long id) {
        return fichaInspeccionService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        fichaInspeccionService.eliminar(id);
    }
}
