package com.example.demo.controller;

import com.example.demo.model.Constancia;
import com.example.demo.service.ConstanciaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/constancias")
public class ConstanciaController {

    private final ConstanciaService constanciaService;

    public ConstanciaController(ConstanciaService constanciaService) {
        this.constanciaService = constanciaService;
    }

    @GetMapping
    public List<Constancia> listar() {
        return constanciaService.listarTodas();
    }

    @PostMapping
    public Constancia crear(@RequestBody Constancia constancia) {
        return constanciaService.guardar(constancia);
    }

    @GetMapping("/{id}")
    public Constancia obtener(@PathVariable Integer id) {
        return constanciaService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        constanciaService.eliminar(id);
    }
}
