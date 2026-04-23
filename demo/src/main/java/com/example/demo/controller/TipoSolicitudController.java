package com.example.demo.controller;

import com.example.demo.model.TipoSolicitud;
import com.example.demo.service.TipoSolicitudService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-solicitud")
public class TipoSolicitudController {

    private final TipoSolicitudService tipoSolicitudService;

    public TipoSolicitudController(TipoSolicitudService tipoSolicitudService) {
        this.tipoSolicitudService = tipoSolicitudService;
    }

    @GetMapping
    public List<TipoSolicitud> listar() {
        return tipoSolicitudService.listarTodos();
    }

    @PostMapping
    public TipoSolicitud crear(@RequestBody TipoSolicitud tipoSolicitud) {
        return tipoSolicitudService.guardar(tipoSolicitud);
    }

    @GetMapping("/{id}")
    public TipoSolicitud obtener(@PathVariable Integer id) {
        return tipoSolicitudService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoSolicitudService.eliminar(id);
    }
}
