package com.example.demo.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TramiteCreateRequest;
import com.example.demo.dto.TramiteListadoDTO;
import com.example.demo.dto.TramiteUpdateRequest;
import com.example.demo.model.DocumentoTramite;
import com.example.demo.model.HistorialTramite;
import com.example.demo.model.Empresa;
import com.example.demo.model.Gerente;
import com.example.demo.model.PersonaNatural;
import com.example.demo.model.TipoTramite;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.repository.DocumentoTramiteRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.GerenteRepository;
import com.example.demo.repository.HistorialTramiteRepository;
import com.example.demo.repository.PersonaNaturalRepository;
import com.example.demo.repository.DocumentoTramiteRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.GerenteRepository;
import com.example.demo.repository.PersonaNaturalRepository;
import com.example.demo.repository.DepartamentoRepository;
import com.example.demo.repository.TipoTramiteRepository;
import com.example.demo.repository.TramiteRepository;
import com.example.demo.repository.UsersRepository;
import com.example.demo.model.Departamento;

@Service
public class TramiteService {

    @Autowired
    private TramiteRepository repo;

    @Autowired
    private TipoTramiteRepository repoTipoTramite;

    @Autowired
    private HistorialTramiteRepository historialRepo;

    @Autowired
    private DocumentoTramiteRepository documentoRepo;

    @Autowired
    private UsersRepository usersRepo;

    @Autowired
    private EmpresaRepository empresaRepo;

    @Autowired
    private GerenteRepository gerenteRepo;

     @Autowired
     private PersonaNaturalRepository personaNaturalRepo;

     @Autowired
     private DepartamentoRepository departamentoRepo;

     public List<Tramite> listarTodos() {
        return repo.findAll();
    }

    public Optional<Tramite> buscarPorId(Long id) {
        Tramite tramite = repo.findByIdWithTipoTramite(id);
        return Optional.ofNullable(tramite);
    }

    public Optional<Tramite> buscarPorCodigoRUT(String codigoRut) {
        Tramite tramite = repo.findByCodigoRutWithFetch(codigoRut);
        return Optional.ofNullable(tramite);
    }

    public List<TramiteListadoDTO> listarTodosEnriquecidos() {
        return repo.findAllEnriquecidos();
    }

    public List<TramiteListadoDTO> buscarEnriquecidos(String termino) {
        return repo.findEnriquecidosByTermino(termino);
    }

