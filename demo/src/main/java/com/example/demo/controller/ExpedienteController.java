package com.example.demo.controller;

import com.example.demo.model.Expediente;
import com.example.demo.service.ExpedienteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expedientes")
public class ExpedienteController {

    private final ExpedienteService expedienteService;

    public ExpedienteController(ExpedienteService expedienteService) {
        this.expedienteService = expedienteService;
    }

    @GetMapping
    public List<Expediente> listar() {
        return expedienteService.listarTodos();
    }

    @PostMapping
    public Expediente crear(@RequestBody Expediente expediente) {
        return expedienteService.guardar(expediente);
    }

    @GetMapping("/{id}")
    public Expediente obtener(@PathVariable Integer id) {
        return expedienteService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        expedienteService.eliminar(id);
    }
}
