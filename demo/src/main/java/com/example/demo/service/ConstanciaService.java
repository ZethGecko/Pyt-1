package com.example.demo.service;

import com.example.demo.model.Constancia;
import com.example.demo.repository.ConstanciaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConstanciaService {

    private final ConstanciaRepository constanciaRepository;

    public ConstanciaService(ConstanciaRepository constanciaRepository) {
        this.constanciaRepository = constanciaRepository;
    }

    public List<Constancia> listarTodas() {
        return constanciaRepository.findAll();
    }

    public Constancia guardar(Constancia constancia) {
        return constanciaRepository.save(constancia);
    }

    public Constancia buscarPorId(Integer id) {
        return constanciaRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        constanciaRepository.deleteById(id);
    }
}