    public Map<String, Object> obtenerSeguimientoCompleto(String codigoRUT) {
        Tramite tramite = repo.findByCodigoRutEnriquecido(codigoRUT);
        if (tramite == null) {
            return null;
        }

        // Limpiar colecciones del tramite para evitar recursión
        tramite.setDocumentos(null);
        tramite.setHistorialTramites(null);
        tramite.setNotificaciones(null);
        tramite.setObservacionesSolicitudes(null);
        // Limpiar referencias en relaciones útiles para evitar ciclos
        if (tramite.getDepartamentoActual() != null) {
            tramite.getDepartamentoActual().setTramites(null);
        }
        if (tramite.getTipoTramite() != null) {
            tramite.getTipoTramite().setTramites(null);
            tramite.getTipoTramite().setExpedientes(null);
        }

        // Obtener historial con todas las relaciones
        List<HistorialTramite> historial = historialRepo.findByTramiteIdWithFetch(tramite.getIdTramite());
        // Eliminar referencia circular
        historial.forEach(h -> h.setTramite(null));

        // Obtener documentos con todas las relaciones
        List<DocumentoTramite> documentos = documentoRepo.findByTramiteIdWithFetch(tramite.getIdTramite());
        // Eliminar referencia circular y limpiar datos que causan ciclos
        documentos.forEach(d -> {
            d.setTramite(null);
            if (d.getRequisito() != null) {
                d.getRequisito().setDocumentos(null);
                d.getRequisito().setGruposPresentacion(null);
                d.getRequisito().setObservacionesSolicitudes(null);
            }
        });

        // Transformar documentos a formato de revisión (RequisitoRevision)
        List<Map<String, Object>> revisiones = documentos.stream().map(doc -> {
            Map<String, Object> rev = new java.util.HashMap<>();
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

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("tramite", tramite);
        response.put("historial", historial);
        response.put("documentos", documentos);
        response.put("revisiones", revisiones);
        return response;
    }

    // Mantener este para endpoint no-enriquecido
    public List<Tramite> buscarPorUsuarioRegistra(Long usuarioId) {
        return repo.findAll().stream()
                .filter(t -> t.getUsuarioRegistra() != null && t.getUsuarioRegistra().getIdUsuarios().equals(usuarioId))
                .toList();
    }

    // Nuevo para endpoint enriquecido
    public List<TramiteListadoDTO> listarPorUsuarioRegistraEnriquecidos(Long usuarioId) {
        return repo.findByUsuarioRegistraId(usuarioId);
    }

    public List<TramiteListadoDTO> listarPorUsuarioResponsable(Long usuarioId) {
        return repo.findByUsuarioResponsable_IdUsuarios(usuarioId);
    }

    public List<TramiteListadoDTO> listarPorSolicitante(Long solicitanteId) {
        return repo.findBySolicitanteId(solicitanteId);
    }

    public List<Tramite> listarActivos() {
        return repo.findAll().stream()
                .filter(t -> !"FINALIZADO".equals(t.getEstado()) && !"CANCELADO".equals(t.getEstado()))
                .toList();
    }

    public List<Tramite> listarAtrasados() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        return repo.findAll().stream()
                .filter(t -> t.getFechaLimite() != null && t.getFechaLimite().isBefore(now) &&
                           !"FINALIZADO".equals(t.getEstado()) && !"CANCELADO".equals(t.getEstado()))
                .toList();
    }

    public List<TramiteListadoDTO> filtrarEnriquecidos(String estado, String prioridad, Long tipoTramiteId,
                                                       Long solicitanteId, String search) {
        List<TramiteListadoDTO> todos = listarTodosEnriquecidos();
        return todos.stream()
            .filter(dto -> estado == null || estado.equals(dto.getEstado()))
            .filter(dto -> prioridad == null || prioridad.equals(dto.getPrioridad()))
            .filter(dto -> tipoTramiteId == null || (dto.getTipoTramiteId() != null && tipoTramiteId.equals(dto.getTipoTramiteId())))
            .filter(dto -> {
                if (solicitanteId == null) return true;
                return solicitanteId.equals(dto.getSolicitanteId());
            })
            .filter(dto -> search == null || (dto.getCodigoRUT() != null && dto.getCodigoRUT().toLowerCase().contains(search.toLowerCase())))
            .toList();
    }

    public Tramite crear(Tramite tramite) {
        System.out.println("[TramiteService] crear - Tramite antes de guardar:");
        System.out.println("[TramiteService] Empresa: " + tramite.getEmpresa());
        System.out.println("[TramiteService] PersonaNatural: " + tramite.getPersonaNatural());
        System.out.println("[TramiteService] Gerente: " + tramite.getGerente());
        System.out.println("[TramiteService] TipoSolicitante: " + tramite.getTipoSolicitante());

        // Set usuarioRegistra from current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            Users currentUser = null;

            if (principal instanceof UserDetails) {
                String username = ((UserDetails) principal).getUsername();
                currentUser = usersRepo.findByUsername(username);
            } else if (principal instanceof Users) {
                // Principal is already a Users object (from JWT filter)
                currentUser = (Users) principal;
            }

            if (currentUser != null) {
                tramite.setUsuarioRegistra(currentUser);
                // Set departamento actual from user's departamento if not already set
                if (tramite.getDepartamentoActual() == null && currentUser.getDepartamento() != null) {
                    tramite.setDepartamentoActual(currentUser.getDepartamento());
                }
            }
        }

        if (tramite.getFechaRegistro() == null) {
            tramite.setFechaRegistro(java.time.LocalDateTime.now());
        }
        if (tramite.getEstado() == null) {
            tramite.setEstado("REGISTRADO");
        }
        if (tramite.getTipoTramite() == null) {
            // Set default tipo tramite if null
            TipoTramite defaultTipo = repoTipoTramite.findAll().stream()
                    .filter(t -> "OBT".equals(t.getCodigo()))
                    .findFirst()
                    .orElse(null);
            if (defaultTipo != null) {
                tramite.setTipoTramite(defaultTipo);
            }
        }
        if (tramite.getCodigoRut() == null || tramite.getCodigoRut().trim().isEmpty()) {
            // Generar codigoRut basado en persona natural o generar único
            String generatedCode = generateCodigoRut(tramite);
            tramite.setCodigoRut(generatedCode);
        }

        Tramite saved = repo.save(tramite);
        System.out.println("[TramiteService] crear - Tramite después de guardar:");
        System.out.println("[TramiteService] ID: " + saved.getIdTramite());
        System.out.println("[TramiteService] Empresa: " + saved.getEmpresa());
        System.out.println("[TramiteService] PersonaNatural: " + saved.getPersonaNatural());
        System.out.println("[TramiteService] Gerente: " + saved.getGerente());

        return saved;
    }

