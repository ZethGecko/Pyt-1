package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.PuntoGeografico;
import com.example.demo.repository.PuntoGeograficoRepository;

@Service
public class PuntoGeograficoService {

    @Autowired
    private PuntoGeograficoRepository repo;

    public List<PuntoGeografico> listarTodos() {
        return repo.findAll();
    }

    public Optional<PuntoGeografico> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<PuntoGeografico> listarPorEmpresa(Long empresaId) {
        return repo.findAll().stream()
                .filter(p -> p.getEmpresaId() != null && p.getEmpresaId().equals(empresaId))
                .toList();
    }

    public List<PuntoGeografico> listarPorRuta(Long rutaId) {
        return repo.findAll().stream()
                .filter(p -> p.getRutaId() != null && p.getRutaId().equals(rutaId))
                .toList();
    }

    public List<PuntoGeografico> listarPrincipales() {
        return repo.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getEsPrincipal()))
                .toList();
    }

    public PuntoGeografico crear(PuntoGeografico punto) {
        if (punto.getFechaRegistro() == null) {
            punto.setFechaRegistro(LocalDateTime.now());
        }
        return repo.save(punto);
    }

    public PuntoGeografico actualizar(Long id, PuntoGeografico datos) {
        return repo.findById(id).map(punto -> {
            if (datos.getEmpresaId() != null) punto.setEmpresaId(datos.getEmpresaId());
            if (datos.getRutaId() != null) punto.setRutaId(datos.getRutaId());
            if (datos.getTipo() != null) punto.setTipo(datos.getTipo());
            if (datos.getNombreReferencia() != null) punto.setNombreReferencia(datos.getNombreReferencia());
            if (datos.getLatitud() != null) punto.setLatitud(datos.getLatitud());
            if (datos.getLongitud() != null) punto.setLongitud(datos.getLongitud());
            if (datos.getAltitud() != null) punto.setAltitud(datos.getAltitud());
            if (datos.getDireccion() != null) punto.setDireccion(datos.getDireccion());
            if (datos.getIdKml() != null) punto.setIdKml(datos.getIdKml());
            if (datos.getOrden() != null) punto.setOrden(datos.getOrden());
            if (datos.getEsPrincipal() != null) punto.setEsPrincipal(datos.getEsPrincipal());
            if (datos.getObservaciones() != null) punto.setObservaciones(datos.getObservaciones());
            punto.setFechaActualizacion(LocalDateTime.now());
            return repo.save(punto);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }
}
