package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.TramiteCreateRequest;
import com.example.demo.dto.TramiteListadoDTO;
import com.example.demo.dto.TramiteUpdateRequest;
import com.example.demo.model.Departamento;
import com.example.demo.model.DocumentoTramite;
import com.example.demo.model.Empresa;
import com.example.demo.model.Gerente;
import com.example.demo.model.HistorialTramite;
import com.example.demo.model.InscripcionExamen;
import com.example.demo.model.InstanciaTramite;
import com.example.demo.model.PersonaNatural;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.TipoTramite;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.repository.DepartamentoRepository;
import com.example.demo.repository.DocumentoTramiteRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.GerenteRepository;
import com.example.demo.repository.HistorialTramiteRepository;
import com.example.demo.repository.InscripcionExamenRepository;
import com.example.demo.repository.InstanciaTramiteRepository;
import com.example.demo.repository.PersonaNaturalRepository;
import com.example.demo.repository.TipoTramiteRepository;
import com.example.demo.repository.TramiteRepository;
import com.example.demo.repository.UsersRepository;

@Service
@Transactional(readOnly = true)
public class TramiteService {

    @Autowired
    private TramiteRepository repo;

    @Autowired
    private InstanciaTramiteRepository instanciaRepository;

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

      @Autowired
      private RequisitoTUPACService requisitoService;

      @Autowired
      private InscripcionExamenRepository inscripcionExamenRepository;

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

