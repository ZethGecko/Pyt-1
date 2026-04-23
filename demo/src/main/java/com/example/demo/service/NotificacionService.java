package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Notificacion;
import com.example.demo.repository.NotificacionRepository;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository repo;

    public List<Notificacion> listarTodos() {
        return repo.findAll();
    }

    public Optional<Notificacion> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<Notificacion> listarPorDestinatario(Long usuarioId) {
        return repo.findAll().stream()
                .filter(n -> n.getUsuarioDestinatario() != null && 
                           n.getUsuarioDestinatario().getIdUsuarios().equals(usuarioId))
                .collect(Collectors.toList());
    }

    public List<Notificacion> listarPorEstado(String estado) {
        return repo.findAll().stream()
                .filter(n -> estado != null && estado.equals(n.getEstado()))
                .collect(Collectors.toList());
    }

    public List<Notificacion> listarPorTipo(String tipo) {
        return repo.findAll().stream()
                .filter(n -> tipo != null && tipo.equals(n.getTipoNotificacion()))
                .collect(Collectors.toList());
    }

    public List<Notificacion> listarPorTramite(Long tramiteId) {
        return repo.findAll().stream()
                .filter(n -> n.getTramite() != null && n.getTramite().equals(tramiteId))
                .collect(Collectors.toList());
    }

    public long contarPendientes(Long usuarioId) {
        return listarPorDestinatario(usuarioId).stream()
                .filter(n -> "PENDIENTE".equals(n.getEstado()))
                .count();
    }

    public long contarUrgentes(Long usuarioId) {
        return listarPorDestinatario(usuarioId).stream()
                .filter(n -> n.getPrioridad() != null && n.getPrioridad() >= 8)
                .count();
    }

    public Notificacion crear(Notificacion notificacion) {
        if (notificacion.getFechaCreacion() == null) {
            notificacion.setFechaCreacion(LocalDateTime.now());
        }
        if (notificacion.getEstado() == null) {
            notificacion.setEstado("PENDIENTE");
        }
        return repo.save(notificacion);
    }

    public Notificacion marcarComoLeida(Long id) {
        return repo.findById(id).map(notificacion -> {
            if (notificacion.getFechaLeida() == null) {
                notificacion.setFechaLeida(LocalDateTime.now());
            }
            if ("PENDIENTE".equals(notificacion.getEstado())) {
                notificacion.setEstado("LEIDA");
            }
            return repo.save(notificacion);
        }).orElse(null);
    }

    public void marcarComoLeidasMasivo(List<Long> ids) {
        repo.findAllById(ids).forEach(n -> {
            if (n.getFechaLeida() == null) {
                n.setFechaLeida(LocalDateTime.now());
            }
            if ("PENDIENTE".equals(n.getEstado())) {
                n.setEstado("LEIDA");
            }
            repo.save(n);
        });
    }

    public void archivar(Long id) {
        repo.findById(id).ifPresent(n -> {
            n.setEstado("ARCHIVADA");
            repo.save(n);
        });
    }

    public void archivarMasivo(List<Long> ids) {
        repo.findAllById(ids).forEach(n -> {
            n.setEstado("ARCHIVADA");
            repo.save(n);
        });
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public long contarTotal() {
        return repo.count();
    }

    public long contarPorTipo(String tipo) {
        return listarPorTipo(tipo).size();
    }

    public Notificacion actualizar(Long id, Notificacion datos) {
        return repo.findById(id).map(notificacion -> {
            if (datos.getAsunto() != null) notificacion.setAsunto(datos.getAsunto());
            if (datos.getMensaje() != null) notificacion.setMensaje(datos.getMensaje());
            if (datos.getPrioridad() != null) notificacion.setPrioridad(datos.getPrioridad());
            if (datos.getEstado() != null) notificacion.setEstado(datos.getEstado());
            if (datos.getAccionRequerida() != null) notificacion.setAccionRequerida(datos.getAccionRequerida());
            if (datos.getTramite() != null) notificacion.setTramite(datos.getTramite());
            if (datos.getTipoNotificacion() != null) notificacion.setTipoNotificacion(datos.getTipoNotificacion());
            if (datos.getUsuarioDestinatario() != null) notificacion.setUsuarioDestinatario(datos.getUsuarioDestinatario());
            if (datos.getUsuarioRemitente() != null) notificacion.setUsuarioRemitente(datos.getUsuarioRemitente());
            if (datos.getDepartamentoDestino() != null) notificacion.setDepartamentoDestino(datos.getDepartamentoDestino());
            return repo.save(notificacion);
        }).orElse(null);
    }
}
