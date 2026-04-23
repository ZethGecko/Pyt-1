package com.example.demo.service;

import com.example.demo.model.FichaInspeccion;
import com.example.demo.repository.FichaInspeccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FichaInspeccionService {

    private final FichaInspeccionRepository fichaInspeccionRepository;

    public FichaInspeccionService(FichaInspeccionRepository fichaInspeccionRepository) {
        this.fichaInspeccionRepository = fichaInspeccionRepository;
    }

    public List<FichaInspeccion> listarTodas() {
        return fichaInspeccionRepository.findAll();
    }

    public FichaInspeccion guardar(FichaInspeccion fichaInspeccion) {
        return fichaInspeccionRepository.save(fichaInspeccion);
    }

    public FichaInspeccion buscarPorId(Long id) {
        return fichaInspeccionRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        fichaInspeccionRepository.deleteById(id);
    }
}
