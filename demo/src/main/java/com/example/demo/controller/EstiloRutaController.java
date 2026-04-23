package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.EstiloRuta;
import com.example.demo.service.EstiloRutaService;

import java.util.List;

@RestController
@RequestMapping("/api/estilos-ruta")
public class EstiloRutaController {

    private final EstiloRutaService service;

    public EstiloRutaController(EstiloRutaService service) {
        this.service = service;
    }

    @GetMapping
    public List<EstiloRuta> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/ruta/{rutaId}")
    public List<EstiloRuta> listarPorRuta(@PathVariable Long rutaId) {
        return service.listarPorRuta(rutaId);
    }

    @GetMapping("/tipo/{tipo}")
    public List<EstiloRuta> listarPorTipo(@PathVariable String tipo) {
        return service.listarPorTipoEstilo(tipo);
    }

    @GetMapping("/activos")
    public List<EstiloRuta> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/{id}")
    public EstiloRuta obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public EstiloRuta crear(@RequestBody EstiloRuta estilo) {
        return service.crear(estilo);
    }

    @PutMapping("/{id}")
    public EstiloRuta actualizar(@PathVariable Long id, @RequestBody EstiloRuta estilo) {
        return service.actualizar(id, estilo);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
