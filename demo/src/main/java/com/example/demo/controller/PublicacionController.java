package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Publicacion;
import com.example.demo.service.PublicacionService;

import java.util.List;

@RestController
@RequestMapping("/api/publicaciones")
public class PublicacionController {

    private final PublicacionService service;

    public PublicacionController(PublicacionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Publicacion> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/publicadas")
    public List<Publicacion> listarPublicadas() {
        return service.listarPublicadas();
    }

    @GetMapping("/tipo/{tipo}")
    public List<Publicacion> listarPorTipo(@PathVariable String tipo) {
        return service.listarPorTipo(tipo);
    }

    @GetMapping("/tipo-tramite/{tipoTramiteId}")
    public List<Publicacion> listarPorTipoTramite(@PathVariable Long tipoTramiteId) {
        return service.listarPorTipoTramite(tipoTramiteId);
    }

    @GetMapping("/estado/{estado}")
    public List<Publicacion> listarPorEstado(@PathVariable String estado) {
        return service.listarPorEstado(estado);
    }

    @GetMapping("/estadisticas/tipo")
    public long countByTipo(@RequestParam String tipo) {
        return service.countByTipo(tipo);
    }

    @GetMapping("/estadisticas/estado")
    public long countByEstado(@RequestParam String estado) {
        return service.countByEstado(estado);
    }

    @GetMapping("/{id}")
    public Publicacion obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public Publicacion crear(@RequestBody Publicacion pub) {
        return service.crear(pub);
    }

    @PutMapping("/{id}")
    public Publicacion actualizar(@PathVariable Long id, @RequestBody Publicacion pub) {
        return service.actualizar(id, pub);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PatchMapping("/{id}/publicar")
    public Publicacion publicar(@PathVariable Long id) {
        return service.publicar(id);
    }

    @PatchMapping("/{id}/archivar")
    public Publicacion archivar(@PathVariable Long id) {
        return service.archivar(id);
    }

    @PatchMapping("/{id}/desarchivar")
    public Publicacion desarchivar(@PathVariable Long id) {
        return service.desarchivar(id);
    }
}
