package com.example.demo.service;

import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.ParametrosInspeccion;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.ParametrosInspeccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParametrosInspeccionService {

    private final ParametrosInspeccionRepository parametrosInspeccionRepository;
    private final FichaInspeccionRepository fichaInspeccionRepository;

    public ParametrosInspeccionService(ParametrosInspeccionRepository parametrosInspeccionRepository, FichaInspeccionRepository fichaInspeccionRepository) {
        this.parametrosInspeccionRepository = parametrosInspeccionRepository;
        this.fichaInspeccionRepository = fichaInspeccionRepository;
    }

    public List<ParametrosInspeccion> listarTodos() {
        return parametrosInspeccionRepository.findAll();
    }

    public ParametrosInspeccion guardar(ParametrosInspeccion parametro) {
        return parametrosInspeccionRepository.save(parametro);
    }

    public ParametrosInspeccion buscarPorId(Integer id) {
        return parametrosInspeccionRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        parametrosInspeccionRepository.deleteById(id);
    }

    public List<ParametrosInspeccion> buscarPorFichaInspeccion(Long fichaId) {
        return parametrosInspeccionRepository.findByFichaInspeccion_IdFichaInspeccion(fichaId);
    }

    public List<ParametrosInspeccion> buscarDisponibles() {
        return parametrosInspeccionRepository.findDisponibles();
    }

    public ParametrosInspeccion guardarParaFicha(Long fichaId, ParametrosInspeccion parametro) {
        FichaInspeccion ficha = fichaInspeccionRepository.findById(fichaId).orElse(null);
        if (ficha == null) return null;
        parametro.setFichaInspeccion(ficha);
        return parametrosInspeccionRepository.save(parametro);
    }
}
