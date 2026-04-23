package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.ConfiguracionExamen;
import com.example.demo.repository.ConfiguracionExamenRepository;

@Service
public class ConfiguracionExamenService {

    @Autowired
    private ConfiguracionExamenRepository repo;

    public List<ConfiguracionExamen> listarTodos() {
        return repo.findAll();
    }

    public List<ConfiguracionExamen> listarActivos() {
        return repo.findByActivoTrue();
    }

    public Optional<ConfiguracionExamen> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public ConfiguracionExamen buscarPorTipoExamen(String tipoExamen) {
        return repo.findByTipoExamen(tipoExamen);
    }

    public List<ConfiguracionExamen> listarPorRequisitoTUPAC(Long requisitoId) {
        return repo.findByRequisitoTUPAC_Id(requisitoId);
    }

    public ConfiguracionExamen guardar(ConfiguracionExamen config) {
        // Ensure activo is not null
        if (config.getActivo() == null) {
            config.setActivo(true);
        }
        return repo.save(config);
    }

    public ConfiguracionExamen actualizar(Long id, ConfiguracionExamen config) {
        return repo.findById(id)
                .map(existing -> {
                    existing.setTipoExamen(config.getTipoExamen());
                    existing.setNombre(config.getNombre());
                    existing.setDescripcion(config.getDescripcion());
                    existing.setCapacidadGrupo(config.getCapacidadGrupo());
                    existing.setDiasDisponibles(config.getDiasDisponibles());
                    existing.setHorariosDisponibles(config.getHorariosDisponibles());
                    existing.setTiempoValidezMeses(config.getTiempoValidezMeses());
                    existing.setRequiereExamenPractico(config.getRequiereExamenPractico());
                    existing.setRequiereExamenTeorico(config.getRequiereExamenTeorico());
                    existing.setActivo(config.getActivo());
                    existing.setRequisitoTUPAC(config.getRequisitoTUPAC());
                    return repo.save(existing);
                })
                .orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public void toggleActivo(Long id) {
        repo.findById(id).ifPresent(config -> {
            config.setActivo(!config.getActivo());
            repo.save(config);
        });
    }
}
