package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.PuntoGeografico;
import com.example.demo.service.PuntoGeograficoService;

import java.util.List;

@RestController
@RequestMapping("/api/puntos-geograficos")
public class PuntoGeograficoController {

    private final PuntoGeograficoService service;

    public PuntoGeograficoController(PuntoGeograficoService service) {
        this.service = service;
    }

    @GetMapping
    public List<PuntoGeografico> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/empresa/{empresaId}")
    public List<PuntoGeografico> listarPorEmpresa(@PathVariable Long empresaId) {
        return service.listarPorEmpresa(empresaId);
    }

    @GetMapping("/ruta/{rutaId}")
    public List<PuntoGeografico> listarPorRuta(@PathVariable Long rutaId) {
        return service.listarPorRuta(rutaId);
    }

    @GetMapping("/principales")
    public List<PuntoGeografico> listarPrincipales() {
        return service.listarPrincipales();
    }

    @GetMapping("/{id}")
    public PuntoGeografico obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public PuntoGeografico crear(@RequestBody PuntoGeografico punto) {
        return service.crear(punto);
    }

    @PutMapping("/{id}")
    public PuntoGeografico actualizar(@PathVariable Long id, @RequestBody PuntoGeografico punto) {
        return service.actualizar(id, punto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
