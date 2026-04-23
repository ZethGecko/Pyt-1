package com.example.demo.service;

import com.example.demo.model.Observaciones;
import com.example.demo.repository.ObservacionesRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObservacionesService {

    private final ObservacionesRepository observacionesRepository;

    public ObservacionesService(ObservacionesRepository observacionesRepository) {
        this.observacionesRepository = observacionesRepository;
    }

    public List<Observaciones> listarTodas() {
        return observacionesRepository.findAll();
    }

    public Observaciones guardar(Observaciones observaciones) {
        return observacionesRepository.save(observaciones);
    }

    public Observaciones buscarPorId(Integer id) {
        return observacionesRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        observacionesRepository.deleteById(id);
    }
}
