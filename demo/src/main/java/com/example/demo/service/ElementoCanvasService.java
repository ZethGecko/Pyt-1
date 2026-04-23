package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.ElementoCanvas;
import com.example.demo.repository.ElementoCanvasRepository;

@Service
public class ElementoCanvasService {

    @Autowired
    private ElementoCanvasRepository repo;

    public List<ElementoCanvas> listarTodos() {
        return repo.findAll();
    }

    public Optional<ElementoCanvas> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<ElementoCanvas> listarPorFichaInspeccion(Long fichaId) {
        return repo.findAll().stream()
                .filter(e -> e.getFichaInspeccion() != null && e.getFichaInspeccion().equals(fichaId))
                .toList();
    }

    public List<ElementoCanvas> listarPorParametro(Long parametroId) {
        return repo.findAll().stream()
                .filter(e -> e.getParametroInspeccion() != null && e.getParametroInspeccion().equals(parametroId))
                .toList();
    }

    public List<ElementoCanvas> listarPorTipoElemento(String tipo) {
        return repo.findAll().stream()
                .filter(e -> tipo != null && e.getTipoElemento().equals(tipo))
                .toList();
    }

    public ElementoCanvas crear(ElementoCanvas elemento) {
        if (elemento.getFechaCreacion() == null) {
            elemento.setFechaCreacion(LocalDateTime.now());
        }
        return repo.save(elemento);
    }

    public ElementoCanvas actualizar(Long id, ElementoCanvas datos) {
        return repo.findById(id).map(elem -> {
            if (datos.getFichaInspeccion() != null) elem.setFichaInspeccion(datos.getFichaInspeccion());
            if (datos.getParametroInspeccion() != null) elem.setParametroInspeccion(datos.getParametroInspeccion());
            if (datos.getTipoElemento() != null) elem.setTipoElemento(datos.getTipoElemento());
            if (datos.getTitulo() != null) elem.setTitulo(datos.getTitulo());
            if (datos.getContenido() != null) elem.setContenido(datos.getContenido());
            if (datos.getEstilo() != null) elem.setEstilo(datos.getEstilo());
            if (datos.getPosicionX() != null) elem.setPosicionX(datos.getPosicionX());
            if (datos.getPosicionY() != null) elem.setPosicionY(datos.getPosicionY());
            if (datos.getAncho() != null) elem.setAncho(datos.getAncho());
            if (datos.getAlto() != null) elem.setAlto(datos.getAlto());
            if (datos.getRotacion() != null) elem.setRotacion(datos.getRotacion());
            if (datos.getzIndex() != null) elem.setzIndex(datos.getzIndex());
            if (datos.getNumeroHoja() != null) elem.setNumeroHoja(datos.getNumeroHoja());
            elem.setFechaActualizacion(LocalDateTime.now());
            return repo.save(elem);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public List<ElementoCanvas> listarPorFichaYHoja(Long fichaId, Integer hoja) {
        return repo.findAll().stream()
                .filter(e -> e.getFichaInspeccion() != null && 
                           e.getFichaInspeccion().equals(fichaId) &&
                           e.getNumeroHoja() != null && e.getNumeroHoja().equals(hoja))
                .toList();
    }
}
