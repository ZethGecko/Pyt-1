package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.EstiloRuta;
import com.example.demo.repository.EstiloRutaRepository;

@Service
public class EstiloRutaService {

    @Autowired
    private EstiloRutaRepository repo;

    public List<EstiloRuta> listarTodos() {
        return repo.findAll();
    }

    public Optional<EstiloRuta> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<EstiloRuta> listarPorRuta(Long rutaId) {
        return repo.findAll().stream()
                .filter(e -> e.getRutaId() != null && e.getRutaId().equals(rutaId))
                .toList();
    }

    public List<EstiloRuta> listarPorTipoEstilo(String tipo) {
        return repo.findAll().stream()
                .filter(e -> tipo != null && e.getTipoEstilo().equals(tipo))
                .toList();
    }

    public List<EstiloRuta> listarActivos() {
        return repo.findAll().stream()
                .filter(e -> Boolean.TRUE.equals(e.getActivo()))
                .toList();
    }

    public EstiloRuta crear(EstiloRuta estilo) {
        if (estilo.getFechaCreacion() == null) {
            estilo.setFechaCreacion(LocalDateTime.now());
        }
        if (estilo.getActivo() == null) {
            estilo.setActivo(true);
        }
        return repo.save(estilo);
    }

    public EstiloRuta actualizar(Long id, EstiloRuta datos) {
        return repo.findById(id).map(estilo -> {
            if (datos.getRutaId() != null) estilo.setRutaId(datos.getRutaId());
            if (datos.getTipoEstilo() != null) estilo.setTipoEstilo(datos.getTipoEstilo());
            if (datos.getColor() != null) estilo.setColor(datos.getColor());
            if (datos.getAnchoLinea() != null) estilo.setAnchoLinea(datos.getAnchoLinea());
            if (datos.getOpacidad() != null) estilo.setOpacidad(datos.getOpacidad());
            if (datos.getDescripcion() != null) estilo.setDescripcion(datos.getDescripcion());
            if (datos.getUrlIcono() != null) estilo.setUrlIcono(datos.getUrlIcono());
            if (datos.getActivo() != null) estilo.setActivo(datos.getActivo());
            estilo.setFechaActualizacion(LocalDateTime.now());
            return repo.save(estilo);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }
}
