package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.HistorialTramite;
import com.example.demo.repository.HistorialTramiteRepository;

@Service
public class HistorialTramiteService {

    @Autowired
    private HistorialTramiteRepository repo;

    public List<HistorialTramite> listarTodos() {
        return repo.findAll();
    }

    public Optional<HistorialTramite> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<HistorialTramite> listarPorTramite(Long tramiteId) {
        return repo.findAll().stream()
                .filter(h -> h.getTramiteId() != null && h.getTramiteId().equals(tramiteId))
                .toList();
    }

    public List<HistorialTramite> listarPorUsuarioAccion(Long usuarioId) {
        return repo.findAll().stream()
                .filter(h -> h.getUsuarioAccionId() != null && h.getUsuarioAccionId().equals(usuarioId))
                .toList();
    }

    public List<HistorialTramite> listarPorUsuarioResponsable(Long usuarioId) {
        return repo.findAll().stream()
                .filter(h -> h.getUsuarioResponsableId() != null && h.getUsuarioResponsableId().equals(usuarioId))
                .toList();
    }

    public List<HistorialTramite> listarPorAccion(String accion) {
        return repo.findAll().stream()
                .filter(h -> accion != null && h.getAccion().equals(accion))
                .toList();
    }

    public HistorialTramite crear(HistorialTramite historial) {
        if (historial.getFechaAccion() == null) {
            historial.setFechaAccion(LocalDateTime.now());
        }
        return repo.save(historial);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public long countByTramite(Long tramiteId) {
        return listarPorTramite(tramiteId).size();
    }

    public List<HistorialTramite> listarPorTramiteOrdenado(Long tramiteId) {
        return listarPorTramite(tramiteId).stream()
                .sorted((a, b) -> b.getFechaAccion().compareTo(a.getFechaAccion()))
                .toList();
    }

    public List<java.util.Map<String, Object>> obtenerLineaTiempo(Long tramiteId) {
        return listarPorTramiteOrdenado(tramiteId).stream()
                .map(h -> {
                    java.util.Map<String, Object> item = new java.util.HashMap<>();
                    item.put("id", h.getId());
                    item.put("fecha", h.getFechaAccion());
                    item.put("accion", h.getAccion());
                    item.put("observaciones", h.getObservacion());
                    item.put("usuario", h.getUsuarioAccion() != null ? h.getUsuarioAccion().getUsername() : null);
                    return item;
                })
                .toList();
    }

    public java.util.Map<String, Object> obtenerResumenHistorial(Long tramiteId) {
        List<HistorialTramite> historial = listarPorTramite(tramiteId);
        java.util.Map<String, Object> resumen = new java.util.HashMap<>();
        resumen.put("totalAcciones", historial.size());
        resumen.put("ultimaAccion", historial.stream().max((a, b) -> a.getFechaAccion().compareTo(b.getFechaAccion())).orElse(null));
        resumen.put("accionesPorTipo", historial.stream()
                .collect(java.util.stream.Collectors.groupingBy(HistorialTramite::getAccion, java.util.stream.Collectors.counting())));
        return resumen;
    }

    public HistorialTramite crearAutomatico(Long tramiteId, String accion, String observaciones) {
        HistorialTramite historial = new HistorialTramite();
        historial.setTramiteId(tramiteId);
        historial.setAccion(accion);
        historial.setObservacion(observaciones);
        historial.setFechaAccion(LocalDateTime.now());
        return crear(historial);
    }

    public java.util.Map<String, Object> obtenerEstadisticasPorUsuario(Long usuarioId) {
        List<HistorialTramite> historial = listarPorUsuarioAccion(usuarioId);
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalAcciones", historial.size());
        stats.put("accionesPorTipo", historial.stream()
                .collect(java.util.stream.Collectors.groupingBy(HistorialTramite::getAccion, java.util.stream.Collectors.counting())));
        return stats;
    }
}
