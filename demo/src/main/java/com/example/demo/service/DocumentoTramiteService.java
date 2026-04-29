 package com.example.demo.service;

 import java.time.LocalDateTime;
 import java.util.ArrayList;
 import java.util.HashMap;
 import java.util.List;
 import java.util.Map;
 import java.util.Optional;

 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.security.core.Authentication;
 import org.springframework.security.core.context.SecurityContextHolder;
 import org.springframework.security.core.userdetails.UserDetails;
 import org.springframework.stereotype.Service;
 import org.springframework.transaction.annotation.Transactional;

 import com.example.demo.model.DocumentoTramite;
 import com.example.demo.model.InstanciaTramite;
 import com.example.demo.model.Users;
 import com.example.demo.repository.DocumentoTramiteRepository;
 import com.example.demo.repository.InstanciaTramiteRepository;
 import com.example.demo.repository.TramiteRepository;
 import com.example.demo.repository.UsersRepository;

@Service
public class DocumentoTramiteService {

    @Autowired
    private DocumentoTramiteRepository repo;

    @Autowired
    private UsersRepository usersRepo;
    
    @Autowired
    private InstanciaTramiteRepository instanciaRepository;
    
    @Autowired
    private TramiteRepository tramiteRepository;

    public List<DocumentoTramite> listarTodos() {
        return repo.findAll();
    }

    public Optional<DocumentoTramite> buscarPorId(Long id) {
        return repo.findById(id);
    }

     @Transactional(readOnly = true)
     public List<DocumentoTramite> listarPorTramite(Long tramiteId) {
         return repo.findAll().stream()
                 .filter(d -> d.getTramiteId() != null && d.getTramiteId().equals(tramiteId))
                 .toList();
     }

    public List<DocumentoTramite> listarPorInstancia(Long instanciaId) {
        return repo.findByInstanciaTramiteIdInstancia(instanciaId);
    }

    public List<DocumentoTramite> listarPorRequisito(Long requisitoId) {
        return repo.findAll().stream()
                .filter(d -> d.getRequisitoId() != null && d.getRequisitoId().equals(requisitoId))
                .toList();
    }

    public List<DocumentoTramite> listarPorEstado(String estado) {
        return repo.findAll().stream()
                .filter(d -> estado != null && estado.equals(d.getEstado()))
                .toList();
    }

    public List<DocumentoTramite> listarPorUsuarioAsignado(Long usuarioId) {
        return repo.findAll().stream()
                .filter(d -> d.getUsuarioAsignado() != null && 
                           d.getUsuarioAsignado().getIdUsuarios().equals(usuarioId))
                .toList();
    }

     @Transactional
     public DocumentoTramite presentarDocumento(DocumentoTramite doc) {
         if (doc.getTramiteId() == null) {
             throw new IllegalArgumentException("El trámite es obligatorio");
         }
         if (doc.getRequisitoId() == null) {
             throw new IllegalArgumentException("El requisito es obligatorio");
         }
         doc.setEstado("PRESENTADO");
         doc.setFechaPresentacion(LocalDateTime.now());
         if (doc.getFechaCreacion() == null) {
             doc.setFechaCreacion(LocalDateTime.now());
         }
         if (doc.getFechaActualizacion() == null) {
             doc.setFechaActualizacion(LocalDateTime.now());
         }
         doc.setVersion(1L);
         DocumentoTramite guardado = guardar(doc);

         // Actualizar estado del trámite
         actualizarEstadoTramite(guardado.getTramiteId());

         return guardado;
     }

    @Transactional
    public DocumentoTramite asignarParaRevision(Long docId, Long usuarioId) {
        DocumentoTramite doc = repo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado"));
        if (!"PRESENTADO".equals(doc.getEstado())) {
            throw new IllegalArgumentException("El documento debe estar en estado PRESENTADO para ser asignado");
        }
        Users usuario = usersRepo.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        doc.setUsuarioAsignado(usuario);
        doc.setFechaAsignacion(LocalDateTime.now());
        doc.setEstado("EN_REVISION");
        doc.setIntentosRevision((doc.getIntentosRevision() != null ? doc.getIntentosRevision() : 0) + 1);
        doc.setFechaActualizacion(LocalDateTime.now());
        DocumentoTramite guardado = repo.save(doc);
        
        // Actualizar fecha de la instancia
        actualizarFechaInstancia(guardado);
        
        // Actualizar estado del trámite
        actualizarEstadoTramite(guardado.getTramiteId());

        return guardado;
    }

