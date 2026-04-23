package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.EvaluacionParametro;
import com.example.demo.repository.EvaluacionParametroRepository;

@Service
public class EvaluacionParametroService {

    @Autowired
    private EvaluacionParametroRepository repo;

    public List<EvaluacionParametro> listarTodos() {
        return repo.findAll();
    }

    public Optional<EvaluacionParametro> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<EvaluacionParametro> listarPorFichaInspeccion(Long fichaId) {
        return repo.findAll().stream()
                .filter(e -> e.getFichaInspeccion() != null && e.getFichaInspeccion().equals(fichaId))
                .toList();
    }

    public List<EvaluacionParametro> listarPorParametro(Long parametroId) {
        return repo.findAll().stream()
                .filter(e -> e.getParametro() != null && e.getParametro().equals(parametroId))
                .toList();
    }

    public List<EvaluacionParametro> listarPorCumplimiento(String cumplimiento) {
        return repo.findAll().stream()
                .filter(e -> cumplimiento != null && e.getCumplimiento().equals(cumplimiento))
                .toList();
    }

    public EvaluacionParametro crear(EvaluacionParametro evaluacion) {
        if (evaluacion.getFechaEvaluacion() == null) {
            evaluacion.setFechaEvaluacion(LocalDateTime.now());
        }
        return repo.save(evaluacion);
    }

    public EvaluacionParametro actualizar(Long id, EvaluacionParametro datos) {
        return repo.findById(id).map(eval -> {
            if (datos.getFichaInspeccion() != null) eval.setFichaInspeccion(datos.getFichaInspeccion());
            if (datos.getParametro() != null) eval.setParametro(datos.getParametro());
            if (datos.getCumplimiento() != null) eval.setCumplimiento(datos.getCumplimiento());
            if (datos.getEvidenciaFoto() != null) eval.setEvidenciaFoto(datos.getEvidenciaFoto());
            if (datos.getObservacion() != null) eval.setObservacion(datos.getObservacion());
            if (datos.getUsuarioEvaluador() != null) eval.setUsuarioEvaluador(datos.getUsuarioEvaluador());
            eval.setFechaEvaluacion(LocalDateTime.now());
            return repo.save(eval);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public long countByCumplimiento(String cumplimiento) {
        return repo.findAll().stream()
                .filter(e -> e.getCumplimiento() != null && e.getCumplimiento().equals(cumplimiento))
                .count();
    }
}
