package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.HistorialTramite;
import com.example.demo.service.HistorialTramiteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/historial-tramite")
public class HistorialTramiteController {

    private final HistorialTramiteService service;

    public HistorialTramiteController(HistorialTramiteService service) {
        this.service = service;
    }

    @GetMapping
    public List<HistorialTramite> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/tramite/{tramiteId}")
    public List<HistorialTramite> listarPorTramite(@PathVariable Long tramiteId) {
        return service.listarPorTramite(tramiteId);
    }

    @GetMapping("/usuario-accion/{usuarioId}")
    public List<HistorialTramite> listarPorUsuarioAccion(@PathVariable Long usuarioId) {
        return service.listarPorUsuarioAccion(usuarioId);
    }

    @GetMapping("/usuario-responsable/{usuarioId}")
    public List<HistorialTramite> listarPorUsuarioResponsable(@PathVariable Long usuarioId) {
        return service.listarPorUsuarioResponsable(usuarioId);
    }

    @GetMapping("/accion/{accion}")
    public List<HistorialTramite> listarPorAccion(@PathVariable String accion) {
        return service.listarPorAccion(accion);
    }

    @GetMapping("/tramite/{tramiteId}/count")
    public long countByTramite(@PathVariable Long tramiteId) {
        return service.countByTramite(tramiteId);
    }

    @GetMapping("/{id}")
    public HistorialTramite obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public HistorialTramite crear(@RequestBody HistorialTramite historial) {
        return service.crear(historial);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @GetMapping("/tramite/{tramiteId}/ordenado")
    public List<HistorialTramite> listarPorTramiteOrdenado(@PathVariable Long tramiteId) {
        return service.listarPorTramiteOrdenado(tramiteId);
    }

    @GetMapping("/tramite/{tramiteId}/linea-tiempo")
    public List<Map<String, Object>> obtenerLineaTiempo(@PathVariable Long tramiteId) {
        return service.obtenerLineaTiempo(tramiteId);
    }

    @GetMapping("/tramite/{tramiteId}/resumen")
    public Map<String, Object> obtenerResumen(@PathVariable Long tramiteId) {
        return service.obtenerResumenHistorial(tramiteId);
    }

    @PostMapping("/automatico")
    public HistorialTramite crearAutomatico(@RequestBody Map<String, Object> request) {
        Long tramiteId = Long.valueOf(request.get("tramiteId").toString());
        String accion = (String) request.get("accion");
        String observaciones = (String) request.get("observaciones");
        return service.crearAutomatico(tramiteId, accion, observaciones);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<HistorialTramite> listarPorUsuario(@PathVariable Long usuarioId) {
        return service.listarPorUsuarioAccion(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/estadisticas")
    public Map<String, Object> obtenerEstadisticasPorUsuario(@PathVariable Long usuarioId) {
        return service.obtenerEstadisticasPorUsuario(usuarioId);
    }
}
