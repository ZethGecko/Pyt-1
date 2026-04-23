package com.example.demo.service;

import com.example.demo.model.SeguimientoTramite;
import com.example.demo.repository.SeguimientoTramiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SeguimientoTramiteService {

    @Autowired
    private SeguimientoTramiteRepository repo;

    public List<SeguimientoTramite> listarTodos() {
        return repo.findAll();
    }

    public Optional<SeguimientoTramite> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<SeguimientoTramite> listarPorTramite(Long tramiteId) {
        return repo.findByTramiteId(tramiteId);
    }

    public SeguimientoTramite obtenerActivo(Long tramiteId) {
        return repo.findActivoByTramiteId(tramiteId);
    }

    public SeguimientoTramite crear(SeguimientoTramite seguimiento) {
        seguimiento.setFechaCreacion(LocalDateTime.now());
        seguimiento.setFechaActualizacion(LocalDateTime.now());
        return repo.save(seguimiento);
    }

    public SeguimientoTramite actualizar(SeguimientoTramite seguimiento) {
        seguimiento.setFechaActualizacion(LocalDateTime.now());
        return repo.save(seguimiento);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public SeguimientoTramite iniciarSeguimiento(Long tramiteId, Long etapaId) {
        SeguimientoTramite seguimiento = new SeguimientoTramite();
        seguimiento.setTramiteId(tramiteId);
        seguimiento.setEtapaActualId(etapaId);
        seguimiento.setEstadoEtapa("EN_PROGRESO");
        seguimiento.setFechaInicioEtapa(LocalDateTime.now());
        return crear(seguimiento);
    }

    public SeguimientoTramite avanzarEtapa(Long seguimientoId, Long siguienteEtapaId) {
        Optional<SeguimientoTramite> opt = repo.findById(seguimientoId);
        if (opt.isPresent()) {
            SeguimientoTramite seg = opt.get();
            seg.setEtapaActualId(siguienteEtapaId);
            seg.setFechaInicioEtapa(LocalDateTime.now());
            seg.setEstadoEtapa("EN_PROGRESO");
            return actualizar(seg);
        }
        return null;
    }

    public SeguimientoTramite completarEtapa(Long seguimientoId, String observaciones) {
        Optional<SeguimientoTramite> opt = repo.findById(seguimientoId);
        if (opt.isPresent()) {
            SeguimientoTramite seg = opt.get();
            seg.setEstadoEtapa("COMPLETADA");
            seg.setFechaFinEtapa(LocalDateTime.now());
            if (observaciones != null) {
                seg.setObservaciones(observaciones);
            }
            return actualizar(seg);
        }
        return null;
    }

    public SeguimientoTramite bloquearEtapa(Long seguimientoId, String motivo) {
        Optional<SeguimientoTramite> opt = repo.findById(seguimientoId);
        if (opt.isPresent()) {
            SeguimientoTramite seg = opt.get();
            seg.setEstadoEtapa("BLOQUEADA");
            seg.setObservaciones(motivo);
            return actualizar(seg);
        }
        return null;
    }

    public SeguimientoTramite desbloquearEtapa(Long seguimientoId) {
        Optional<SeguimientoTramite> opt = repo.findById(seguimientoId);
        if (opt.isPresent()) {
            SeguimientoTramite seg = opt.get();
            seg.setEstadoEtapa("EN_PROGRESO");
            return actualizar(seg);
        }
        return null;
    }

    public SeguimientoTramite asignarResponsable(Long seguimientoId, Long usuarioId, Long departamentoId) {
        Optional<SeguimientoTramite> opt = repo.findById(seguimientoId);
        if (opt.isPresent()) {
            SeguimientoTramite seg = opt.get();
            if (usuarioId != null) seg.setUsuarioResponsableId(usuarioId);
            if (departamentoId != null) seg.setDepartamentoResponsableId(departamentoId);
            return actualizar(seg);
        }
        return null;
    }
}