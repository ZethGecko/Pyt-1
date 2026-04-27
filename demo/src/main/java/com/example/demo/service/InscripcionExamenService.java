package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.InscripcionExamenRegistroDTO;
import com.example.demo.model.GrupoPresentacion;
import com.example.demo.model.InscripcionExamen;
import com.example.demo.model.PersonaNatural;
import com.example.demo.model.Tramite;
import com.example.demo.repository.GrupoPresentacionRepository;
import com.example.demo.repository.InscripcionExamenRepository;
import com.example.demo.repository.PersonaNaturalRepository;
import com.example.demo.repository.TramiteRepository;

@Service
public class InscripcionExamenService {

    @Autowired
    private InscripcionExamenRepository repo;

    @Autowired
    private PersonaNaturalRepository personaRepo;

    @Autowired
    private GrupoPresentacionRepository grupoRepo;

    @Autowired
    private TramiteRepository tramiteRepo;

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

    // Asigna el trámite más reciente de la persona a la inscripción (si no tiene). Devuelve true si asignó.
    private boolean asignarTramiteSiEsNecesario(InscripcionExamen inscripcion) {
        if (inscripcion.getTramiteId() == null && inscripcion.getPersonaId() != null) {
            List<Tramite> tramites = tramiteRepo.findByPersonaNatural_IdPersonaNatural(inscripcion.getPersonaId());
            if (!tramites.isEmpty()) {
                Tramite masReciente = tramites.stream()
                        .max(Comparator.comparing(Tramite::getFechaRegistro))
                        .orElse(tramites.get(0));
                inscripcion.setTramiteId(masReciente.getIdTramite());
                System.out.println("[InscripcionExamenService] Asignado tramiteId=" + masReciente.getIdTramite() + " a inscripcion personaId=" + inscripcion.getPersonaId());
                return true;
            }
        }
        return false;
    }

    public long contarPorGrupo(Long grupoId) {
        return repo.countByGrupoPresentacionIdAndActivoTrue(grupoId);
    }

    public List<InscripcionExamen> listarPorEstado(String estado) {
        return repo.findAll().stream()
                .filter(i -> estado != null && estado.equals(i.getEstado()))
                .toList();
    }

    public List<InscripcionExamen> buscar(Long personaId, Long grupoId, String estado) {
        return repo.findAll().stream()
                .filter(i -> personaId == null || (i.getPersonaId() != null && i.getPersonaId().equals(personaId)))
                .filter(i -> grupoId == null || (i.getGrupoPresentacionId() != null && i.getGrupoPresentacionId().equals(grupoId)))
                .filter(i -> estado == null || (i.getEstado() != null && i.getEstado().equals(estado)))
                .toList();
    }

    // Método original (para compatibilidad con GrupoPresentacionController)
    @Transactional
    public InscripcionExamen inscribir(com.example.demo.model.InscripcionExamen inscripcion) {
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

        // Set defaults y sincronizar estado/resultado
        if (inscripcion.getEstado() == null) {
            inscripcion.setEstado("PENDIENTE");
        }
        inscripcion.setResultado(inscripcion.getEstado()); // resultado espejo de estado
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

        // Asignar trámite de la persona si no tiene
        asignarTramiteSiEsNecesario(inscripcion);

        // Reserve cupo
        grupo.reservarCupo();
        grupoRepo.save(grupo);

        return repo.save(inscripcion);
    }