    @Transactional
    public DocumentoTramite aprobarDocumento(Long docId, Long usuarioId, String observaciones) {
        DocumentoTramite doc = repo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado"));

        // Se permite aprobar desde cualquier estado (superadmin puede forzar)
        Users usuario = usersRepo.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        doc.setUsuarioRevisa(usuario);
        doc.setFechaRevision(LocalDateTime.now());
        doc.setEstado("APROBADO");
        if (observaciones != null) {
            doc.setObservaciones(observaciones);
        }

        // Si estaba PENDIENTE, se considera que se presentó al aprobar
        if (!"EN_REVISION".equals(doc.getEstado()) && !"PRESENTADO".equals(doc.getEstado())) {
            doc.setFechaPresentacion(LocalDateTime.now());
        }

        doc.setFechaActualizacion(LocalDateTime.now());
        DocumentoTramite guardado = repo.save(doc);
        
        // Actualizar fecha de la instancia
        actualizarFechaInstancia(guardado);

        // Actualizar estado del trámite
        actualizarEstadoTramite(guardado.getTramiteId());

        return guardado;
    }

    @Transactional
    public DocumentoTramite rechazarDocumento(Long docId, Long usuarioId, String observaciones, String motivo) {
        DocumentoTramite doc = repo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado"));

        // Se permite reprobar desde cualquier estado (superadmin puede forzar)
        Users usuario = usersRepo.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        doc.setUsuarioRevisa(usuario);
        doc.setFechaRevision(LocalDateTime.now());
        doc.setEstado("REPROBADO");
        if (observaciones != null) {
            doc.setObservaciones(observaciones);
        }
        if (motivo != null) {
            doc.setHistorialCambios((doc.getHistorialCambios() != null ? doc.getHistorialCambios() + "\n" : "") +
                                    "RECHAZADO: " + motivo + " - " + LocalDateTime.now());
        }
        // Reset assignment
        doc.setUsuarioAsignado(null);
        doc.setFechaAsignacion(null);

        // Si estaba PENDIENTE o cualquier otro, se considera presentación al reprobar
        if (!"EN_REVISION".equals(doc.getEstado()) && !"PRESENTADO".equals(doc.getEstado())) {
            doc.setFechaPresentacion(LocalDateTime.now());
        }

        doc.setFechaActualizacion(LocalDateTime.now());
        DocumentoTramite guardado = repo.save(doc);
        
        // Actualizar fecha de la instancia
        actualizarFechaInstancia(guardado);

        // Actualizar estado del trámite
        actualizarEstadoTramite(guardado.getTramiteId());

        return guardado;
    }

    @Transactional
    public DocumentoTramite observarDocumento(Long docId, Long usuarioId, String observaciones) {
        DocumentoTramite doc = repo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado"));
        
        // Se permite observación desde cualquier estado (superadmin puede forzar)
        Users usuario = usersRepo.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        doc.setUsuarioRevisa(usuario);
        doc.setFechaRevision(LocalDateTime.now());
        doc.setEstado("OBSERVADO");
        if (observaciones != null) {
            doc.setObservaciones(observaciones);
        }
        
        // Si el documento no estaba previamente presentado, se marca fecha de presentación
        if (!"EN_REVISION".equals(doc.getEstado()) && !"PRESENTADO".equals(doc.getEstado())) {
            doc.setFechaPresentacion(LocalDateTime.now());
        }
        
        doc.setFechaActualizacion(LocalDateTime.now());
        DocumentoTramite guardado = repo.save(doc);
        
        // Actualizar fecha de la instancia
        actualizarFechaInstancia(guardado);

        // Actualizar estado del trámite
        actualizarEstadoTramite(guardado.getTramiteId());

        return guardado;
    }

