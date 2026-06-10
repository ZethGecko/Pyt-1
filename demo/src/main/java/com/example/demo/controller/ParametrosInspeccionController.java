package com.example.demo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.ParametrosInspeccion;
import com.example.demo.service.ParametrosInspeccionService;

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
        //implement filtering by categoria if added to model
        return parametrosInspeccionService.listarTodos();
    }

     @PostMapping("/ficha/{fichaInspeccionId}/basicos")
     public ResponseEntity<List<ParametrosInspeccion>> crearParametrosBasicos(@PathVariable Long fichaInspeccionId) {
         //implement creating basic parameters for ficha
         return ResponseEntity.ok(new ArrayList<>());
     }

     @PutMapping("/{id}")
     public ResponseEntity<ParametrosInspeccion> actualizar(@PathVariable Integer id, @RequestBody ParametrosInspeccion parametro) {
         if (!id.equals(parametro.getIdParametros())) {
             return ResponseEntity.badRequest().build();
         }
         ParametrosInspeccion actualizado = parametrosInspeccionService.guardar(parametro);
         return ResponseEntity.ok(actualizado);
     }
 }
