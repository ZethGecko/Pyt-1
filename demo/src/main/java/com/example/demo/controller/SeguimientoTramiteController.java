package com.example.demo.controller;

import com.example.demo.model.SeguimientoTramite;
import com.example.demo.service.SeguimientoTramiteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seguimiento-tramites")
public class SeguimientoTramiteController {

    private final SeguimientoTramiteService service;

    public SeguimientoTramiteController(SeguimientoTramiteService service) {
        this.service = service;
    }

    @GetMapping
    public List<SeguimientoTramite> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public SeguimientoTramite obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @GetMapping("/tramite/{tramiteId}/historial")
    public List<SeguimientoTramite> listarPorTramite(@PathVariable Long tramiteId) {
        return service.listarPorTramite(tramiteId);
    }

    @GetMapping("/tramite/{tramiteId}/activo")
    public SeguimientoTramite obtenerActivo(@PathVariable Long tramiteId) {
        return service.obtenerActivo(tramiteId);
    }

    @PostMapping
    public SeguimientoTramite crear(@RequestBody SeguimientoTramite seguimiento) {
        return service.crear(seguimiento);
    }

    @PutMapping("/{id}")
    public SeguimientoTramite actualizar(@PathVariable Long id, @RequestBody SeguimientoTramite seguimiento) {
        seguimiento.setIdSeguimiento(id);
        return service.actualizar(seguimiento);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PostMapping("/iniciar")
    public SeguimientoTramite iniciarSeguimiento(@RequestBody Map<String, Object> request) {
        Long tramiteId = Long.valueOf(request.get("tramiteId").toString());
        Long etapaId = Long.valueOf(request.get("etapaId").toString());
        return service.iniciarSeguimiento(tramiteId, etapaId);
    }

    @PostMapping("/{seguimientoId}/avanzar")
    public SeguimientoTramite avanzarEtapa(@PathVariable Long seguimientoId, @RequestBody Map<String, Object> request) {
        Long siguienteEtapaId = Long.valueOf(request.get("siguienteEtapaId").toString());
        return service.avanzarEtapa(seguimientoId, siguienteEtapaId);
    }

    @PostMapping("/{seguimientoId}/completar")
    public SeguimientoTramite completarEtapa(@PathVariable Long seguimientoId, @RequestBody Map<String, Object> request) {
        String observaciones = (String) request.get("observaciones");
        return service.completarEtapa(seguimientoId, observaciones);
    }

    @PostMapping("/{seguimientoId}/bloquear")
    public SeguimientoTramite bloquearEtapa(@PathVariable Long seguimientoId, @RequestBody Map<String, Object> request) {
        String motivo = (String) request.get("motivo");
        return service.bloquearEtapa(seguimientoId, motivo);
    }

    @PostMapping("/{seguimientoId}/desbloquear")
    public SeguimientoTramite desbloquearEtapa(@PathVariable Long seguimientoId) {
        return service.desbloquearEtapa(seguimientoId);
    }

    @PostMapping("/{seguimientoId}/asignar-responsable")
    public SeguimientoTramite asignarResponsable(@PathVariable Long seguimientoId, @RequestBody Map<String, Object> request) {
        Long usuarioId = request.get("usuarioId") != null ? Long.valueOf(request.get("usuarioId").toString()) : null;
        Long departamentoId = request.get("departamentoId") != null ? Long.valueOf(request.get("departamentoId").toString()) : null;
        return service.asignarResponsable(seguimientoId, usuarioId, departamentoId);
    }

    @PostMapping("/{seguimientoId}/observaciones")
    public void agregarObservacion(@PathVariable Long seguimientoId, @RequestBody Map<String, Object> request) {
        String observacion = (String) request.get("observacion");
        // For simplicity, update the existing seguimiento with additional observations
        SeguimientoTramite seg = service.buscarPorId(seguimientoId).orElse(null);
        if (seg != null) {
            String currentObs = seg.getObservaciones() != null ? seg.getObservaciones() : "";
            seg.setObservaciones(currentObs + "\n" + observacion);
            service.actualizar(seg);
        }
    }
}