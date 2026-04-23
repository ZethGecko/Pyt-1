package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.ObservacionSolicitud;
import com.example.demo.service.ObservacionSolicitudService;

import java.util.List;

@RestController
@RequestMapping("/api/observaciones-solicitud")
public class ObservacionSolicitudController {

    private final ObservacionSolicitudService service;

    public ObservacionSolicitudController(ObservacionSolicitudService service) {
        this.service = service;
    }

    @GetMapping
    public List<ObservacionSolicitud> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/solicitud/{solicitudId}")
    public List<ObservacionSolicitud> listarPorSolicitud(@PathVariable Long solicitudId) {
        return service.listarPorSolicitud(solicitudId);
    }

    @GetMapping("/tramite/{tramiteId}")
    public List<ObservacionSolicitud> listarPorTramite(@PathVariable Long tramiteId) {
        return service.listarPorTramite(tramiteId);
    }

    @GetMapping("/estado/{estado}")
    public List<ObservacionSolicitud> listarPorEstado(@PathVariable String estado) {
        return service.listarPorEstado(estado);
    }

    @GetMapping("/tipo/{tipo}")
    public List<ObservacionSolicitud> listarPorTipo(@PathVariable String tipo) {
        return service.listarPorTipo(tipo);
    }

    @GetMapping("/severidad/{severidad}")
    public List<ObservacionSolicitud> listarPorSeveridad(@PathVariable String severidad) {
        return service.listarPorSeveridad(severidad);
    }

    @GetMapping("/estadisticas/estado")
    public long contarPorEstado(@RequestParam String estado) {
        return service.countByEstado(estado);
    }

    @GetMapping("/estadisticas/severidad")
    public long contarPorSeveridad(@RequestParam String severidad) {
        return service.countBySeveridad(severidad);
    }

    @GetMapping("/{id}")
    public ObservacionSolicitud obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public ObservacionSolicitud crear(@RequestBody ObservacionSolicitud obs) {
        return service.crear(obs);
    }

    @PutMapping("/{id}")
    public ObservacionSolicitud actualizar(@PathVariable Long id, @RequestBody ObservacionSolicitud obs) {
        return service.actualizar(id, obs);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PostMapping("/bulk")
    public List<ObservacionSolicitud> crearMasivo(@RequestBody List<ObservacionSolicitud> observaciones) {
        return service.bulkCreate(observaciones);
    }
}
