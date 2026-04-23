package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.ElementoCanvas;
import com.example.demo.service.ElementoCanvasService;

import java.util.List;

@RestController
@RequestMapping("/api/elementos-canvas")
public class ElementoCanvasController {

    private final ElementoCanvasService service;

    public ElementoCanvasController(ElementoCanvasService service) {
        this.service = service;
    }

    @GetMapping
    public List<ElementoCanvas> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/ficha/{fichaId}")
    public List<ElementoCanvas> listarPorFicha(@PathVariable Long fichaId) {
        return service.listarPorFichaInspeccion(fichaId);
    }

    @GetMapping("/ficha/{fichaId}/hoja/{hoja}")
    public List<ElementoCanvas> listarPorFichaYHoja(@PathVariable Long fichaId, @PathVariable Integer hoja) {
        return service.listarPorFichaYHoja(fichaId, hoja);
    }

    @GetMapping("/parametro/{parametroId}")
    public List<ElementoCanvas> listarPorParametro(@PathVariable Long parametroId) {
        return service.listarPorParametro(parametroId);
    }

    @GetMapping("/tipo/{tipo}")
    public List<ElementoCanvas> listarPorTipo(@PathVariable String tipo) {
        return service.listarPorTipoElemento(tipo);
    }

    @GetMapping("/{id}")
    public ElementoCanvas obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public ElementoCanvas crear(@RequestBody ElementoCanvas elemento) {
        return service.crear(elemento);
    }

    @PutMapping("/{id}")
    public ElementoCanvas actualizar(@PathVariable Long id, @RequestBody ElementoCanvas elemento) {
        return service.actualizar(id, elemento);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
