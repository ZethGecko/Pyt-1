package com.example.demo.service;

import com.example.demo.model.Expediente;
import com.example.demo.repository.ExpedienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpedienteService {

    private final ExpedienteRepository expedienteRepository;

    public ExpedienteService(ExpedienteRepository expedienteRepository) {
        this.expedienteRepository = expedienteRepository;
    }

    public List<Expediente> listarTodos() {
        return expedienteRepository.findAll();
    }

    public Expediente guardar(Expediente expediente) {
        return expedienteRepository.save(expediente);
    }

    public Expediente buscarPorId(Integer id) {
        return expedienteRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        expedienteRepository.deleteById(id);
    }
}