    // Nuevo método que acepta DTO con DNI (para InscripcionExamenController)
    @Transactional
    public InscripcionExamen inscribir(InscripcionExamenRegistroDTO request) {
        // Validar que se proporcionó DNI
        if (request.getDni() == null) {
            throw new IllegalArgumentException("El DNI de la persona es obligatorio");
        }

        // Buscar persona por DNI
        PersonaNatural persona = personaRepo.findAll().stream()
                .filter(p -> p.getDni() != null && p.getDni().equals(request.getDni()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Persona no encontrada con DNI: " + request.getDni()));

        // Validar grupo de presentación
        if (request.getGrupoPresentacionId() == null) {
            throw new IllegalArgumentException("El grupo de presentación es obligatorio");
        }
        GrupoPresentacion grupo = grupoRepo.findById(request.getGrupoPresentacionId())
                .orElseThrow(() -> new IllegalArgumentException("Grupo de presentación no encontrado"));

        // Verificar si ya está inscrito
        boolean yaInscrito = repo.findAll().stream()
                .anyMatch(i -> i.getPersonaId() != null && i.getPersonaId().equals(persona.getId()) &&
                             i.getGrupoPresentacionId() != null && i.getGrupoPresentacionId().equals(request.getGrupoPresentacionId()) &&
                             i.getActivo() != null && i.getActivo());
        if (yaInscrito) {
            throw new IllegalArgumentException("La persona ya está inscrita en este grupo");
        }

        // Verificar cupos disponibles
        if (!grupo.tieneCuposDisponibles()) {
            throw new IllegalArgumentException("No hay cupos disponibles en el grupo");
        }

         // Crear inscripción
         InscripcionExamen inscripcion = new InscripcionExamen();
         inscripcion.setPersona(persona);
         inscripcion.setPersonaId(persona.getId());
         inscripcion.setGrupoPresentacion(grupo);
         inscripcion.setGrupoPresentacionId(request.getGrupoPresentacionId());

         // Valores por defecto y sincronizar estado/resultado
         if (request.getEstado() == null) {
             inscripcion.setEstado("PENDIENTE");
         } else {
             inscripcion.setEstado(request.getEstado());
         }
         inscripcion.setResultado(inscripcion.getEstado()); // resultado espejo de estado
         inscripcion.setPagado(request.getPagado() != null ? request.getPagado() : false);
         inscripcion.setActivo(true);
         if (request.getFechaInscripcion() != null) {
             inscripcion.setFechaInscripcion(request.getFechaInscripcion());
         } else {
             inscripcion.setFechaInscripcion(LocalDateTime.now());
         }
         inscripcion.setObservaciones(request.getObservaciones());

         // Asignar trámite de la persona si no tiene
         asignarTramiteSiEsNecesario(inscripcion);

        // Reservar cupo
        grupo.reservarCupo();
        grupoRepo.save(grupo);

        return repo.save(inscripcion);
    }

    @Transactional
    public InscripcionExamen actualizar(Long id, InscripcionExamen datos) {
        System.out.println("[InscripcionExamenService] Actualizando inscripción id=" + id +
                           " estado=" + datos.getEstado() +
                           ", pagado=" + datos.getPagado() +
                           ", resultado=" + datos.getResultado());
        return repo.findById(id).map(inscripcion -> {
            System.out.println("[InscripcionExamenService] Inscripción encontrada: id=" + inscripcion.getIdInscripcion() +
                              ", estadoActual=" + inscripcion.getEstado() +
                              ", pagadoActual=" + inscripcion.getPagado() +
                              ", resultadoActual=" + inscripcion.getResultado());
            boolean changed = false;

            // Sincronizar estado y resultado: siempre deben ser iguales
            if (datos.getEstado() != null && !datos.getEstado().equals(inscripcion.getEstado())) {
                inscripcion.setEstado(datos.getEstado());
                inscripcion.setResultado(datos.getEstado()); // resultado espejo de estado
                changed = true;
                System.out.println("[InscripcionExamenService] -> Estado/Resultado cambiados a: " + datos.getEstado());
            } else if (datos.getResultado() != null && !datos.getResultado().equals(inscripcion.getResultado())) {
                // Si se modifica resultado, también actualizar estado
                inscripcion.setResultado(datos.getResultado());
                inscripcion.setEstado(datos.getResultado()); // estado espejo de resultado
                changed = true;
                System.out.println("[InscripcionExamenService] -> Resultado/Estado cambiados a: " + datos.getResultado());
            }

            if (datos.getNota() != null && !datos.getNota().equals(inscripcion.getNota())) {
                inscripcion.setNota(datos.getNota());
                changed = true;
            }
            if (datos.getPagado() != null && !datos.getPagado().equals(inscripcion.getPagado())) {
                inscripcion.setPagado(datos.getPagado());
                changed = true;
                System.out.println("[InscripcionExamenService] -> Pagado cambiado a: " + datos.getPagado());
            }
            if (datos.getActivo() != null && !datos.getActivo().equals(inscripcion.getActivo())) {
                inscripcion.setActivo(datos.getActivo());
                changed = true;
            }
            if (datos.getObservaciones() != null && !datos.getObservaciones().equals(inscripcion.getObservaciones())) {
                inscripcion.setObservaciones(datos.getObservaciones());
                changed = true;
            }
            if (datos.getTramiteId() != null && !datos.getTramiteId().equals(inscripcion.getTramiteId())) {
                inscripcion.setTramiteId(datos.getTramiteId());
                changed = true;
            }

            // Si no tiene tramiteId, intentar asignar automáticamente
            if (inscripcion.getTramiteId() == null && inscripcion.getPersonaId() != null) {
                // Guardamos el valor anterior para verificar si cambia
                Long tramiteIdAnterior = inscripcion.getTramiteId();
                asignarTramiteSiEsNecesario(inscripcion);
                if (inscripcion.getTramiteId() != null && !inscripcion.getTramiteId().equals(tramiteIdAnterior)) {
                    changed = true;
                    System.out.println("[InscripcionExamenService] TramiteId asignado automáticamente: " + inscripcion.getTramiteId());
                }
            }

            // Si no tiene tramiteId, intentar asignar automáticamente
            if (asignarTramiteSiEsNecesario(inscripcion)) {
                changed = true;
            }

            if (changed) {
                InscripcionExamen saved = repo.save(inscripcion);
                System.out.println("[InscripcionExamenService] Inscripción guardada: id=" + saved.getIdInscripcion() +
                                  ", estado=" + saved.getEstado() + ", resultado=" + saved.getResultado() + ", pagado=" + saved.getPagado());
                return saved;
            } else {
                System.out.println("[InscripcionExamenService] No hubo cambios, devolviendo entidad existente");
                return inscripcion;
            }
        }).orElse(null);
    }

    @Transactional
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
