package com.example.demo.controller;

import com.example.demo.model.ObservacionesInspeccion;
import com.example.demo.service.ObservacionesInspeccionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/observaciones-inspeccion")
public class ObservacionesInspeccionController {

    private final ObservacionesInspeccionService observacionesInspeccionService;

    public ObservacionesInspeccionController(ObservacionesInspeccionService observacionesInspeccionService) {
        this.observacionesInspeccionService = observacionesInspeccionService;
    }

    @GetMapping
    public List<ObservacionesInspeccion> listar() {
        return observacionesInspeccionService.listarTodas();
    }

    @PostMapping
    public ObservacionesInspeccion crear(@RequestBody ObservacionesInspeccion observacion) {
        return observacionesInspeccionService.guardar(observacion);
    }

    @GetMapping("/{id}")
    public ObservacionesInspeccion obtener(@PathVariable Integer id) {
        return observacionesInspeccionService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        observacionesInspeccionService.eliminar(id);
    }
}
