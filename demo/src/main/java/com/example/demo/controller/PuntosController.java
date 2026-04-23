package com.example.demo.controller;

import com.example.demo.model.Puntos;
import com.example.demo.service.PuntosService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/puntos")
public class PuntosController {

    private final PuntosService puntosService;

    public PuntosController(PuntosService puntosService) {
        this.puntosService = puntosService;
    }

    @GetMapping
    public List<Puntos> listar() {
        return puntosService.listarTodos();
    }

    @PostMapping
    public Puntos crear(@RequestBody Puntos punto) {
        return puntosService.guardar(punto);
    }

    @GetMapping("/{id}")
    public Puntos obtener(@PathVariable Integer id) {
        return puntosService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        puntosService.eliminar(id);
    }
}
