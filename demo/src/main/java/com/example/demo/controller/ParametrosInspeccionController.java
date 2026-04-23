package com.example.demo.controller;

import com.example.demo.model.ParametrosInspeccion;
import com.example.demo.service.ParametrosInspeccionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/parametros-inspeccion")
public class ParametrosInspeccionController {

    private final ParametrosInspeccionService parametrosInspeccionService;

    public ParametrosInspeccionController(ParametrosInspeccionService parametrosInspeccionService) {
        this.parametrosInspeccionService = parametrosInspeccionService;
    }

    @GetMapping
    public List<ParametrosInspeccion> listar() {
        return parametrosInspeccionService.listarTodos();
    }

    @PostMapping
    public ParametrosInspeccion crear(@RequestBody ParametrosInspeccion parametro) {
        return parametrosInspeccionService.guardar(parametro);
    }

    @GetMapping("/{id}")
    public ParametrosInspeccion obtener(@PathVariable Integer id) {
        return parametrosInspeccionService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        parametrosInspeccionService.eliminar(id);
    }

    @GetMapping("/disponibles")
    public List<ParametrosInspeccion> obtenerDisponibles() {
        return parametrosInspeccionService.buscarDisponibles();
    }

    @GetMapping("/ficha/{fichaId}")
    public List<ParametrosInspeccion> obtenerPorFicha(@PathVariable Long fichaId) {
        return parametrosInspeccionService.buscarPorFichaInspeccion(fichaId);
    }

    @PostMapping("/ficha/{fichaInspeccionId}")
    public ResponseEntity<ParametrosInspeccion> crearParaFicha(@PathVariable Long fichaInspeccionId, @RequestBody ParametrosInspeccion parametro) {
        ParametrosInspeccion creado = parametrosInspeccionService.guardarParaFicha(fichaInspeccionId, parametro);
        if (creado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(creado);
    }

    @GetMapping("/categoria/{categoria}")
    public List<ParametrosInspeccion> obtenerPorCategoria(@PathVariable String categoria) {
        // TODO: implement filtering by categoria if added to model
        return parametrosInspeccionService.listarTodos();
    }

    @PostMapping("/ficha/{fichaInspeccionId}/basicos")
    public ResponseEntity<List<ParametrosInspeccion>> crearParametrosBasicos(@PathVariable Long fichaInspeccionId) {
        // TODO: implement creating basic parameters for ficha
        return ResponseEntity.ok(new ArrayList<>());
    }
}
