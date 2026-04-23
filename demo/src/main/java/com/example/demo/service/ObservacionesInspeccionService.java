package com.example.demo.service;

import com.example.demo.model.ObservacionesInspeccion;
import com.example.demo.repository.ObservacionesInspeccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObservacionesInspeccionService {

    private final ObservacionesInspeccionRepository observacionesInspeccionRepository;

    public ObservacionesInspeccionService(ObservacionesInspeccionRepository observacionesInspeccionRepository) {
        this.observacionesInspeccionRepository = observacionesInspeccionRepository;
    }

    public List<ObservacionesInspeccion> listarTodas() {
        return observacionesInspeccionRepository.findAll();
    }

    public ObservacionesInspeccion guardar(ObservacionesInspeccion observacion) {
        return observacionesInspeccionRepository.save(observacion);
    }

    public ObservacionesInspeccion buscarPorId(Integer id) {
        return observacionesInspeccionRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        observacionesInspeccionRepository.deleteById(id);
    }
}
