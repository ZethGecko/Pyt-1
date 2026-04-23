package com.example.demo.controller;

import com.example.demo.model.Observaciones;
import com.example.demo.service.ObservacionesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/observaciones")
public class ObservacionesController {

    private final ObservacionesService observacionesService;

    public ObservacionesController(ObservacionesService observacionesService) {
        this.observacionesService = observacionesService;
    }

    @GetMapping
    public List<Observaciones> listar() {
        return observacionesService.listarTodas();
    }

    @PostMapping
    public Observaciones crear(@RequestBody Observaciones observaciones) {
        return observacionesService.guardar(observaciones);
    }

    @GetMapping("/{id}")
    public Observaciones obtener(@PathVariable Integer id) {
        return observacionesService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        observacionesService.eliminar(id);
    }
}
