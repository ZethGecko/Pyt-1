package com.example.demo.service;

import com.example.demo.model.Gerente;
import com.example.demo.repository.GerenteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GerenteService {

    private final GerenteRepository gerenteRepository;

    public GerenteService(GerenteRepository gerenteRepository) {
        this.gerenteRepository = gerenteRepository;
    }

    public List<Gerente> listarTodos() {
        return gerenteRepository.findAll();
    }

    public Gerente guardar(Gerente gerente) {
        // Set default values for required fields
        if (gerente.getInicioVigenciaPodre() == null) {
            gerente.setInicioVigenciaPodre(LocalDate.now());
        }
        if (gerente.getFechaRegistro() == null) {
            gerente.setFechaRegistro(LocalDateTime.now());
        }
        if (gerente.getFechaActualizacion() == null) {
            gerente.setFechaActualizacion(LocalDateTime.now());
        }
        if (gerente.getActivo() == null) {
            gerente.setActivo(true);
        }
        return gerenteRepository.save(gerente);
    }

    public Gerente buscarPorId(Integer id) {
        return gerenteRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        gerenteRepository.deleteById(id);
    }
}
