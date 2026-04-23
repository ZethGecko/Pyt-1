package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Departamento;
import com.example.demo.repository.DepartamentoRepository;

@Service
public class DepartamentoService {

    @Autowired
    private DepartamentoRepository repo;

    public List<Departamento> listarTodos() {
        return repo.findAll();
    }

    public Optional<Departamento> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<Departamento> listarActivos() {
        return repo.findAll().stream()
                .filter(d -> Boolean.TRUE.equals(d.getActivo()))
                .toList();
    }

    public Departamento crear(Departamento depto) {
        if (depto.getFechaCreacion() == null) {
            depto.setFechaCreacion(LocalDateTime.now());
        }
        if (depto.getActivo() == null) {
            depto.setActivo(true);
        }
        return repo.save(depto);
    }

    public Departamento actualizar(Long id, Departamento datos) {
        return repo.findById(id).map(depto -> {
            if (datos.getNombre() != null) depto.setNombre(datos.getNombre());
            if (datos.getDescripcion() != null) depto.setDescripcion(datos.getDescripcion());
            if (datos.getActivo() != null) depto.setActivo(datos.getActivo());
            if (datos.getResponsable() != null) depto.setResponsable(datos.getResponsable());
            return repo.save(depto);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public long countTramitesByDepartamento(Long deptoId) {
        // Tramites relation exists in Departamento
        Departamento depto = repo.findById(deptoId).orElse(null);
        if (depto != null && depto.getTramites() != null) {
            return depto.getTramites().size();
        }
        return 0;
    }
}
