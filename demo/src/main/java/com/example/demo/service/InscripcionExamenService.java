package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.GrupoPresentacion;
import com.example.demo.model.InscripcionExamen;
import com.example.demo.model.PersonaNatural;
import com.example.demo.repository.GrupoPresentacionRepository;
import com.example.demo.repository.InscripcionExamenRepository;
import com.example.demo.repository.PersonaNaturalRepository;

@Service
public class InscripcionExamenService {

    @Autowired
    private InscripcionExamenRepository repo;

    @Autowired
    private PersonaNaturalRepository personaRepo;

    @Autowired
    private GrupoPresentacionRepository grupoRepo;

    public List<InscripcionExamen> listarTodos() {
        return repo.findAll();
    }

    public Optional<InscripcionExamen> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<InscripcionExamen> listarPorGrupo(Long grupoId) {
        return repo.findByGrupoPresentacionId(grupoId);
    }

    public List<InscripcionExamen> listarPorGrupoActivos(Long grupoId) {
        return repo.findAll().stream()
                .filter(i -> i.getGrupoPresentacionId() != null && i.getGrupoPresentacionId().equals(grupoId) && Boolean.TRUE.equals(i.getActivo()))
                .toList();
    }

    public List<InscripcionExamen> listarPorPersona(Long personaId) {
        return repo.findAll().stream()
                .filter(i -> i.getPersonaId() != null && i.getPersonaId().equals(personaId))
                .toList();
    }

    public List<InscripcionExamen> listarPorPersonaActiva(Long personaId) {
        return repo.findAll().stream()
                .filter(i -> i.getPersonaId() != null && i.getPersonaId().equals(personaId) && Boolean.TRUE.equals(i.getActivo()))
                .toList();
    }

    public long contarPorGrupo(Long grupoId) {
        return repo.countByGrupoPresentacionIdAndActivoTrue(grupoId);
    }

    public List<InscripcionExamen> listarPorEstado(String estado) {
        return repo.findAll().stream()
                .filter(i -> estado != null && estado.equals(i.getEstado()))
                .toList();
    }

    @Transactional
    public InscripcionExamen inscribir(InscripcionExamen inscripcion) {
        // Validate persona exists
        if (inscripcion.getPersonaId() == null) {
            throw new IllegalArgumentException("La persona es obligatoria");
        }
        PersonaNatural persona = personaRepo.findById(inscripcion.getPersonaId())
                .orElseThrow(() -> new IllegalArgumentException("Persona no encontrada"));

        // Validate group exists
        if (inscripcion.getGrupoPresentacionId() == null) {
            throw new IllegalArgumentException("El grupo de presentación es obligatorio");
        }
        GrupoPresentacion grupo = grupoRepo.findById(inscripcion.getGrupoPresentacionId())
                .orElseThrow(() -> new IllegalArgumentException("Grupo de presentación no encontrado"));

        // Check if already enrolled
        boolean yaInscrito = repo.findAll().stream()
                .anyMatch(i -> i.getPersonaId().equals(inscripcion.getPersonaId()) &&
                             i.getGrupoPresentacionId().equals(inscripcion.getGrupoPresentacionId()) &&
                             i.getActivo() != null && i.getActivo());
        if (yaInscrito) {
            throw new IllegalArgumentException("La persona ya está inscrita en este grupo");
        }

        // Check group capacity
        if (!grupo.tieneCuposDisponibles()) {
            throw new IllegalArgumentException("No hay cupos disponibles en el grupo");
        }

        // Set defaults
        if (inscripcion.getEstado() == null) {
            inscripcion.setEstado("PENDIENTE");
        }
        if (inscripcion.getPagado() == null) {
            inscripcion.setPagado(false);
        }
        if (inscripcion.getActivo() == null) {
            inscripcion.setActivo(true);
        }
        if (inscripcion.getFechaInscripcion() == null) {
            inscripcion.setFechaInscripcion(LocalDateTime.now());
        }
        inscripcion.setPersona(persona);
        inscripcion.setGrupoPresentacion(grupo);

        // Reserve cupo
        grupo.reservarCupo();
        grupoRepo.save(grupo);

        return repo.save(inscripcion);
    }

    public InscripcionExamen actualizar(Long id, InscripcionExamen datos) {
        return repo.findById(id).map(inscripcion -> {
            if (datos.getEstado() != null) inscripcion.setEstado(datos.getEstado());
            if (datos.getResultado() != null) inscripcion.setResultado(datos.getResultado());
            if (datos.getNota() != null) inscripcion.setNota(datos.getNota());
            if (datos.getPagado() != null) inscripcion.setPagado(datos.getPagado());
            if (datos.getActivo() != null) inscripcion.setActivo(datos.getActivo());
            if (datos.getObservaciones() != null) inscripcion.setObservaciones(datos.getObservaciones());
            if (datos.getTramiteId() != null) inscripcion.setTramiteId(datos.getTramiteId());
            return repo.save(inscripcion);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.findById(id).ifPresent(inscripcion -> {
            // Liberate cupo in group if active
            if (inscripcion.getGrupoPresentacionId() != null && Boolean.TRUE.equals(inscripcion.getActivo())) {
                grupoRepo.findById(inscripcion.getGrupoPresentacionId()).ifPresent(grupo -> {
                    grupo.liberarCupo();
                    grupoRepo.save(grupo);
                });
            }
            repo.deleteById(id);
        });
    }

    @Transactional
    public void marcarResultado(Long inscripcionId, String resultado, Double nota) {
        repo.findById(inscripcionId).ifPresent(inscripcion -> {
            inscripcion.setResultado(resultado);
            if (nota != null) inscripcion.setNota(nota);
            repo.save(inscripcion);
        });
    }

    public boolean existeInscripcionActiva(Long personaId, Long grupoId) {
        return repo.findAll().stream()
                .anyMatch(i -> i.getPersonaId().equals(personaId) &&
                             i.getGrupoPresentacionId().equals(grupoId) &&
                             i.getActivo() != null && i.getActivo());
    }
}