    public Tramite crearDesdeRequest(TramiteCreateRequest request) {
        System.out.println("[TramiteService] crearDesdeRequest - Request: " + request);
        System.out.println("[TramiteService] tipoSolicitante: " + request.getTipoSolicitante());
        System.out.println("[TramiteService] solicitanteId: " + request.getSolicitanteId());

        Tramite tramite = new Tramite();

        // Set basic fields
        tramite.setCodigoRut(request.getCodigoRUT());
        tramite.setPrioridad(request.getPrioridad());
        tramite.setObservaciones(request.getObservaciones());
        tramite.setTipoSolicitante(request.getTipoSolicitante());

        // Load and set related entities
        if (request.getTipoTramiteId() != null) {
            TipoTramite tipoTramite = repoTipoTramite.findById(request.getTipoTramiteId()).orElse(null);
            tramite.setTipoTramite(tipoTramite);
            System.out.println("[TramiteService] TipoTramite asignado: " + tipoTramite);
        }

        if (request.getSolicitanteId() != null) {
            System.out.println("[TramiteService] Procesando solicitante, tipo: '" + request.getTipoSolicitante() + "', id: " + request.getSolicitanteId());
            String tipoSolicitante = request.getTipoSolicitante();
            if (tipoSolicitante == null) {
                System.out.println("[TramiteService] tipoSolicitante es null!");
            } else {
                switch (tipoSolicitante.trim().toLowerCase()) {
                    case "empresa":
                        Empresa empresa = empresaRepo.findById(Math.toIntExact(request.getSolicitanteId())).orElse(null);
                        tramite.setEmpresa(empresa);
                        System.out.println("[TramiteService] Empresa asignada: " + empresa);
                        break;
                    case "gerente":
                    case "vehiculo":
                        Gerente gerente = gerenteRepo.findById(Math.toIntExact(request.getSolicitanteId())).orElse(null);
                        tramite.setGerente(gerente);
                        System.out.println("[TramiteService] Gerente asignado: " + gerente);
                        break;
                    case "personanatural":
                        PersonaNatural personaNatural = personaNaturalRepo.findById(request.getSolicitanteId()).orElse(null);
                        tramite.setPersonaNatural(personaNatural);
                        System.out.println("[TramiteService] PersonaNatural asignada: " + personaNatural);
                        break;
                    default:
                        System.out.println("[TramiteService] Tipo de solicitante desconocido: '" + tipoSolicitante + "' (longitud: " + tipoSolicitante.length() + ")");
                        // Intentar mapear algunos casos conocidos
                        if ("GERENTE".equalsIgnoreCase(tipoSolicitante)) {
                            Gerente gerenteFallback = gerenteRepo.findById(Math.toIntExact(request.getSolicitanteId())).orElse(null);
                            tramite.setGerente(gerenteFallback);
                            System.out.println("[TramiteService] GERENTE asignado como fallback: " + gerenteFallback);
                        }
                }
            }
        } else {
            System.out.println("[TramiteService] solicitanteId es null");
        }

        Tramite savedTramite = crear(tramite);
        System.out.println("[TramiteService] Trámite guardado: " + savedTramite);
        System.out.println("[TramiteService] Empresa en trámite guardado: " + savedTramite.getEmpresa());
        System.out.println("[TramiteService] PersonaNatural en trámite guardado: " + savedTramite.getPersonaNatural());
        System.out.println("[TramiteService] Gerente en trámite guardado: " + savedTramite.getGerente());

        return savedTramite;
    }

    private String generateCodigoRut(Tramite tramite) {
        if (tramite.getPersonaNatural() != null && tramite.getPersonaNatural().getDni() != null) {
            // Usar DNI de persona natural + año actual
            int currentYear = java.time.LocalDateTime.now().getYear();
            return tramite.getPersonaNatural().getDni() + "-" + currentYear;
        } else if (tramite.getEmpresa() != null) {
            // Para empresas, usar RUC + año (asumiendo que empresa tiene RUC)
            // Por ahora, generar un código único
            return generateUniqueCode();
        } else {
            // Generar código único si no hay persona natural ni empresa
            return generateUniqueCode();
        }
    }

