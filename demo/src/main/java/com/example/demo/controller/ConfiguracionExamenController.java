package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.ConfiguracionExamen;
import com.example.demo.service.ConfiguracionExamenService;

import java.util.List;

@RestController
@RequestMapping("/api/configuracion-examen")
public class ConfiguracionExamenController {

    private final ConfiguracionExamenService service;

    public ConfiguracionExamenController(ConfiguracionExamenService service) {
        this.service = service;
    }

    @GetMapping
    public List<ConfiguracionExamen> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/activos")
    public List<ConfiguracionExamen> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/tipo/{tipo}")
    public ConfiguracionExamen obtenerPorTipo(@PathVariable String tipo) {
        return service.buscarPorTipoExamen(tipo);
    }

    @GetMapping("/requisito/{requisitoId}")
    public List<ConfiguracionExamen> listarPorRequisito(@PathVariable Long requisitoId) {
        return service.listarPorRequisitoTUPAC(requisitoId);
    }

    @GetMapping("/{id}")
    public ConfiguracionExamen obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public ConfiguracionExamen crear(@RequestBody ConfiguracionExamen config) {
        return service.guardar(config);
    }

    @PutMapping("/{id}")
    public ConfiguracionExamen actualizar(@PathVariable Long id, @RequestBody ConfiguracionExamen config) {
        return service.actualizar(id, config);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PatchMapping("/{id}/toggle-activo")
    public void toggleActivo(@PathVariable Long id) {
        service.toggleActivo(id);
    }
}
