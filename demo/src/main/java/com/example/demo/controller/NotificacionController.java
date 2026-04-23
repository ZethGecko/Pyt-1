package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Notificacion;
import com.example.demo.service.NotificacionService;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notificacion> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/destinatario/{usuarioId}")
    public List<Notificacion> listarPorDestinatario(@PathVariable Long usuarioId) {
        return service.listarPorDestinatario(usuarioId);
    }

    @GetMapping("/estado/{estado}")
    public List<Notificacion> listarPorEstado(@PathVariable String estado) {
        return service.listarPorEstado(estado);
    }

    @GetMapping("/tipo/{tipo}")
    public List<Notificacion> listarPorTipo(@PathVariable String tipo) {
        return service.listarPorTipo(tipo);
    }

    @GetMapping("/tramite/{tramiteId}")
    public List<Notificacion> listarPorTramite(@PathVariable Long tramiteId) {
        return service.listarPorTramite(tramiteId);
    }

    @GetMapping("/pendientes/count")
    public long contarPendientes(@RequestParam Long usuarioId) {
        return service.contarPendientes(usuarioId);
    }

    @GetMapping("/urgentes/count")
    public long contarUrgentes(@RequestParam Long usuarioId) {
        return service.contarUrgentes(usuarioId);
    }

    @GetMapping("/estadisticas/total")
    public long contarTotal() {
        return service.contarTotal();
    }

    @GetMapping("/estadisticas/tipo")
    public long contarPorTipo(@RequestParam String tipo) {
        return service.contarPorTipo(tipo);
    }

    @GetMapping("/{id}")
    public Notificacion obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public Notificacion crear(@RequestBody Notificacion notificacion) {
        return service.crear(notificacion);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public Notificacion actualizar(@PathVariable Long id, @RequestBody Notificacion notificacion) {
        return service.actualizar(id, notificacion);
    }

    @PatchMapping("/{id}/leer")
    public void marcarComoLeida(@PathVariable Long id) {
        service.marcarComoLeida(id);
    }

    @PatchMapping("/leer-masivo")
    public void marcarComoLeidasMasivo(@RequestBody List<Long> ids) {
        service.marcarComoLeidasMasivo(ids);
    }

    @PatchMapping("/{id}/archivar")
    public void archivar(@PathVariable Long id) {
        service.archivar(id);
    }

    @PatchMapping("/archivar-masivo")
    public void archivarMasivo(@RequestBody List<Long> ids) {
        service.archivarMasivo(ids);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
