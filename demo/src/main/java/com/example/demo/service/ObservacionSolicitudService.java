package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.ObservacionSolicitud;
import com.example.demo.repository.ObservacionSolicitudRepository;

@Service
public class ObservacionSolicitudService {

    @Autowired
    private ObservacionSolicitudRepository repo;

    public List<ObservacionSolicitud> listarTodos() {
        return repo.findAll();
    }

    public Optional<ObservacionSolicitud> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<ObservacionSolicitud> listarPorSolicitud(Long solicitudId) {
        return repo.findAll().stream()
                .filter(o -> o.getSolicitud() != null && 
                           o.getSolicitud().getIdSolicitud() != null &&
                           o.getSolicitud().getIdSolicitud().equals(solicitudId))
                .toList();
    }

    public List<ObservacionSolicitud> listarPorTramite(Long tramiteId) {
        return repo.findAll().stream()
                .filter(o -> o.getTramite() != null && 
                           o.getTramite().getIdTramite() != null &&
                           o.getTramite().getIdTramite().equals(tramiteId))
                .toList();
    }

    public List<ObservacionSolicitud> listarPorEstado(String estado) {
        return repo.findAll().stream()
                .filter(o -> estado != null && estado.equals(o.getEstado()))
                .toList();
    }

    public List<ObservacionSolicitud> listarPorTipo(String tipo) {
        return repo.findAll().stream()
                .filter(o -> tipo != null && tipo.equals(o.getTipo()))
                .toList();
    }

    public List<ObservacionSolicitud> listarPorSeveridad(String severidad) {
        return repo.findAll().stream()
                .filter(o -> severidad != null && severidad.equals(o.getSeveridad()))
                .toList();
    }

    public ObservacionSolicitud crear(ObservacionSolicitud obs) {
        if (obs.getFechaObservacion() == null) {
            obs.setFechaObservacion(LocalDateTime.now());
        }
        if (obs.getEstado() == null) {
            obs.setEstado("PENDIENTE");
        }
        return repo.save(obs);
    }

    public ObservacionSolicitud actualizar(Long id, ObservacionSolicitud datos) {
        return repo.findById(id).map(obs -> {
            if (datos.getDescripcion() != null) obs.setDescripcion(datos.getDescripcion());
            if (datos.getTipo() != null) obs.setTipo(datos.getTipo());
            if (datos.getSeveridad() != null) obs.setSeveridad(datos.getSeveridad());
            if (datos.getEstado() != null) obs.setEstado(datos.getEstado());
            if (datos.getComentarioSubsanacion() != null) obs.setComentarioSubsanacion(datos.getComentarioSubsanacion());
            if (datos.getFechaSubsanacion() != null) obs.setFechaSubsanacion(datos.getFechaSubsanacion());
            if (datos.getSolicitud() != null) obs.setSolicitud(datos.getSolicitud());
            if (datos.getTramite() != null) obs.setTramite(datos.getTramite());
            if (datos.getRequisito() != null) obs.setRequisito(datos.getRequisito());
            if (datos.getUsuarioObservador() != null) obs.setUsuarioObservador(datos.getUsuarioObservador());
            if (datos.getUsuarioSubsana() != null) obs.setUsuarioSubsana(datos.getUsuarioSubsana());
            return repo.save(obs);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public List<ObservacionSolicitud> bulkCreate(List<ObservacionSolicitud> observaciones) {
        return repo.saveAll(observaciones);
    }

    public long countBySeveridad(String severidad) {
        return repo.findAll().stream()
                .filter(o -> severidad.equals(o.getSeveridad()))
                .count();
    }

    public long countByEstado(String estado) {
        return repo.findAll().stream()
                .filter(o -> estado.equals(o.getEstado()))
                .count();
    }
}
