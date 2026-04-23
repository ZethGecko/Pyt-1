package com.example.demo.controller;

import com.example.demo.model.TUC;
import com.example.demo.service.TUCService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tuc")
public class TUCController {

    private final TUCService tucService;

    public TUCController(TUCService tucService) {
        this.tucService = tucService;
    }

    @GetMapping
    public List<TUC> listar() {
        return tucService.listarTodos();
    }

    @PostMapping
    public TUC crear(@RequestBody TUC tuc) {
        return tucService.guardar(tuc);
    }

    @GetMapping("/{id}")
    public TUC obtener(@PathVariable Long id) {
        return tucService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        tucService.eliminar(id);
    }
}
