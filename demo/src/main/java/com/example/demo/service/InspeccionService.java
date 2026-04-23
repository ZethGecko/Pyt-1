package com.example.demo.service;

import com.example.demo.model.Inspeccion;
import com.example.demo.repository.InspeccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InspeccionService {

    private final InspeccionRepository inspeccionRepository;

    public InspeccionService(InspeccionRepository inspeccionRepository) {
        this.inspeccionRepository = inspeccionRepository;
    }

    public List<Inspeccion> listarTodas() {
        return inspeccionRepository.findAll();
    }

    public Inspeccion guardar(Inspeccion inspeccion) {
        return inspeccionRepository.save(inspeccion);
    }

    public Inspeccion buscarPorId(Integer id) {
        return inspeccionRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        inspeccionRepository.deleteById(id);
    }
}