    @Transactional
    public DocumentoTramite rePresentarDocumento(Long docId, String nuevaRuta, String nuevoNombre, 
                                                 String tipoArchivo, Long tamano) {
        DocumentoTramite doc = repo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado"));
        if (!"OBSERVADO".equals(doc.getEstado()) && !"REPROBADO".equals(doc.getEstado())) {
            throw new IllegalArgumentException("El documento debe estar OBSERVADO o REPROBADO para re-presentar");
        }
        doc.setRutaArchivo(nuevaRuta);
        doc.setNombreArchivo(nuevoNombre);
        doc.setTipoArchivo(tipoArchivo);
        doc.setTamanoArchivo(tamano);
        doc.setFechaPresentacion(LocalDateTime.now());
        doc.setEstado("PRESENTADO");
        doc.setVersion((doc.getVersion() != null ? doc.getVersion() : 0) + 1);
        doc.setUsuarioAsignado(null);
        doc.setFechaAsignacion(null);
        doc.setUsuarioRevisa(null);
        doc.setFechaRevision(null);
        doc.setFechaActualizacion(LocalDateTime.now());
        DocumentoTramite guardado = repo.save(doc);
        
        // Actualizar fecha de la instancia
        actualizarFechaInstancia(guardado);

        // Actualizar estado del trámite
        actualizarEstadoTramite(guardado.getTramiteId());

        return guardado;
    }

