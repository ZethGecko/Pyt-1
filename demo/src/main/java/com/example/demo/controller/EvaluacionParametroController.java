package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.EvaluacionParametro;
import com.example.demo.service.EvaluacionParametroService;

import java.util.List;

@RestController
@RequestMapping("/api/evaluaciones-parametro")
public class EvaluacionParametroController {

    private final EvaluacionParametroService service;

    public EvaluacionParametroController(EvaluacionParametroService service) {
        this.service = service;
    }

    @GetMapping
    public List<EvaluacionParametro> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/ficha/{fichaId}")
    public List<EvaluacionParametro> listarPorFicha(@PathVariable Long fichaId) {
        return service.listarPorFichaInspeccion(fichaId);
    }

    @GetMapping("/parametro/{parametroId}")
    public List<EvaluacionParametro> listarPorParametro(@PathVariable Long parametroId) {
        return service.listarPorParametro(parametroId);
    }

    @GetMapping("/cumplimiento/{cumplimiento}")
    public List<EvaluacionParametro> listarPorCumplimiento(@PathVariable String cumplimiento) {
        return service.listarPorCumplimiento(cumplimiento);
    }

    @GetMapping("/estadisticas/cumplimiento")
    public long countByCumplimiento(@RequestParam String cumplimiento) {
        return service.countByCumplimiento(cumplimiento);
    }

    @GetMapping("/{id}")
    public EvaluacionParametro obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public EvaluacionParametro crear(@RequestBody EvaluacionParametro evaluacion) {
        return service.crear(evaluacion);
    }

    @PutMapping("/{id}")
    public EvaluacionParametro actualizar(@PathVariable Long id, @RequestBody EvaluacionParametro evaluacion) {
        return service.actualizar(id, evaluacion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