     public Map<String, Object> obtenerSeguimientoCompleto(String codigoRUT, Long instanciaId) {
         Tramite tramite = repo.findByCodigoRutEnriquecido(codigoRUT);
         if (tramite == null) {
             return null;
         }

          // Limpiar colecciones del tramite para evitar recursión
          tramite.setDocumentos(null);
          tramite.setHistorialTramites(null);
          if (tramite.getDepartamentoActual() != null) {
              tramite.getDepartamentoActual().setTramites(null);
          }
          if (tramite.getTipoTramite() != null) {
              tramite.getTipoTramite().setTramites(null);
          }

           // Obtener historial con todas las relaciones
           List<HistorialTramite> historial = historialRepo.findByTramiteIdWithFetch(tramite.getIdTramite());

            // Variables para documentos e inscripciones
            List<DocumentoTramite> documentos;
            List<InscripcionExamen> inscripciones;
            String warningInstancia = null;

            // Obtener instancias del trámite
          List<InstanciaTramite> instancias = instanciaRepository.findByTramite_IdTramiteOrderByFechaCreacionDesc(tramite.getIdTramite());
          System.out.println("[Seguimiento] Tramite " + tramite.getCodigoRut() + " - Instancias encontradas: " + instancias.size());

            // Determinar instancia seleccionada
            InstanciaTramite instanciaSeleccionada = null;
            if (instanciaId != null) {
               instanciaSeleccionada = instancias.stream()
                   .filter(i -> i.getIdInstancia() != null && instanciaId.longValue() == i.getIdInstancia().longValue())
                   .findFirst()
                   .orElse(null);
               System.out.println("[Seguimiento] Instancia solicitada: " + instanciaId + " -> encontrada: " + (instanciaSeleccionada != null));
               if (instanciaSeleccionada == null) {
                   System.out.println("[Seguimiento] Instancia ID " + instanciaId + " NO encontrada. IDs disponibles: " + 
                       instancias.stream().map(i -> i.getIdInstancia()).collect(Collectors.toList()));
                   // Usar la más reciente en lugar de lanzar excepción
                   instanciaSeleccionada = instancias.stream()
                       .filter(i -> "ACTIVO".equalsIgnoreCase(i.getEstado()))
                       .findFirst()
                       .orElse(instancias.get(0));
                   warningInstancia = "Instancia " + instanciaId + " no encontrada. Se cargó la instancia más reciente.";
               }
           }
          if (instanciaSeleccionada == null && !instancias.isEmpty()) {
              // Buscar instancia ACTIVA, si no, la más reciente
              instanciaSeleccionada = instancias.stream()
                  .filter(i -> "ACTIVO".equalsIgnoreCase(i.getEstado()))
                  .findFirst()
                  .orElse(instancias.get(0));
              System.out.println("[Seguimiento] Instancia seleccionada por defecto: " + instanciaSeleccionada.getIdInstancia() + " (" + instanciaSeleccionada.getIdentificador() + ")");
          } else if (instanciaSeleccionada != null) {
              System.out.println("[Seguimiento] Instancia seleccionada: " + instanciaSeleccionada.getIdInstancia() + " (" + instanciaSeleccionada.getIdentificador() + ")");
          } else {
              System.out.println("[Seguimiento] No hay instancias para este trámite");
          }

          // Obtener documentos e inscripciones, filtrando por instancia si corresponde
          if (instanciaSeleccionada != null) {
              Long instId = instanciaSeleccionada.getIdInstancia();
              System.out.println("[Seguimiento] Filtrando por instancia ID: " + instId);
              
              // Obtener todos los documentos e inscripciones del trámite (con fetch completo)
              documentos = documentoRepo.findByTramiteIdWithAllFetch(tramite.getIdTramite());
              inscripciones = inscripcionExamenRepository.findByTramiteId(tramite.getIdTramite());
              
              System.out.println("[Seguimiento] Antes de filtro: documentos=" + documentos.size() + 
                                ", inscripciones=" + inscripciones.size());
              
              // Log detallado de cada documento e inscripción
              for (DocumentoTramite doc : documentos) {
                  Long docInstId = doc.getInstanciaTramiteId();
                  System.out.println("[Seguimiento]   Doc id=" + doc.getIdDocumento() + 
                                    ", reqId=" + (doc.getRequisito() != null ? doc.getRequisito().getId() : "null") + 
                                    ", instanciaId=" + docInstId);
              }
              for (InscripcionExamen ins : inscripciones) {
                  Long insInstId = ins.getInstanciaTramite() != null ? ins.getInstanciaTramite().getIdInstancia() : null;
                  System.out.println("[Seguimiento]   Inscripcion id=" + ins.getIdInscripcion() + 
                                    ", instanciaId=" + insInstId);
              }
              
              // Filtrar documentos: solo los de la instancia seleccionada o sin instancia (globales)
              documentos = documentos.stream()
                  .filter(d -> {
                      Long docInstId = d.getInstanciaTramiteId();
                      return docInstId == null || docInstId.equals(instId);
                  })
                  .collect(Collectors.toList());
              
              // Filtrar inscripciones: solo las de la instancia seleccionada o sin instancia
              inscripciones = inscripciones.stream()
                  .filter(ins -> {
                      Long insInstId = ins.getInstanciaTramite() != null ? ins.getInstanciaTramite().getIdInstancia() : null;
                      return insInstId == null || insInstId.equals(instId);
                  })
                  .collect(Collectors.toList());
              
              System.out.println("[Seguimiento] Después de filtrar: documentos=" + documentos.size() + 
                                ", inscripciones=" + inscripciones.size());
          } else {
              // Si no hay instancias, obtener todos
              documentos = documentoRepo.findByTramiteIdWithAllFetch(tramite.getIdTramite());
              inscripciones = inscripcionExamenRepository.findByTramiteId(tramite.getIdTramite());
          }

          // Limpiar referencias circulares
          historial.forEach(h -> h.setTramite(null));
          documentos.forEach(d -> {
              d.setTramite(null);
              if (d.getRequisito() != null) {
                  d.getRequisito().setDocumentos(null);
                  d.getRequisito().setGruposPresentacion(null);
              }
          });
          inscripciones.forEach(ins -> {
              ins.setTramite(null);
              if (ins.getGrupoPresentacion() != null) {
                  ins.getGrupoPresentacion().setDocumentosTramite(null);
              }
              if (ins.getPersona() != null) {
                  ins.getPersona().setInscripciones(null);
              }
          });
           // Si no hay instanciaSeleccionada, se incluyen todos (documentos/inscripciones globales y por instancia)

          // Obtener TODOS los IDs de requisitos que deben mostrarse:
          // - Los asignados al tipo de trámite
          // - Los que aparecen en documentos (para la instancia filtrada)
          // - Los que aparecen en inscripciones de exámenes (para la instancia filtrada)
          Set<Long> todosRequisitosIds = new HashSet<>();
          
          // Desde el tipo de trámite
          if (tramite.getTipoTramite() != null && tramite.getTipoTramite().getRequisitosIds() != null) {
              List<Long> ids = parseRequisitosIds(tramite.getTipoTramite().getRequisitosIds());
              todosRequisitosIds.addAll(ids);
              System.out.println("[Seguimiento] RequisitosIds desde tipoTramite: " + ids);
          }
          
          // Desde documentos
          System.out.println("[Seguimiento] Documentos después de filtrar por instancia: " + documentos.size());
          for (DocumentoTramite doc : documentos) {
              if (doc.getRequisito() != null) {
                  todosRequisitosIds.add(doc.getRequisito().getId());
                  System.out.println("[Seguimiento] Documento id=" + doc.getIdDocumento() + 
                                    ", requisitoId=" + doc.getRequisito().getId() + 
                                    ", instanciaId=" + (doc.getInstanciaTramite() != null ? doc.getInstanciaTramite().getIdInstancia() : "null"));
              }
          }
          
          // Desde inscripciones
          System.out.println("[Seguimiento] Inscripciones después de filtrar por instancia: " + inscripciones.size());
          for (InscripcionExamen ins : inscripciones) {
              if (ins.getGrupoPresentacion() != null && ins.getGrupoPresentacion().getRequisitoExamen() != null) {
                  Long reqId = ins.getGrupoPresentacion().getRequisitoExamen().getId();
                  todosRequisitosIds.add(reqId);
                  System.out.println("[Seguimiento] Inscripcion id=" + ins.getIdInscripcion() + 
                                    ", requisitoExamenId=" + reqId + 
                                    ", instanciaId=" + (ins.getInstanciaTramite() != null ? ins.getInstanciaTramite().getIdInstancia() : "null"));
              }
          }
          
          System.out.println("[Seguimiento] Total IDs de requisitos a buscar: " + todosRequisitosIds);

          // Si no se encontraron IDs de requisitos desde el tipo de trámite, documentos o inscripciones,
          // intentar obtener todos los requisitos activos del TUPAC asociado al tipo de trámite
          if (todosRequisitosIds.isEmpty() && tramite.getTipoTramite() != null && tramite.getTipoTramite().getTupac() != null) {
              List<RequisitoTUPAC> requisitosPorTupac = requisitoService.listarPorTupac(tramite.getTipoTramite().getTupac().getIdTupac());
              for (RequisitoTUPAC r : requisitosPorTupac) {
                  if (Boolean.TRUE.equals(r.getActivo())) {
                      todosRequisitosIds.add(r.getId());
                  }
              }
              System.out.println("[Seguimiento] Fallback: using all active requisitos from TUPAC: " + todosRequisitosIds);
          }

          // Obtener los requisitos correspondientes
          List<RequisitoTUPAC> requisitos = requisitoService.listarPorIds(new ArrayList<>(todosRequisitosIds));
          System.out.println("[Seguimiento] Requisitos obtenidos: " + requisitos.size());
          
          // Ordenar por código para presentación consistente
          requisitos.sort(Comparator.comparing(RequisitoTUPAC::getCodigo));

          // Mapa de requisitoId a DocumentoTramite (evitar duplicados)
          Map<Long, DocumentoTramite> docMap = documentos.stream()
                  .filter(d -> d.getRequisito() != null)
                  .collect(Collectors.toMap(
                      d -> d.getRequisito().getId(),
                      d -> d,
                      (existing, replacement) -> existing // keep first if duplicate
                  ));

          // Mapa de requisitoId a InscripcionExamen
          Map<Long, InscripcionExamen> inscripcionesMap = new HashMap<>();
          for (InscripcionExamen ins : inscripciones) {
              if (ins.getGrupoPresentacion() != null && ins.getGrupoPresentacion().getRequisitoExamen() != null) {
                  Long reqId = ins.getGrupoPresentacion().getRequisitoExamen().getId();
                  // Si ya existe una inscripción para este reqId, se mantiene la primera
                  inscripcionesMap.putIfAbsent(reqId, ins);
              }
          }

          // Combinar requisitos con documentos e inscripciones para generar revisiones
          List<Map<String, Object>> revisiones = requisitos.stream().map(req -> {
              DocumentoTramite doc = docMap.get(req.getId());
              InscripcionExamen ins = inscripcionesMap.get(req.getId());
              Map<String, Object> rev = new HashMap<>();
              rev.put("id", doc != null ? doc.getIdDocumento() : 0);
              rev.put("tramiteId", tramite.getIdTramite());
              rev.put("requisitoId", req.getId());
              rev.put("esExamen", req.getEsExamen());
              rev.put("codigo", req.getCodigo());
              rev.put("descripcion", req.getDescripcion());
              rev.put("requisitoNombre", req.getDescripcion());
              rev.put("tipoDocumento", req.getTipoDocumento());
              rev.put("obligatorio", req.getObligatorio());

              if (doc != null) {
                  rev.put("estado", doc.getEstado());
                  rev.put("estadoFormateado", formatearEstado(doc.getEstado()));
                  rev.put("colorEstado", getColorEstado(doc.getEstado()));
                  rev.put("fechaPresentacion", doc.getFechaPresentacion());
                  rev.put("fechaRevision", doc.getFechaRevision());
                  rev.put("observaciones", doc.getObservaciones());
                  rev.put("revisionUsuarioNombre", doc.getUsuarioRevisa() != null ? doc.getUsuarioRevisa().getUsername() : null);
              } else if (ins != null) {
                  rev.put("estado", ins.getEstado());
                  rev.put("estadoFormateado", formatearEstado(ins.getEstado()));
                  rev.put("colorEstado", getColorEstado(ins.getEstado()));
                  rev.put("fechaPresentacion", ins.getFechaInscripcion());
                  rev.put("fechaRevision", null);
                  rev.put("observaciones", ins.getObservaciones());
                  rev.put("revisionUsuarioNombre", null);
                  rev.put("inscripcionId", ins.getIdInscripcion());
                  rev.put("pagado", ins.getPagado());
                  rev.put("resultado", ins.getResultado());
                  rev.put("nota", ins.getNota());
                  rev.put("grupoPresentacion", ins.getGrupoPresentacion());
              } else {
                  rev.put("estado", "PENDIENTE");
                  rev.put("estadoFormateado", "Pendiente");
                  rev.put("colorEstado", "warning");
                  rev.put("fechaPresentacion", null);
                  rev.put("fechaRevision", null);
                  rev.put("observaciones", null);
                  rev.put("revisionUsuarioNombre", null);
              }
              return rev;
          }).collect(Collectors.toList());
          
          System.out.println("[Seguimiento] Total revisiones generadas: " + revisiones.size());

          // Construir respuesta
          Map<String, Object> response = new HashMap<>();
          response.put("tramite", tramite);
          response.put("historial", historial);
          response.put("documentos", documentos);
          response.put("revisiones", revisiones);
          response.put("inscripciones", inscripciones);

          // Agregar información de instancias
          List<Map<String, Object>> instanciasSimplificadas = instancias.stream()
              .map(i -> {
                  Map<String, Object> map = new HashMap<>();
                  map.put("idInstancia", i.getIdInstancia() != null ? i.getIdInstancia().toString() : null);
                  // Limpiar identificador: quitar fecha si está en formato "texto (dd/MM/yyyy)"
                  String ident = i.getIdentificador();
                  if (ident != null && ident.matches(".*\\(\\d{2}/\\d{2}/\\d{4}\\)")) {
                      ident = ident.replaceAll("\\s*\\(\\d{2}/\\d{2}/\\d{4}\\)$", "").trim();
                  }
                  map.put("identificador", ident);
                  map.put("estado", i.getEstado());
                  map.put("fechaCreacion", i.getFechaCreacion());
                  return map;
              })
              .collect(Collectors.toList());
          response.put("instancias", instanciasSimplificadas);
          response.put("instanciaSeleccionadaId", instanciaSeleccionada != null && instanciaSeleccionada.getIdInstancia() != null
              ? instanciaSeleccionada.getIdInstancia().toString()
              : null);

          // Agregar warning si la instancia solicitada no fue encontrada
          if (warningInstancia != null) {
              response.put("warning", warningInstancia);
          }

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

    @Transactional
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

    @Transactional
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
                        Empresa empresa = request.getSolicitanteId() != null ? 
                            empresaRepo.findById(request.getSolicitanteId().intValue()).orElse(null) : null;
                        tramite.setEmpresa(empresa);
                        System.out.println("[TramiteService] Empresa asignada: " + empresa);
                        break;
                    case "gerente":
                    case "vehiculo":
                        Gerente gerente = request.getSolicitanteId() != null ?
                            gerenteRepo.findById(request.getSolicitanteId().intValue()).orElse(null) : null;
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

    @Transactional
    public Tramite actualizar(Long id, Tramite datos) {
        return repo.findById(id).map(tramite -> {
            if (datos.getCodigoRut() != null) tramite.setCodigoRut(datos.getCodigoRut());
            if (datos.getEstado() != null) tramite.setEstado(datos.getEstado());
            if (datos.getTipoSolicitante() != null) tramite.setTipoSolicitante(datos.getTipoSolicitante());
             if (datos.getPrioridad() != null) tramite.setPrioridad(datos.getPrioridad());
             if (datos.getMotivoRechazo() != null) tramite.setMotivoRechazo(datos.getMotivoRechazo());
             if (datos.getObservaciones() != null) tramite.setObservaciones(datos.getObservaciones());
             if (datos.getTipoTramite() != null) tramite.setTipoTramite(datos.getTipoTramite());
             // Expediente eliminado
             if (datos.getEmpresa() != null) tramite.setEmpresa(datos.getEmpresa());
            if (datos.getPersonaNatural() != null) tramite.setPersonaNatural(datos.getPersonaNatural());
            if (datos.getDepartamentoActual() != null) tramite.setDepartamentoActual(datos.getDepartamentoActual());
            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    @Transactional
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
                        Empresa empresa = request.getSolicitanteId() != null ?
                            empresaRepo.findById(request.getSolicitanteId().intValue()).orElse(null) : null;
                        tramite.setEmpresa(empresa);
                        System.out.println("[TramiteService] Empresa actualizada: " + empresa);
                        break;
                    case "gerente":
                    case "vehiculo":
                        Gerente gerente = request.getSolicitanteId() != null ?
                            gerenteRepo.findById(request.getSolicitanteId().intValue()).orElse(null) : null;
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

    @Transactional
    public void eliminar(Long id, String motivo) {
        // 1. Registrar en historial la eliminación
        HistorialTramite historial = new HistorialTramite();
        historial.setTramiteId(id);
        historial.setFechaAccion(LocalDateTime.now());
        historial.setAccion("ELIMINACION");
        historial.setObservacion(motivo);

         // Obtener usuario actual
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();
         if (auth != null && auth.getPrincipal() instanceof UserDetails) {
             String username = ((UserDetails) auth.getPrincipal()).getUsername();
             Users user = usersRepo.findByUsername(username);
             if (user != null) {
                 historial.setUsuarioAccionId(user.getIdUsuarios());
             }
         }
        historialRepo.save(historial);

        // 2. Eliminar instancias asociadas (cascade eliminará documentos_tramite)
        List<InstanciaTramite> instancias = instanciaRepository.findByTramiteIdWithDocumentos(id);
        instanciaRepository.deleteAll(instancias);

        // 3. Eliminar trámite
        repo.deleteById(id);
    }

    @Transactional
    public Tramite cambiarEstado(Long id, String nuevoEstado, String motivo) {
        return repo.findById(id).map(tramite -> {
            Users usuarioActual = obtenerUsuarioActual();
            validarPermisoEdicion(tramite, usuarioActual);

            String estadoActual = tramite.getEstado();
            String estadoUpper = nuevoEstado.toUpperCase();

            // Validación: Solo se puede cambiar a FINALIZADO desde APROBADO, o desde OBSERVADO cuando ya existe expediente/instancia
            if (estadoUpper.equals("FINALIZADO")
                    && !"APROBADO".equals(estadoActual)
                    && (!"OBSERVADO".equals(estadoActual) || instanciaRepository.countByTramite_IdTramite(id) == 0)) {
                throw new IllegalStateException("Solo se pueden finalizar trámites en estado APROBADO u OBSERVADO con expediente. Estado actual: " + estadoActual);
            }

            // Validación: No se puede cambiar desde estados finales (FINALIZADO, CANCELADO, RECHAZADO)
            List<String> estadosFinales = java.util.Arrays.asList("FINALIZADO", "CANCELADO", "RECHAZADO");
            if (estadosFinales.contains(estadoActual)) {
                throw new IllegalStateException("No se puede cambiar el estado de un trámite " + estadoActual);
            }

            tramite.setEstado(estadoUpper);
            if (motivo != null && !motivo.trim().isEmpty()) {
                // Para estados finales aprobatorios u observacionales, guardar en observaciones
                if (estadoUpper.equals("APROBADO") || estadoUpper.equals("OBSERVADO") || estadoUpper.equals("FINALIZADO")) {
                    tramite.setObservaciones(motivo);
                }
                // Para estados de rechazo o cancelación, guardar en motivoRechazo
                else if (estadoUpper.equals("RECHAZADO") || estadoUpper.equals("CANCELADO") || estadoUpper.equals("DERIVADO")) {
                    tramite.setMotivoRechazo(motivo);
                }
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

    @Transactional
    public Tramite derivar(Long id, Long departamentoId, String motivo, Long usuarioResponsableId) {
        System.out.println("[TramiteService] derivar - id: " + id + ", departamentoId: " + departamentoId + ", motivo: " + motivo + ", usuarioResponsableId: " + usuarioResponsableId);
        
        Tramite tramite = repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado con id: " + id));
        
        // Validar y asignar departamento si se proporciona
        if (departamentoId != null) {
            Departamento departamento = departamentoRepo.findById(departamentoId)
                .orElseThrow(() -> new IllegalArgumentException("Departamento no encontrado con id: " + departamentoId));
            tramite.setDepartamentoActual(departamento);
        }
        
        // Asignar nuevo usuario responsable si se proporciona
        if (usuarioResponsableId != null) {
            Users usuarioResponsable = usersRepo.findById(usuarioResponsableId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario responsable no encontrado con id: " + usuarioResponsableId));
            tramite.setUsuarioResponsableId(usuarioResponsable);
        }
        
        // Cambiar estado a EN_REVISION para que el destinatario pueda revisar inmediatamente
        tramite.setEstado("EN_REVISION");
        if (motivo != null && !motivo.trim().isEmpty()) {
            tramite.setObservaciones(motivo);
        }
        tramite.setFechaActualizacion(LocalDateTime.now());
        
        return repo.save(tramite);
        // return repo.save(tramite);
    }

    @Transactional
    public Tramite aprobar(Long id, String observaciones) {
        Tramite tramite = repo.findById(id).orElse(null);
        if (tramite == null) {
            return null;
        }

        Users currentUser = obtenerUsuarioActual();
        if (currentUser == null) {
            throw new SecurityException("Usuario no autenticado");
        }
        // Validar permiso de edición
        validarPermisoEdicion(tramite, currentUser);

        // Obtener todos los documentos del trámite (con datos de requisito)
        List<DocumentoTramite> documentos = documentoRepo.findByTramiteIdWithRequisito(id);

        // Separar requisitos (no exámenes)
        List<DocumentoTramite> requisitos = documentos.stream()
            .filter(doc -> doc.getRequisito() != null && !Boolean.TRUE.equals(doc.getRequisito().getEsExamen()))
            .toList();

        // Validar que no haya requisitos reprobados
        boolean hayReprobados = requisitos.stream()
            .anyMatch(doc -> "REPROBADO".equals(doc.getEstado()));

        if (hayReprobados) {
            throw new IllegalStateException("No se puede aprobar el trámite porque hay documentos reprobados");
        }

        // Aprobar todos los requisitos que no estén ya aprobados
        for (DocumentoTramite doc : requisitos) {
            if (!"APROBADO".equals(doc.getEstado())) {
                doc.setEstado("APROBADO");
                doc.setFechaRevision(LocalDateTime.now());
                doc.setUsuarioRevisa(currentUser);
                if (observaciones != null) {
                    doc.setObservaciones(observaciones);
                }
            }
        }
        documentoRepo.saveAll(requisitos);

        // Actualizar estado del trámite
        tramite.setEstado("APROBADO");
        if (observaciones != null) {
            tramite.setObservaciones(observaciones);
        }
        tramite.setFechaActualizacion(LocalDateTime.now());
        return repo.save(tramite);
    }

    private Users obtenerUsuarioActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                String username = ((UserDetails) principal).getUsername();
                return usersRepo.findByUsername(username);
            } else if (principal instanceof Users) {
                return (Users) principal;
            }
        }
        return null;
    }

    private void validarPermisoEdicion(Tramite tramite, Users usuarioActual) {
        if (usuarioActual == null) {
            throw new SecurityException("Usuario no autenticado");
        }
        // ADMIN y SUPER_ADMIN pueden editar cualquier trámite
        if (usuarioActual.getRole() != null) {
            String roleName = usuarioActual.getRole().getName();
            if ("ADMIN".equals(roleName) || "SUPER_ADMIN".equals(roleName)) {
                return;
            }
        }
        // Usuarios normales: solo si son responsables
        if (tramite.getUsuarioResponsableId() == null ||
            !tramite.getUsuarioResponsableId().getIdUsuarios().equals(usuarioActual.getIdUsuarios())) {
            throw new SecurityException("No tiene permiso para modificar este trámite");
        }
    }

    @Transactional
    public Tramite rechazar(Long id, String motivo) {
        return cambiarEstado(id, "RECHAZADO", motivo);
    }

    @Transactional
    public Tramite observar(Long id, String observaciones) {
        return cambiarEstado(id, "OBSERVADO", observaciones);
    }

    @Transactional
    public Tramite finalizar(Long id, String observaciones) {
        // Solo se puede finalizar desde estado APROBADO
        Tramite tramite = repo.findById(id).orElse(null);
        if (tramite == null) {
            return null;
        }
        
        String estadoActual = tramite.getEstado();
        if (!"APROBADO".equals(estadoActual)
                && (!"OBSERVADO".equals(estadoActual) || instanciaRepository.countByTramite_IdTramite(id) == 0)) {
            throw new IllegalStateException("Solo se pueden finalizar trámites en estado APROBADO u OBSERVADO con expediente. Estado actual: " + estadoActual);
        }
        
        // Cambiar estado a FINALIZADO
        tramite.setEstado("FINALIZADO");
        if (observaciones != null) {
            tramite.setObservaciones(observaciones);
        }
        tramite.setFechaFinalizacion(LocalDateTime.now());
        tramite.setFechaActualizacion(LocalDateTime.now());
        
        return repo.save(tramite);
    }

    @Transactional
    public Tramite cambiarPrioridad(Long id, String nuevaPrioridad) {
        return repo.findById(id).map(tramite -> {
            tramite.setPrioridad(nuevaPrioridad);
            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    @Transactional
    public Tramite reingresar(Long id, String justificacion) {
        return repo.findById(id).map(tramite -> {
            tramite.setEstado("REINGRESADO");
            tramite.setObservaciones(justificacion);
            tramite.setFechaActualizacion(java.time.LocalDateTime.now());
            return repo.save(tramite);
        }).orElse(null);
    }

    @Transactional
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

    public List<TramiteListadoDTO> listarPorDepartamentoYUsuario(Long departamentoId, Long usuarioId) {
        return repo.findByDepartamentoIdAndUsuarioResponsableId(departamentoId, usuarioId);
    }

    public List<TramiteListadoDTO> listarPorDepartamento(Long departamentoId) {
        return repo.findByDepartamentoIdAndUsuarioResponsableId(departamentoId, null);
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

    public List<TramiteListadoDTO> listarConInstancias() {
        return repo.findAllEnriquecidos().stream()
                .filter(dto -> dto.getConteoInstancias() != null && dto.getConteoInstancias() > 0)
                .toList();
    }

    private List<Long> parseRequisitosIds(String requisitosIdsCsv) {
        List<Long> ids = new ArrayList<>();
        if (requisitosIdsCsv == null || requisitosIdsCsv.trim().isEmpty()) {
            return ids;
        }
        String[] parts = requisitosIdsCsv.split(",");
        for (String part : parts) {
            try {
                ids.add(Long.parseLong(part.trim()));
            } catch (NumberFormatException e) {
                // ignorar IDs inválidos
            }
        }
        return ids;
    }
}