    private String generateUniqueCode() {
        // Generar un código único basado en timestamp
        long timestamp = System.currentTimeMillis();
        int random = (int)(Math.random() * 1000);
        return timestamp + "-" + random;
    }

    public Tramite actualizar(Long id, Tramite datos) {
        return repo.findById(id).map(tramite -> {
            if (datos.getCodigoRut() != null) tramite.setCodigoRut(datos.getCodigoRut());
            if (datos.getEstado() != null) tramite.setEstado(datos.getEstado());
            if (datos.getTipoSolicitante() != null) tramite.setTipoSolicitante(datos.getTipoSolicitante());
            if (datos.getPrioridad() != null) tramite.setPrioridad(datos.getPrioridad());
            if (datos.getFechaLimite() != null) tramite.setFechaLimite(datos.getFechaLimite());
            if (datos.getMotivoRechazo() != null) tramite.setMotivoRechazo(datos.getMotivoRechazo());
            if (datos.getObservaciones() != null) tramite.setObservaciones(datos.getObservaciones());
            if (datos.getTipoTramite() != null) tramite.setTipoTramite(datos.getTipoTramite());
            if (datos.getExpediente() != null) tramite.setExpediente(datos.getExpediente());
            if (datos.getEmpresa() != null) tramite.setEmpresa(datos.getEmpresa());
            if (datos.getPersonaNatural() != null) tramite.setPersonaNatural(datos.getPersonaNatural());
            if (datos.getDepartamentoActual() != null) tramite.setDepartamentoActual(datos.getDepartamentoActual());
            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    public Tramite actualizarDesdeRequest(Long id, TramiteUpdateRequest request) {
        return repo.findById(id).map(tramite -> {
            if (request.getCodigoRut() != null) tramite.setCodigoRut(request.getCodigoRut());
            if (request.getEstado() != null) tramite.setEstado(request.getEstado());
            if (request.getTipoSolicitante() != null) tramite.setTipoSolicitante(request.getTipoSolicitante());
            if (request.getPrioridad() != null) tramite.setPrioridad(request.getPrioridad());
            if (request.getObservaciones() != null) tramite.setObservaciones(request.getObservaciones());
            
            // Manejo mejorado de tipoTramiteId
            if (request.getTipoTramiteId() != null) {
                TipoTramite tipoTramite = repoTipoTramite.findById(request.getTipoTramiteId()).orElse(null);
                if (tipoTramite != null) {
                    tramite.setTipoTramite(tipoTramite);
                }
                // Si el tipoTramiteId no es válido, mantenemos el valor existente
                // en lugar de establecerlo a null, lo que causaría problemas de validación
            }
            
            // Solución: Manejar solicitante al actualizar (igual que en crearDesdeRequest)
            if (request.getSolicitanteId() != null && request.getTipoSolicitante() != null) {
                System.out.println("[TramiteService] Actualizando solicitante, tipo: '" + request.getTipoSolicitante() + "', id: " + request.getSolicitanteId());
                String tipoSolicitante = request.getTipoSolicitante().trim().toLowerCase();
                
                // Limpiar relaciones anteriores primero
                tramite.setEmpresa(null);
                tramite.setGerente(null);
                tramite.setPersonaNatural(null);
                
                switch (tipoSolicitante) {
                    case "empresa":
                        Empresa empresa = empresaRepo.findById(Math.toIntExact(request.getSolicitanteId())).orElse(null);
                        tramite.setEmpresa(empresa);
                        System.out.println("[TramiteService] Empresa actualizada: " + empresa);
                        break;
                    case "gerente":
                    case "vehiculo":
                        Gerente gerente = gerenteRepo.findById(Math.toIntExact(request.getSolicitanteId())).orElse(null);
                        tramite.setGerente(gerente);
                        System.out.println("[TramiteService] Gerente actualizado: " + gerente);
                        break;
                    case "personanatural":
                        PersonaNatural personaNatural = personaNaturalRepo.findById(request.getSolicitanteId()).orElse(null);
                        tramite.setPersonaNatural(personaNatural);
                        System.out.println("[TramiteService] PersonaNatural actualizada: " + personaNatural);
                        break;
                    default:
                        System.out.println("[TramiteService] Tipo de solicitante desconocido al actualizar: '" + tipoSolicitante + "'");
                }
            }

            // Solo asignar tipo por defecto si el tramite actualmente no tiene tipo de trámite asignado
            // y no se proporcionó uno nuevo en la solicitud (para mantener el existente durante actualización)
            if (tramite.getTipoTramite() == null && request.getTipoTramiteId() == null) {
                TipoTramite defaultTipo = repoTipoTramite.findAll().stream()
                        .filter(t -> "OBT".equals(t.getCodigo()))
                        .findFirst()
                        .orElse(null);
                if (defaultTipo != null) {
                    tramite.setTipoTramite(defaultTipo);
                    System.out.println("[TramiteService] Se asignó TipoTramite por defecto al actualizar (porque estaba null)");
                }
            }

            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public Tramite cambiarEstado(Long id, String nuevoEstado, String motivo) {
        return repo.findById(id).map(tramite -> {
            tramite.setEstado(nuevoEstado);
            if (motivo != null && !motivo.trim().isEmpty()) {
                tramite.setMotivoRechazo(motivo);
            }

            // Set default tipoTramite if null
            if (tramite.getTipoTramite() == null) {
                TipoTramite defaultTipo = repoTipoTramite.findAll().stream()
                        .filter(t -> "OBT".equals(t.getCodigo()))
                        .findFirst()
                        .orElse(null);
                if (defaultTipo != null) {
                    tramite.setTipoTramite(defaultTipo);
                }
            }

            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    public Tramite derivar(Long id, Long departamentoId, String motivo) {
        return repo.findById(id).map(tramite -> {
            tramite.setEstado("DERIVADO");
            if (departamentoId != null) {
                departamentoRepo.findById(departamentoId).ifPresent(dept -> tramite.setDepartamentoActual(dept));
            }
            if (motivo != null && !motivo.trim().isEmpty()) {
                tramite.setMotivoRechazo(motivo);
            }
            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    public Tramite aprobar(Long id, String observaciones) {
        return cambiarEstado(id, "APROBADO", observaciones);
    }

    public Tramite rechazar(Long id, String motivo) {
        return cambiarEstado(id, "RECHAZADO", motivo);
    }

    public Tramite observar(Long id, String observaciones) {
        return cambiarEstado(id, "OBSERVADO", observaciones);
    }

    public Tramite finalizar(Long id, String observaciones) {
        return cambiarEstado(id, "FINALIZADO", observaciones);
    }

    public Tramite cambiarPrioridad(Long id, String nuevaPrioridad) {
        return repo.findById(id).map(tramite -> {
            tramite.setPrioridad(nuevaPrioridad);
            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    public Tramite reingresar(Long id, String justificacion) {
        return repo.findById(id).map(tramite -> {
            tramite.setEstado("REINGRESADO");
            tramite.setObservaciones(justificacion);
            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    public void cancelar(Long id, String motivo) {
        cambiarEstado(id, "CANCELADO", motivo);
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

    public List<TramiteListadoDTO> listarPorDepartamento(Long departamentoId) {
        return repo.findByDepartamentoId(departamentoId);
    }

    // Método para actualizar trámites existentes que no tienen relaciones correctas
    public void actualizarTramitesExistentes() {
        List<Tramite> tramites = repo.findAll();
        for (Tramite tramite : tramites) {
            boolean updated = false;

            // Si no tiene departamento pero tiene usuario registra, asignar departamento del usuario
            if (tramite.getDepartamentoActual() == null && tramite.getUsuarioRegistra() != null
                && tramite.getUsuarioRegistra().getDepartamento() != null) {
                tramite.setDepartamentoActual(tramite.getUsuarioRegistra().getDepartamento());
                updated = true;
            }

            // Si no tiene tipo tramite pero el código RUT sugiere uno, asignarlo
            if (tramite.getTipoTramite() == null) {
                TipoTramite defaultTipo = repoTipoTramite.findAll().stream()
                        .filter(t -> "OBT".equals(t.getCodigo()))
                        .findFirst()
                        .orElse(null);
                if (defaultTipo != null) {
                    tramite.setTipoTramite(defaultTipo);
                    updated = true;
                }
            }

            if (updated) {
                repo.save(tramite);
            }
        }
    }
}
