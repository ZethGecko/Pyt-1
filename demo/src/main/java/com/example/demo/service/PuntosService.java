package com.example.demo.service;

import com.example.demo.model.Puntos;
import com.example.demo.repository.PuntosRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PuntosService {

    private final PuntosRepository puntosRepository;

    public PuntosService(PuntosRepository puntosRepository) {
        this.puntosRepository = puntosRepository;
    }

    public List<Puntos> listarTodos() {
        return puntosRepository.findAll();
    }

    public Puntos guardar(Puntos punto) {
        return puntosRepository.save(punto);
    }

    public Puntos buscarPorId(Integer id) {
        return puntosRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        puntosRepository.deleteById(id);
    }
}