    @Transactional
    public DocumentoTramite generarCertificado(Long docId, String numeroCertificado) {
        DocumentoTramite doc = repo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado"));
        if (!"APROBADO".equals(doc.getEstado())) {
            throw new IllegalArgumentException("Solo documentos APROBADOS pueden generar certificado");
        }
        doc.setCertificadoNumero(numeroCertificado);
        doc.setFechaActualizacion(LocalDateTime.now());
        return repo.save(doc);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public long countByEstado(String estado) {
        return repo.findAll().stream()
                .filter(d -> estado.equals(d.getEstado()))
                .count();
    }

    public List<DocumentoTramite> listarPendientesPorUsuario(Long usuarioId) {
        return repo.findAll().stream()
                .filter(d -> "EN_REVISION".equals(d.getEstado()) &&
                           d.getUsuarioAsignado() != null &&
                           d.getUsuarioAsignado().getIdUsuarios().equals(usuarioId))
                .toList();
    }

    public DocumentoTramite getDocumentoConArchivo(Long docId) {
        return repo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado"));
    }
    
     @Transactional
     public DocumentoTramite guardar(DocumentoTramite doc) {
         // Si el documento tiene una instancia con solo ID, cargarla completamente desde BD
         if (doc.getInstanciaTramite() != null && doc.getInstanciaTramite().getIdInstancia() != null) {
             InstanciaTramite instancia = instanciaRepository.findById(doc.getInstanciaTramite().getIdInstancia())
                 .orElseThrow(() -> new IllegalArgumentException("Instancia no encontrada con id: " + doc.getInstanciaTramite().getIdInstancia()));
             doc.setInstanciaTramite(instancia);
         }
         DocumentoTramite guardado = repo.save(doc);
         
         // Actualizar fecha de la instancia asociada
         actualizarFechaInstancia(guardado);
         
         return guardado;
     }
     
     /**
      * Actualiza la fecha de actualización de la instancia asociada al documento
      */
     private void actualizarFechaInstancia(DocumentoTramite doc) {
         if (doc.getInstanciaTramite() != null && doc.getInstanciaTramite().getIdInstancia() != null) {
             InstanciaTramite instancia = instanciaRepository.findById(doc.getInstanciaTramite().getIdInstancia())
                 .orElse(null);
             if (instancia != null) {
                 instancia.setFechaActualizacion(LocalDateTime.now());
                 instanciaRepository.save(instancia);
             }
         }
     }

    public List<DocumentoTramite> getMisDocumentos() {
        // Obtener usuario autenticado del contexto de seguridad
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            return List.of();
        }
        
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        Users usuario = usersRepo.findByUsername(username);
        if (usuario == null) {
            return List.of();
        }
        
        Long usuarioId = usuario.getIdUsuarios();
        
        // Obtener IDs de trámites donde el usuario es el registrante
        List<Long> misTramitesIds = tramiteRepository.findIdsByUsuarioRegistraId(usuarioId);
        
        // Obtener todos los documentos (en un sistema real se usaría una consulta más eficiente)
        List<DocumentoTramite> todos = repo.findAll();
        
        // Filtrar: documentos de mis trámites o documentos asignados a mí para revisión
        List<DocumentoTramite> misDocumentos = new ArrayList<>();
        for (DocumentoTramite doc : todos) {
            boolean esDeMiTramite = doc.getTramiteId() != null && misTramitesIds.contains(doc.getTramiteId());
            boolean asignadoAMi = doc.getUsuarioAsignado() != null && 
                                  doc.getUsuarioAsignado().getIdUsuarios().equals(usuarioId);
            if (esDeMiTramite || asignadoAMi) {
                misDocumentos.add(doc);
            }
        }
        return misDocumentos;
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getProyeccionesPorTramite(Long tramiteId) {
        List<DocumentoTramite> documentos = repo.findByTramiteIdWithRequisito(tramiteId);

        List<java.util.Map<String, Object>> revisiones = documentos.stream().map(doc -> {
            java.util.Map<String, Object> rev = new java.util.HashMap<>();
            rev.put("id", doc.getIdDocumento());
            rev.put("tramiteId", doc.getTramiteId());
            rev.put("requisitoId", doc.getRequisitoId());
            rev.put("estado", doc.getEstado());
            rev.put("estadoFormateado", formatearEstado(doc.getEstado()));
            rev.put("colorEstado", getColorEstado(doc.getEstado()));
            rev.put("fechaPresentacion", doc.getFechaPresentacion());
            rev.put("fechaRevision", doc.getFechaRevision());
            rev.put("observaciones", doc.getObservaciones());
            if (doc.getRequisito() != null) {
                rev.put("requisitoNombre", doc.getRequisito().getDescripcion());
                rev.put("codigo", doc.getRequisito().getCodigo());
                rev.put("descripcion", doc.getRequisito().getDescripcion());
                rev.put("tipoDocumento", doc.getRequisito().getTipoDocumento());
                rev.put("obligatorio", doc.getRequisito().getObligatorio());
                rev.put("esExamen", doc.getRequisito().getEsExamen());
            } else {
                rev.put("requisitoNombre", null);
                rev.put("codigo", null);
                rev.put("descripcion", null);
                rev.put("tipoDocumento", null);
                rev.put("obligatorio", null);
                rev.put("esExamen", null);
            }
            rev.put("revisionUsuarioNombre", doc.getUsuarioRevisa() != null ? doc.getUsuarioRevisa().getUsername() : null);
            return rev;
        }).collect(java.util.stream.Collectors.toList());

        return revisiones;
    }

    private String formatearEstado(String estado) {
        if (estado == null) return "Desconocido";
        switch (estado.toUpperCase()) {
            case "PRESENTADO": return "Presentado";
            case "EN_REVISION": return "En revisión";
            case "APROBADO": return "Aprobado";
            case "REPROBADO": return "Reprobado";
            case "OBSERVADO": return "Observado";
            case "PENDIENTE": return "Pendiente";
            default: return estado;
        }
    }

    private String getColorEstado(String estado) {
        if (estado == null) return "secondary";
        switch (estado.toUpperCase()) {
            case "APROBADO": return "success";
            case "REPROBADO": case "OBSERVADO": return "danger";
            case "EN_REVISION": return "warning";
            case "PRESENTADO": return "info";
            default: return "secondary";
        }
    }

    /**
     * Actualiza el estado general del trámite basado en el estado de sus documentos.
     * Considera solo los requisitos (no exámenes) para determinar el estado.
     */
    @Transactional
    public void actualizarEstadoTramite(Long tramiteId) {
        // Obtener todos los documentos del trámite
        List<DocumentoTramite> documentos = repo.findByTramiteIdWithRequisito(tramiteId);

        // Filtrar solo requisitos (no exámenes). Incluir los que tienen esExamen = false o null
        List<DocumentoTramite> requisitos = documentos.stream()
                .filter(doc -> doc.getRequisito() != null && !Boolean.TRUE.equals(doc.getRequisito().getEsExamen()))
                .toList();

        if (requisitos.isEmpty()) {
            // No hay requisitos para evaluar, no se modifica el estado
            return;
        }

        // Contar por estado
        long aprobados = requisitos.stream()
                .filter(doc -> "APROBADO".equals(doc.getEstado()))
                .count();
        long observados = requisitos.stream()
                .filter(doc -> "OBSERVADO".equals(doc.getEstado()))
                .count();
        long reprobados = requisitos.stream()
                .filter(doc -> "REPROBADO".equals(doc.getEstado()))
                .count();
        long pendientesPresentados = requisitos.stream()
                .filter(doc -> "PENDIENTE".equals(doc.getEstado()) || "PRESENTADO".equals(doc.getEstado()))
                .count();
        long enRevision = requisitos.stream()
                .filter(doc -> "EN_REVISION".equals(doc.getEstado()))
                .count();

        String nuevoEstado;
        if (aprobados == requisitos.size()) {
            nuevoEstado = "APROBADO";
        } else if (reprobados > 0) {
            nuevoEstado = "REPROBADO";
        } else if (observados > 0) {
            nuevoEstado = "OBSERVADO";
        } else if (pendientesPresentados == requisitos.size()) {
            nuevoEstado = "PENDIENTE";
        } else if (enRevision > 0) {
            nuevoEstado = "EN_REVISION";
        } else {
            nuevoEstado = "EN_REVISION";
        }

        // Actualizar el trámite
        com.example.demo.model.Tramite tramite = tramiteRepository.findById(tramiteId)
                .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado"));
        tramite.setEstado(nuevoEstado);
        tramite.setFechaActualizacion(LocalDateTime.now());
        tramiteRepository.save(tramite);
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getProyeccionesPorInstancia(Long instanciaId) {
        List<DocumentoTramite> documentos = repo.findByInstanciaTramiteIdInstancia(instanciaId);

        List<java.util.Map<String, Object>> revisiones = documentos.stream().map(doc -> {
            java.util.Map<String, Object> rev = new java.util.HashMap<>();
            rev.put("id", doc.getIdDocumento());
            rev.put("tramiteId", doc.getTramiteId());
            rev.put("instanciaId", doc.getInstanciaTramite() != null ? doc.getInstanciaTramite().getIdInstancia() : null);
            rev.put("requisitoId", doc.getRequisitoId());
            rev.put("estado", doc.getEstado());
            rev.put("estadoFormateado", formatearEstado(doc.getEstado()));
            rev.put("colorEstado", getColorEstado(doc.getEstado()));
            rev.put("fechaPresentacion", doc.getFechaPresentacion());
            rev.put("fechaRevision", doc.getFechaRevision());
            rev.put("observaciones", doc.getObservaciones());
            if (doc.getRequisito() != null) {
                rev.put("requisitoNombre", doc.getRequisito().getDescripcion());
                rev.put("codigo", doc.getRequisito().getCodigo());
                rev.put("descripcion", doc.getRequisito().getDescripcion());
                rev.put("tipoDocumento", doc.getRequisito().getTipoDocumento());
                rev.put("obligatorio", doc.getRequisito().getObligatorio());
                rev.put("esExamen", doc.getRequisito().getEsExamen());
            } else {
                rev.put("requisitoNombre", null);
                rev.put("codigo", null);
                rev.put("descripcion", null);
                rev.put("tipoDocumento", null);
                rev.put("obligatorio", null);
                rev.put("esExamen", null);
            }
            rev.put("revisionUsuarioNombre", doc.getUsuarioRevisa() != null ? doc.getUsuarioRevisa().getUsername() : null);
            return rev;
        }).collect(java.util.stream.Collectors.toList());

        return revisiones;
    }
}
