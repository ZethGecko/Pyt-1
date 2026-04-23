package com.example.demo.controller;

import com.example.demo.model.Solicitud;
import com.example.demo.service.SolicitudService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public List<Solicitud> listar() {
        return solicitudService.listarTodas();
    }

    @PostMapping
    public Solicitud crear(@RequestBody Solicitud solicitud) {
        return solicitudService.guardar(solicitud);
    }

    @GetMapping("/{id}")
    public Solicitud obtener(@PathVariable Integer id) {
        return solicitudService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        solicitudService.eliminar(id);
    }
}
