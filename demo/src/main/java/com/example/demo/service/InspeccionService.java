package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

 import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
 import com.example.demo.dto.FichaInspeccionResponseDTO;
 import com.example.demo.dto.InspeccionCabeceraCreateDTO;
 import com.example.demo.dto.InspeccionConInstanciasCreateRequest;
 import com.example.demo.dto.InspeccionCreateRequestDTO;
 import com.example.demo.dto.InspeccionIniciarRequest;
 import com.example.demo.dto.InspeccionInstanciaInspeccionarRequest;
 import com.example.demo.dto.InspeccionInstanciaResponse;
 import com.example.demo.dto.InspeccionRezagadaRequest;
 import com.example.demo.dto.InspeccionResponse;
 import com.example.demo.dto.InspeccionTerminarRequest;
 import com.example.demo.dto.InspeccionUpdateRequestDTO;
 import com.example.demo.dto.ParametroInspeccionDTO;
 import com.example.demo.dto.ParametroInspeccionResponseDTO;
 import com.example.demo.dto.SiguienteInstanciaPendienteResponse;
 import com.example.demo.dto.BloqueInspeccionDTO;
 import com.example.demo.dto.CrearInspeccionEnBloqueRequest;
import com.example.demo.model.EstadoDocumental;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.Inspeccion;
import com.example.demo.model.InspeccionInstancia;
import com.example.demo.model.ParametrosInspeccion;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.model.Vehiculo;
import com.example.demo.model.VehiculoApto;
import com.example.demo.model.InstanciaTramite;
import com.example.demo.model.Empresa;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.InspeccionInstanciaRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.ParametrosInspeccionRepository;
import com.example.demo.repository.RequisitoTUPACRepository;
import com.example.demo.repository.TramiteRepository;
import com.example.demo.repository.UsersRepository;
import com.example.demo.repository.VehiculoAptoRepository;
import com.example.demo.repository.VehiculoRepository;
import com.example.demo.repository.InstanciaTramiteRepository;

import jakarta.transaction.Transactional;

@Service
public class InspeccionService {

    private final InspeccionRepository inspeccionRepository;
    private final TramiteRepository tramiteRepository;
    private final VehiculoRepository vehiculoRepository;
    private final FichaInspeccionRepository fichaInspeccionRepository;
    private final ParametrosInspeccionRepository parametrosInspeccionRepository;
    private final RequisitoTUPACRepository requisitoTUPACRepository;
    private final UsersRepository usersRepository;
    private final VehiculoAptoRepository vehiculoAptoRepository;
    private final InstanciaTramiteRepository instanciaTramiteRepository;
    private final InspeccionInstanciaRepository inspeccionInstanciaRepository;

    public InspeccionService(InspeccionRepository inspeccionRepository,
                             TramiteRepository tramiteRepository,
                             VehiculoRepository vehiculoRepository,
                             FichaInspeccionRepository fichaInspeccionRepository,
                             ParametrosInspeccionRepository parametrosInspeccionRepository,
                             RequisitoTUPACRepository requisitoTUPACRepository,
                             UsersRepository usersRepository,
                             VehiculoAptoRepository vehiculoAptoRepository,
                             InstanciaTramiteRepository instanciaTramiteRepository,
                             InspeccionInstanciaRepository inspeccionInstanciaRepository) {
        this.inspeccionRepository = inspeccionRepository;
        this.tramiteRepository = tramiteRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.fichaInspeccionRepository = fichaInspeccionRepository;
        this.parametrosInspeccionRepository = parametrosInspeccionRepository;
        this.requisitoTUPACRepository = requisitoTUPACRepository;
        this.usersRepository = usersRepository;
        this.vehiculoAptoRepository = vehiculoAptoRepository;
        this.instanciaTramiteRepository = instanciaTramiteRepository;
        this.inspeccionInstanciaRepository = inspeccionInstanciaRepository;
    }

    public List<Inspeccion> listarTodas() {
        return inspeccionRepository.findAllWithDetails();
    }

    public List<BloqueInspeccionDTO> listarPorBloques() {
        List<Inspeccion> inspecciones = listarTodas();

        // Recolectar IDs únicos de trámites
        java.util.Set<Long> tramiteIds = inspecciones.stream()
            .filter(i -> i.getTramite() != null)
            .map(i -> i.getTramite().getIdTramite())
            .filter(java.util.Objects::nonNull)
            .collect(java.util.stream.Collectors.toSet());

        // Obtener conteo de instancias por trámite
        java.util.Map<Long, Long> instanciasCountMap = new java.util.HashMap<>();
        for (Long tramiteId : tramiteIds) {
            long count = instanciaTramiteRepository.countByTramite_IdTramite(tramiteId);
            instanciasCountMap.put(tramiteId, count);
        }

        // Agrupar por trámite
        java.util.Map<Long, BloqueInspeccionDTO> bloquesMap = new java.util.LinkedHashMap<>();

        for (Inspeccion inspeccion : inspecciones) {
            Long tramiteId = inspeccion.getTramite() != null ? inspeccion.getTramite().getIdTramite() : null;
            if (tramiteId == null) continue;

            BloqueInspeccionDTO bloque = bloquesMap.get(tramiteId);
            if (bloque == null) {
                String empresaNombre = inspeccion.getTramite().getEmpresa() != null
                        ? inspeccion.getTramite().getEmpresa().getNombre()
                        : "Sin empresa";

                Long totalInstancias = instanciasCountMap.getOrDefault(tramiteId, 0L);

                bloque = new BloqueInspeccionDTO();
                bloque.setIdTramite(tramiteId);
                bloque.setEmpresaNombre(empresaNombre);
                bloque.setEstado(inspeccion.getEstado());
                bloque.setTotalInstancias(totalInstancias);
                bloque.setCount(0L);
                bloque.setInspecciones(new java.util.ArrayList<>());

                bloquesMap.put(tramiteId, bloque);
            }
            bloque.getInspecciones().add(convertirAResponse(inspeccion));
            bloque.setCount((long) bloque.getInspecciones().size());
        }

        return new java.util.ArrayList<>(bloquesMap.values());
    }

    public Inspeccion guardar(Inspeccion inspeccion) {
        return inspeccionRepository.save(inspeccion);
    }

    @Transactional
    public Inspeccion crearInspeccionCabecera(InspeccionCabeceraCreateDTO dto) {
        // Obtener instancia de trámite y su empresa asociada
        InstanciaTramite instancia = instanciaTramiteRepository.findById(dto.getInstanciaTramiteId())
                .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada"));
        Tramite tramite = instancia.getTramite();
        if (tramite == null) {
            throw new IllegalStateException("La instancia no tiene un trámite asociado");
        }
        Empresa empresa = tramite.getEmpresa();
        if (empresa == null) {
            throw new IllegalStateException("El trámite no tiene empresa asociada");
        }

        // Parsear fecha (formato esperado: yyyy-MM-dd)
        LocalDate fechaProgramada;
        try {
            fechaProgramada = LocalDate.parse(dto.getFechaProgramada());
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato de fecha inválido. Use yyyy-MM-dd");
        }

        // Crear inspección
        Inspeccion inspeccion = new Inspeccion();
        inspeccion.setCodigo(generarCodigoInspeccion());
        inspeccion.setFechaProgramada(fechaProgramada);
        inspeccion.setHora(dto.getHoraProgramada());
        inspeccion.setLugar(dto.getLugar());
        inspeccion.setObservacionesGenerales(dto.getObservaciones());
        inspeccion.setEstado("PROGRAMADA");
        inspeccion.setInstanciaTramite(instancia);
        inspeccion.setTramite(tramite);
        inspeccion.setUsuarioInspector(null);
        return inspeccionRepository.save(inspeccion);
    }

    public Inspeccion buscarPorId(Long id) {
        return inspeccionRepository.findByIdWithInstancias(id).orElse(null);
    }

    public void eliminar(Long id) {
        inspeccionRepository.deleteById(id);
    }

    @Transactional
    public Inspeccion crearDesdeTramiteAprobado(InspeccionCreateRequestDTO request) {
        Tramite tramite = tramiteRepository.findById(request.getTramiteId())
                .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado"));

        // Validar que trámite esté completamente aprobado (todos los vehículos APTO)
        if (!"APROBADO".equals(tramite.getEstado())) {
            throw new IllegalStateException("El trámite debe estar completamente aprobado para iniciar una inspección");
        }

        // Obtener la instancia más reciente del trámite (la que se creó en revisión)
        InstanciaTramite instancia = instanciaTramiteRepository
                .findTopByTramite_IdTramiteOrderByFechaCreacionDesc(tramite.getIdTramite());
        if (instancia == null) {
            throw new IllegalStateException("No hay instancia de trámite asociada. Cree una instancia en la revisión primero.");
        }

        Empresa empresa = tramite.getEmpresa();
        if (empresa == null) {
            throw new IllegalStateException("El trámite no tiene empresa asociada");
        }

        // NUEVO: Validar que cada vehículo seleccionado esté APTO y vincular VehiculoApto
        for (Long vehiculoId : request.getVehiculosSeleccionados()) {
            VehiculoApto apto = vehiculoAptoRepository
                    .findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(request.getTramiteId(), vehiculoId)
                    .orElseThrow(() -> new IllegalStateException(
                            "Vehículo " + vehiculoId + " no tiene revisión documental para este trámite"));

            if (apto.getEstadoDocumental() != EstadoDocumental.APTO) {
                throw new IllegalStateException(
                        "Vehículo placa " + apto.getVehiculo().getPlaca() +
                        " NO está APTO para inspección. Estado actual: " + apto.getEstadoDocumental() +
                        (apto.getMotivoRechazo() != null ? ". Motivo: " + apto.getMotivoRechazo() : ""));
            }
        }

        // Obtener usuario inspector si se proporciona
        Users inspector = null;
        if (request.getUsuarioInspectorId() != null) {
            inspector = usersRepository.findById(request.getUsuarioInspectorId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario inspector no encontrado"));
        }

        Inspeccion inspeccion = new Inspeccion();
        inspeccion.setCodigo(generarCodigoInspeccion());
        inspeccion.setFechaProgramada(request.getFechaProgramada());
        inspeccion.setHora(request.getHora());
        inspeccion.setLugar(request.getLugar());
        inspeccion.setEstado("PROGRAMADA");
        inspeccion.setInstanciaTramite(instancia);
        inspeccion.setTramite(tramite);
        inspeccion.setUsuarioInspector(inspector);
        inspeccion = inspeccionRepository.save(inspeccion);

        for (Long vehiculoId : request.getVehiculosSeleccionados()) {
            Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                    .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado: " + vehiculoId));

            if (vehiculo.getEmpresa() != null && tramite.getEmpresa() != null &&
                !vehiculo.getEmpresa().getIdEmpresa().equals(tramite.getEmpresa().getIdEmpresa())) {
                throw new IllegalArgumentException("Vehículo " + vehiculo.getPlaca() + " no pertenece a la empresa del trámite");
            }

            // Obtener VehiculoApto para vincular
            VehiculoApto apto = vehiculoAptoRepository
                    .findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(request.getTramiteId(), vehiculoId)
                    .orElseThrow(() -> new IllegalStateException(
                            "Vehículo " + vehiculoId + " no tiene revisión documental"));

            FichaInspeccion ficha = new FichaInspeccion();
            ficha.setInspeccion(inspeccion.getIdInspeccion());
            ficha.setSolicitud(null);
            ficha.setUsuarioInspector(request.getUsuarioInspectorId());
            ficha.setVehiculo(vehiculoId);
            ficha.setEstado(true);
            ficha.setResultado("PENDIENTE");
            ficha.setFechaCreacion(LocalDateTime.now());
            ficha.setFechaActualizacion(LocalDateTime.now());
            ficha.setVehiculoApto(apto); // Vincular con VehiculoApto
            ficha = fichaInspeccionRepository.save(ficha);

            // Generar parámetros de inspección basados en tipo de trámite
            if (tramite.getTipoTramite() != null && tramite.getTipoTramite().getRequisitosIds() != null) {
                List<Long> requisitosIds = parseRequisitosIds(tramite.getTipoTramite().getRequisitosIds());
                for (Long reqId : requisitosIds) {
                    RequisitoTUPAC req = requisitoTUPACRepository.findById(reqId).orElse(null);
                    if (req != null && Boolean.TRUE.equals(req.getActivo())) {
                        ParametrosInspeccion param = new ParametrosInspeccion();
                        param.setParametro(req.getDescripcion());
                        param.setObservacion("");
                        param.setFichaInspeccion(ficha);
                        parametrosInspeccionRepository.save(param);
                    }
                }
            }
        }

        return inspeccion;
    }

    @Transactional
    public FichaInspeccionResponseDTO crearFichaParaVehiculo(Long inspeccionId, FichaInspeccionCreateRequestDTO request) {
        Inspeccion inspeccion = inspeccionRepository.findById(inspeccionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));

        Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado"));

        // Intentar vincular VehiculoApto (si existe)
        VehiculoApto apto = null;
        if (inspeccion.getTramite() != null) {
            apto = vehiculoAptoRepository
                    .findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(inspeccion.getTramite().getIdTramite(), request.getVehiculoId())
                    .orElse(null);
        }

        FichaInspeccion ficha = new FichaInspeccion();
        ficha.setInspeccion(inspeccionId);
        ficha.setSolicitud(null);
        ficha.setUsuarioInspector(request.getUsuarioInspectorId());
        ficha.setVehiculo(request.getVehiculoId());
        ficha.setEstado(request.getEstado() != null ? request.getEstado() : true);
        ficha.setResultado(request.getResultado() != null ? request.getResultado() : "PENDIENTE");
        ficha.setObservaciones(request.getObservaciones());
        ficha.setFechaCreacion(LocalDateTime.now());
        ficha.setFechaActualizacion(LocalDateTime.now());
        ficha.setVehiculoApto(apto); // Vincular si existe
        ficha = fichaInspeccionRepository.save(ficha);

        Tramite tramite = inspeccion.getTramite();
        if (tramite != null && tramite.getTipoTramite() != null && tramite.getTipoTramite().getRequisitosIds() != null) {
            List<Long> requisitosIds = parseRequisitosIds(tramite.getTipoTramite().getRequisitosIds());
            for (Long reqId : requisitosIds) {
                RequisitoTUPAC req = requisitoTUPACRepository.findById(reqId).orElse(null);
                if (req != null && Boolean.TRUE.equals(req.getActivo())) {
                    ParametrosInspeccion param = new ParametrosInspeccion();
                    param.setParametro(req.getDescripcion());
                    param.setObservacion("");
                    param.setFichaInspeccion(ficha);
                    parametrosInspeccionRepository.save(param);
                }
            }
        }

        return convertirAFichaResponseDTO(ficha);
    }

    @Transactional
    public ParametroInspeccionResponseDTO agregarParametro(Long fichaId, ParametroInspeccionDTO dto) {
        FichaInspeccion ficha = fichaInspeccionRepository.findById(fichaId)
                .orElseThrow(() -> new IllegalArgumentException("Ficha no encontrada"));

        ParametrosInspeccion param = new ParametrosInspeccion();
        param.setParametro(dto.getParametro());
        param.setObservacion(dto.getObservacion() != null ? dto.getObservacion() : "");
        param.setFichaInspeccion(ficha);
        ParametrosInspeccion saved = parametrosInspeccionRepository.save(param);
        return convertirAParametroResponseDTO(saved);
    }

    @Transactional
    public ParametroInspeccionResponseDTO actualizarParametro(Integer paramId, ParametroInspeccionDTO dto) {
        ParametrosInspeccion param = parametrosInspeccionRepository.findById(paramId)
                .orElseThrow(() -> new IllegalArgumentException("Parámetro no encontrado"));

        if (dto.getParametro() != null) param.setParametro(dto.getParametro());
        if (dto.getObservacion() != null) param.setObservacion(dto.getObservacion());
        ParametrosInspeccion saved = parametrosInspeccionRepository.save(param);
        return convertirAParametroResponseDTO(saved);
    }

    @Transactional
    public void eliminarParametro(Integer paramId) {
        parametrosInspeccionRepository.deleteById(paramId);
    }

    public List<Inspeccion> listarPorTramite(Long tramiteId) {
        return inspeccionRepository.findByTramiteId(tramiteId);
    }

    @Transactional
    public Inspeccion crearInspeccionRezagada(InspeccionRezagadaRequest req) {
        // Find instancia de trámite and its empresa
        InstanciaTramite instancia = instanciaTramiteRepository.findById(req.getInstanciaTramiteId())
                .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada"));
        Tramite tramite = instancia.getTramite();
        if (tramite == null) {
            throw new IllegalStateException("La instancia no tiene trámite asociado");
        }
        Empresa empresa = tramite.getEmpresa();
        if (empresa == null) {
            throw new IllegalStateException("El trámite no tiene empresa asociada");
        }

        // Parse fecha
        LocalDate fechaProgramada;
        try {
            fechaProgramada = LocalDate.parse(req.getFechaProgramada());
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato de fecha inválido. Use yyyy-MM-dd");
        }

        // Create inspeccion
        Inspeccion inspeccion = new Inspeccion();
        inspeccion.setCodigo(generarCodigoInspeccion());
        inspeccion.setFechaProgramada(fechaProgramada);
        inspeccion.setHora(req.getHora());
        inspeccion.setLugar(req.getLugar());
        inspeccion.setObservacionesGenerales(req.getObservaciones());
        inspeccion.setEstado("PROGRAMADA");
        inspeccion.setInstanciaTramite(instancia);
        inspeccion.setTramite(tramite);
        inspeccion.setUsuarioInspector(null);
        inspeccion = inspeccionRepository.save(inspeccion);

        // Create fichas for each vehicle
        List<FichaInspeccion> fichasCreadas = new ArrayList<>();
        for (Long vehiculoId : req.getVehiculosIds()) {
            Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                    .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado: " + vehiculoId));

            // Optional validation: vehicle belongs to same empresa
            if (vehiculo.getEmpresa() != null && empresa != null &&
                !vehiculo.getEmpresa().getIdEmpresa().equals(empresa.getIdEmpresa())) {
                throw new IllegalArgumentException("Vehículo " + vehiculo.getPlaca() + " no pertenece a la empresa del expediente");
            }

            // Find latest VehiculoApto for this vehicle (top by numeroInstancia)
            VehiculoApto apto = null;
            List<VehiculoApto> aptos = vehiculoAptoRepository.findByVehiculoIdOrderByInstanciaDesc(vehiculoId);
            if (!aptos.isEmpty()) {
                apto = aptos.get(0);
            }

            FichaInspeccion ficha = new FichaInspeccion();
            ficha.setInspeccion(inspeccion.getIdInspeccion());
            ficha.setSolicitud(null);
            ficha.setUsuarioInspector(null);
            ficha.setVehiculo(vehiculoId);
            ficha.setEstado(true);
            ficha.setResultado("PENDIENTE");
            ficha.setFechaCreacion(LocalDateTime.now());
            ficha.setFechaActualizacion(LocalDateTime.now());
            ficha.setVehiculoApto(apto);
            ficha = fichaInspeccionRepository.save(ficha);
            fichasCreadas.add(ficha);
        }

        inspeccion.setFichasInspeccion(fichasCreadas);
        return inspeccion;
    }

    // NUEVOS MÉTODOS PARA GESTIÓN DE INSPECCION-INSTANCIA

    @Transactional
     public InspeccionResponse crearConInstancias(InspeccionConInstanciasCreateRequest request) {
         if (request.getInstanciasTramiteIds() == null || request.getInstanciasTramiteIds().isEmpty()) {
             throw new IllegalArgumentException("Debe proporcionar al menos una instancia de trámite");
         }
         // Validar campo hora obligatorio
         if (request.getHora() == null || request.getHora().trim().isEmpty()) {
             throw new IllegalArgumentException("La hora es obligatoria para programar la inspección");
         }

         // Obtener primera instancia para derivar el trámite
         InstanciaTramite primeraInstancia = instanciaTramiteRepository.findById(request.getInstanciasTramiteIds().get(0))
                 .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + request.getInstanciasTramiteIds().get(0)));
         Tramite tramite = primeraInstancia.getTramite();
         if (tramite == null) {
             throw new IllegalStateException("La primera instancia no tiene trámite asociado");
         }

         Inspeccion inspeccion = new Inspeccion();
         inspeccion.setCodigo(generarCodigoInspeccion());
         inspeccion.setFechaProgramada(request.getFechaProgramada());
         inspeccion.setHora(request.getHora());
         inspeccion.setLugar(request.getLugar());
         inspeccion.setObservacionesGenerales(request.getObservacionesGenerales());
         inspeccion.setEstado("PROGRAMADA");
         inspeccion.setCodigoGrupo(request.getCodigoGrupo());
         inspeccion.setTramite(tramite);
         inspeccion.setFechaCreacion(LocalDateTime.now());
         inspeccion.setFechaActualizacion(LocalDateTime.now());

          // Asignar inspector si se proporciona
          if (request.getUsuarioInspectorId() != null) {
              Users inspector = usersRepository.findById(request.getUsuarioInspectorId())
                      .orElseThrow(() -> new IllegalArgumentException("Usuario inspector no encontrado"));
              inspeccion.setUsuarioInspector(inspector);
          }



          for (Long instanciaId : request.getInstanciasTramiteIds()) {
             InstanciaTramite instancia = instanciaTramiteRepository.findById(instanciaId)
                     .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + instanciaId));
             InspeccionInstancia ii = new InspeccionInstancia();
             ii.setInstanciaTramite(instancia);
             ii.setEstadoInstancia("PENDIENTE");
             inspeccion.addInstancia(ii);
         }

         inspeccion = inspeccionRepository.save(inspeccion);

           // Crear ficha de inspección para cada instancia (una por vehículo)
           // Cargar todas las instancias para obtener identificador (placa)
           Map<Long, InstanciaTramite> instanciasMap = instanciaTramiteRepository.findAllById(request.getInstanciasTramiteIds()).stream()
                   .collect(Collectors.toMap(InstanciaTramite::getIdInstancia, inst -> inst));
           for (Long instanciaId : request.getInstanciasTramiteIds()) {
               InstanciaTramite instancia = instanciasMap.get(instanciaId);
                if (instancia == null) {
                    throw new IllegalStateException("Instancia no encontrada: " + instanciaId);
                }
                String placa = instancia.getIdentificador();
                if (placa == null || placa.trim().isEmpty()) {
                    throw new IllegalStateException("Instancia " + instanciaId + " no tiene identificador (placa) asignado");
                }
                Vehiculo vehiculo = obtenerOcrearVehiculo(placa);
                Long vehiculoId = vehiculo.getIdVehiculo();

               FichaInspeccion ficha = new FichaInspeccion();
               ficha.setInspeccion(inspeccion.getIdInspeccion());
               ficha.setInstanciaTramiteId(instanciaId);
               ficha.setEstado(true);
               ficha.setResultado("PENDIENTE");
               ficha.setFechaCreacion(LocalDateTime.now());
               ficha.setFechaActualizacion(LocalDateTime.now());
               ficha.setVehiculo(vehiculoId);
               // Asociar solicitud del trámite si está disponible
               if (tramite.getSolicitud() != null) {
                   ficha.setSolicitud(tramite.getSolicitud().getIdSolicitud());
               }
               fichaInspeccionRepository.save(ficha);
           }

         return convertirAResponse(inspeccion);
     }

     @Transactional
     public InspeccionResponse agregarInstancias(Long inspeccionId, List<Long> instanciaIds) {
         if (instanciaIds == null || instanciaIds.isEmpty()) {
             throw new IllegalArgumentException("Debe proporcionar al menos una instancia de trámite");
         }
          Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                  .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));

           Tramite tramite = inspeccion.getTramite();
           if (tramite == null) {
               throw new IllegalStateException("La inspección no tiene trámite asociado");
           }

          for (Long instanciaId : instanciaIds) {
             boolean exists = inspeccion.getInstancias().stream()
                     .anyMatch(ii -> ii.getInstanciaTramite().getIdInstancia().equals(instanciaId));
             if (exists) {
                 continue;
             }
             InstanciaTramite instancia = instanciaTramiteRepository.findById(instanciaId)
                     .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + instanciaId));
             InspeccionInstancia ii = new InspeccionInstancia();
             ii.setInstanciaTramite(instancia);
             ii.setEstadoInstancia("PENDIENTE");
             inspeccion.addInstancia(ii);

                // Determinar vehículo a partir del identificador de la instancia
                String placa = instancia.getIdentificador();
                if (placa == null || placa.trim().isEmpty()) {
                    throw new IllegalStateException("Instancia " + instanciaId + " no tiene identificador (placa) asignado");
                }
                Vehiculo vehiculo = obtenerOcrearVehiculo(placa);
                Long vehiculoId = vehiculo.getIdVehiculo();

               // Crear ficha para la nueva instancia
               FichaInspeccion ficha = new FichaInspeccion();
               ficha.setInspeccion(inspeccion.getIdInspeccion());
               ficha.setInstanciaTramiteId(instanciaId);
               ficha.setEstado(true);
               ficha.setResultado("PENDIENTE");
               ficha.setFechaCreacion(LocalDateTime.now());
               ficha.setFechaActualizacion(LocalDateTime.now());
               ficha.setVehiculo(vehiculoId);
               // Asociar solicitud del trámite si está disponible
               if (tramite != null && tramite.getSolicitud() != null) {
                   ficha.setSolicitud(tramite.getSolicitud().getIdSolicitud());
               }
               fichaInspeccionRepository.save(ficha);
         }
         // Actualizar fecha de actualización de la inspección
        inspeccion.setFechaActualizacion(LocalDateTime.now());

        inspeccion = inspeccionRepository.save(inspeccion);

        // Procesar vehículos aprobados: crear/actualizar estado y asignar empresa
        List<FichaInspeccion> fichas = fichaInspeccionRepository.findByInspeccion(inspeccion.getIdInspeccion());
        Empresa empresa = null;
        if (inspeccion.getTramite() != null) {
            empresa = inspeccion.getTramite().getEmpresa();
        }
        for (FichaInspeccion ficha : fichas) {
            if ("APROBADO".equals(ficha.getResultado())) {
                Vehiculo vehiculo = ficha.getVehiculoEntity();
                if (vehiculo != null) {
                    vehiculo.setEstado("HABILITADO");
                    if (empresa != null && vehiculo.getEmpresa() == null) {
                        vehiculo.setEmpresa(empresa);
                    }
                    vehiculo.setFechaActualizacion(LocalDateTime.now());
                    vehiculoRepository.save(vehiculo);
                }
            }
        }

        return convertirAResponse(inspeccion);
    }
     @Transactional
     public void removerInstancia(Long inspeccionId, Long instanciaId) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        inspeccion.getInstancias().removeIf(ii -> {
            InstanciaTramite it = ii.getInstanciaTramite();
            return it != null && it.getIdInstancia().equals(instanciaId);
        });
        inspeccionRepository.save(inspeccion);
    }

    @Transactional
    public InspeccionResponse obtenerConInstancias(Long inspeccionId) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        return convertirAResponse(inspeccion);
    }

    private InspeccionResponse convertirAResponse(Inspeccion inspeccion) {
        InspeccionResponse response = new InspeccionResponse();
        response.setIdInspeccion(inspeccion.getIdInspeccion());
        response.setCodigo(inspeccion.getCodigo());
        response.setFechaProgramada(inspeccion.getFechaProgramada());
        response.setHora(inspeccion.getHora());
        response.setLugar(inspeccion.getLugar());
        response.setEstado(inspeccion.getEstado());
        response.setResultadoGeneral(inspeccion.getResultadoGeneral());
        response.setFechaEjecucion(inspeccion.getFechaEjecucion());
        response.setFechaCreacion(inspeccion.getFechaCreacion());
        response.setFechaActualizacion(inspeccion.getFechaActualizacion());
        response.setObservacionesGenerales(inspeccion.getObservacionesGenerales());
        response.setCodigoGrupo(inspeccion.getCodigoGrupo());

        // Empresa (puede venir directo o a través del trámite)
        Empresa emp = null;
        if (inspeccion.getEmpresa() != null) {
            emp = inspeccion.getEmpresa();
        } else if (inspeccion.getTramite() != null) {
            emp = inspeccion.getTramite().getEmpresa();
        }
        if (emp != null) {
            response.setEmpresaId(emp.getIdEmpresa());
            response.setEmpresaNombre(emp.getNombre());
            response.setEmpresaRuc(emp.getRuc());
            response.setEmpresaDireccion(emp.getDireccionLegal());
            response.setEmpresaTelefono(emp.getContactoTelefono());
            if (emp.getGerente() != null) {
                response.setGerenteNombre(emp.getGerente().getNombre());
            }
        }

        // Inspector
        if (inspeccion.getUsuarioInspector() != null) {
            response.setInspectorId(inspeccion.getUsuarioInspector().getIdUsuarios());
            response.setInspectorNombre(inspeccion.getUsuarioInspector().getUsername());
        }

        List<InspeccionInstanciaResponse> instanciasResp = inspeccion.getInstancias().stream()
                .map(this::convertirAInspeccionInstanciaResponse)
                .collect(Collectors.toList());
        response.setInstancias(instanciasResp);
        return response;
    }

    private InspeccionInstanciaResponse convertirAInspeccionInstanciaResponse(InspeccionInstancia ii) {
        InspeccionInstanciaResponse resp = new InspeccionInstanciaResponse();
        resp.setIdInspeccionInstancia(ii.getId());
        InstanciaTramite it = ii.getInstanciaTramite();
        if (it != null) {
            resp.setIdInstancia(it.getIdInstancia());
            resp.setIdentificador(it.getIdentificador());
            if (it.getTramite() != null) {
                resp.setTramiteId(it.getTramite().getIdTramite());
                resp.setCodigoRut(it.getTramite().getCodigoRut());
            }
        }
        resp.setEstadoInstancia(ii.getEstadoInstancia());
        resp.setPlaca(ii.getPlaca());
        resp.setObservaciones(ii.getObservaciones());
        resp.setFechaInspeccion(ii.getFechaInspeccion());
        return resp;
    }

    private InspeccionInstanciaResponse convertirInstanciaTramiteAInspeccionInstanciaResponse(InstanciaTramite it) {
        InspeccionInstanciaResponse resp = new InspeccionInstanciaResponse();
        // No hay InspeccionInstancia asociada
        resp.setIdInspeccionInstancia(null);
        resp.setIdInstancia(it.getIdInstancia());
        resp.setIdentificador(it.getIdentificador());
        if (it.getTramite() != null) {
            resp.setTramiteId(it.getTramite().getIdTramite());
            resp.setCodigoRut(it.getTramite().getCodigoRut());
        }
        // Campos de inspección vacíos
        resp.setEstadoInstancia(null);
        resp.setPlaca(null);
        resp.setObservaciones(null);
        resp.setFechaInspeccion(null);
        return resp;
    }

    private String generarCodigoInspeccion() {
        return "INS-" + System.currentTimeMillis() % 1000000;
    }

    private FichaInspeccionResponseDTO convertirAFichaResponseDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());

        // Incluir id del VehiculoApto si existe
        if (ficha.getVehiculoApto() != null) {
            VehiculoApto va = ficha.getVehiculoApto();
            dto.setVehiculoAptoId(va.getIdVehiculoApto());
            dto.setEstadoDocumental(va.getEstadoDocumental());
            Tramite tram = va.getTramite();
            if (tram != null) {
                if (tram.getEmpresa() != null) {
                    dto.setEmpresaNombre(tram.getEmpresa().getNombre());
                }
            }
        }

        // Datos del vehículo
        Vehiculo vehiculo = vehiculoRepository.findById(ficha.getVehiculo()).orElse(null);
        if (vehiculo != null) {
            dto.setVehiculoPlaca(vehiculo.getPlaca());
            dto.setVehiculoMarca(vehiculo.getMarca());
            dto.setVehiculoModelo(vehiculo.getModelo());
        }

        // Parámetros de inspección
        List<ParametrosInspeccion> parametros = parametrosInspeccionRepository.findByFichaInspeccion_IdFichaInspeccion(ficha.getIdFichaInspeccion());
        List<ParametroInspeccionResponseDTO> parametrosDTO = parametros.stream()
                .map(this::convertirAParametroResponseDTO)
                .collect(Collectors.toList());
        dto.setParametros(parametrosDTO);

        return dto;
    }

    private ParametroInspeccionResponseDTO convertirAParametroResponseDTO(ParametrosInspeccion param) {
        ParametroInspeccionResponseDTO dto = new ParametroInspeccionResponseDTO();
        dto.setIdParametros(param.getIdParametros());
        dto.setParametro(param.getParametro());
        dto.setObservacion(param.getObservacion());
        return dto;
    }

    @Transactional
    public InspeccionResponse actualizar(Long id, InspeccionUpdateRequestDTO dto) {
        Inspeccion inspeccion = inspeccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));

        if (dto.getFechaProgramada() != null) {
            inspeccion.setFechaProgramada(dto.getFechaProgramada());
        }
        if (dto.getHora() != null) {
            inspeccion.setHora(dto.getHora());
        }
        if (dto.getLugar() != null) {
            inspeccion.setLugar(dto.getLugar());
        }
        if (dto.getEstado() != null) {
            inspeccion.setEstado(dto.getEstado());
        }
        if (dto.getObservacionesGenerales() != null) {
            inspeccion.setObservacionesGenerales(dto.getObservacionesGenerales());
        }
        inspeccion.setFechaActualizacion(LocalDateTime.now());
        inspeccionRepository.save(inspeccion);
        return convertirAResponse(inspeccion);
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

    @Transactional
    public InspeccionResponse cancelar(Long id) {
        Inspeccion inspeccion = inspeccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        if ("CANCELADA".equals(inspeccion.getEstado())) {
            throw new IllegalStateException("La inspección ya está cancelada");
        }
        inspeccion.setEstado("CANCELADA");
        inspeccion.setFechaActualizacion(LocalDateTime.now());
        inspeccion = inspeccionRepository.save(inspeccion);
        return convertirAResponse(inspeccion);
    }

    @Transactional
    public InspeccionResponse iniciar(Long id, InspeccionIniciarRequest request) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));

        if (!"PROGRAMADA".equals(inspeccion.getEstado())) {
            throw new IllegalStateException("La inspección debe estar en estado PROGRAMADA para iniciar");
        }

        // Asignar inspector si se proporciona
        if (request.getUsuarioInspectorId() != null) {
            Users inspector = usersRepository.findById(request.getUsuarioInspectorId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario inspector no encontrado"));
            inspeccion.setUsuarioInspector(inspector);
        }

        inspeccion.setEstado("EN_CURSO");
        inspeccion.setFechaEjecucion(LocalDateTime.now());
        inspeccion.setFechaActualizacion(LocalDateTime.now());

        inspeccion = inspeccionRepository.save(inspeccion);
        return convertirAResponse(inspeccion);
    }

    @Transactional
    public InspeccionResponse terminar(Long id, InspeccionTerminarRequest request) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));

        if (!"EN_CURSO".equals(inspeccion.getEstado())) {
            throw new IllegalStateException("La inspección debe estar en estado EN_CURSO para terminar");
        }

        // Validar que todas las instancias estén inspeccionadas (estado "INSPECCIONADO")
        List<InspeccionInstancia> pendientes = inspeccion.getInstancias().stream()
                .filter(ii -> !"INSPECCIONADO".equals(ii.getEstadoInstancia()))
                .collect(Collectors.toList());

        if (!pendientes.isEmpty()) {
            throw new IllegalStateException("No se puede terminar la inspección. Faltan inspeccionar " + pendientes.size() + " vehículo(s).");
        }

        inspeccion.setEstado("FINALIZADA");
        inspeccion.setResultadoGeneral(request.getResultadoGeneral());
        if (inspeccion.getFechaEjecucion() == null) {
            inspeccion.setFechaEjecucion(LocalDateTime.now());
        }
        inspeccion.setFechaActualizacion(LocalDateTime.now());

        inspeccion = inspeccionRepository.save(inspeccion);

        // Procesar vehículos aprobados: crear/actualizar estado y asignar empresa
        List<FichaInspeccion> fichas = fichaInspeccionRepository.findByInspeccion(inspeccion.getIdInspeccion());
        Empresa empresa = null;
        if (inspeccion.getTramite() != null) {
            empresa = inspeccion.getTramite().getEmpresa();
        }
        for (FichaInspeccion ficha : fichas) {
            if ("APROBADO".equals(ficha.getResultado())) {
                Vehiculo vehiculo = ficha.getVehiculoEntity();
                if (vehiculo != null) {
                    vehiculo.setEstado("HABILITADO");
                    if (empresa != null && vehiculo.getEmpresa() == null) {
                        vehiculo.setEmpresa(empresa);
                    }
                    vehiculo.setFechaActualizacion(LocalDateTime.now());
                    vehiculoRepository.save(vehiculo);
                }
            }
        }

        return convertirAResponse(inspeccion);
    }

    public SiguienteInstanciaPendienteResponse obtenerSiguienteInstanciaPendiente(Long inspeccionId) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));

        return inspeccion.getInstancias().stream()
                .filter(ii -> "PENDIENTE".equals(ii.getEstadoInstancia()))
                .findFirst()
                .map(this::convertirASiguientePendienteResponse)
                .orElse(null);
    }

    private SiguienteInstanciaPendienteResponse convertirASiguientePendienteResponse(InspeccionInstancia ii) {
        SiguienteInstanciaPendienteResponse resp = new SiguienteInstanciaPendienteResponse();
        resp.setIdInspeccionInstancia(ii.getId());
        InstanciaTramite it = ii.getInstanciaTramite();
        if (it != null) {
            resp.setIdInstancia(it.getIdInstancia());
            resp.setIdentificador(it.getIdentificador());
        }
        resp.setPlaca(ii.getPlaca());
        resp.setEstadoInstancia(ii.getEstadoInstancia());
        return resp;
    }

    /**
     * Obtiene un vehículo por placa, o lo crea automáticamente si no existe.
     * Esto asegura que el campo vehiculo en ficha_inspeccion nunca sea null.
     */
    private Vehiculo obtenerOcrearVehiculo(String placa) {
        if (placa == null || placa.trim().isEmpty()) {
            throw new IllegalArgumentException("La placa no puede ser nula o vacía");
        }
        String placaNormalizada = placa.toUpperCase().trim();
        return vehiculoRepository.findByPlaca(placaNormalizada).orElseGet(() -> {
            Vehiculo v = new Vehiculo();
            v.setPlaca(placaNormalizada);
            v.setFechaRegistro(LocalDateTime.now());
            // estado por defecto: "DESHABILITADO" (campo nullable=false con default)
            return vehiculoRepository.save(v);
        });
    }

    @Transactional
    public void inspeccionarInstancia(Long instanciaId, InspeccionInstanciaInspeccionarRequest request) {
        InspeccionInstancia ii = inspeccionInstanciaRepository.findById(instanciaId)
                .orElseThrow(() -> new IllegalArgumentException("Instancia de inspección no encontrada"));

        if (!"PENDIENTE".equals(ii.getEstadoInstancia())) {
            throw new IllegalStateException("La instancia ya fue inspeccionada o está en proceso");
        }

        // Validar y normalizar placa
        if (request.getPlaca() == null || request.getPlaca().trim().isEmpty()) {
            throw new IllegalArgumentException("La placa es obligatoria para iniciar la inspección del vehículo");
        }
        String placa = request.getPlaca().toUpperCase().trim();

        // Buscar vehículo por placa
        Vehiculo vehiculo = obtenerOcrearVehiculo(placa);

        // Validar que el vehículo pertenece a la misma empresa del trámite
        Tramite tramite = ii.getInspeccion().getTramite();
        Empresa empresa = tramite.getEmpresa();
        if (vehiculo.getEmpresa() != null && empresa != null &&
                !vehiculo.getEmpresa().getIdEmpresa().equals(empresa.getIdEmpresa())) {
            throw new IllegalArgumentException("Vehículo " + placa + " no pertenece a la empresa del trámite");
        }

        // Actualizar InspeccionInstancia
        ii.setEstadoInstancia("EN_INSPECCION");
        ii.setPlaca(placa);
        ii.setFechaInspeccion(request.getFechaInspeccion() != null ? request.getFechaInspeccion() : LocalDateTime.now());

        // Asignar inspector si se proporciona
        if (request.getUsuarioInspectorId() != null) {
            Users inspector = usersRepository.findById(request.getUsuarioInspectorId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario inspector no encontrado"));
            ii.getInspeccion().setUsuarioInspector(inspector);
        }

        inspeccionInstanciaRepository.save(ii);

        // Buscar ficha asociada a esta instancia (por instanciaTramiteId)
        FichaInspeccion ficha = fichaInspeccionRepository
                .findByInstanciaTramiteIdAndInspeccion(ii.getInstanciaTramite().getIdInstancia(), ii.getInspeccion().getIdInspeccion())
                .orElse(null);

        if (ficha == null) {
            // Crear nueva ficha
            ficha = new FichaInspeccion();
            ficha.setInspeccion(ii.getInspeccion().getIdInspeccion());
            ficha.setVehiculo(vehiculo.getIdVehiculo());
            ficha.setSolicitud(null);
            ficha.setUsuarioInspector(request.getUsuarioInspectorId());
            ficha.setEstado(true);
            ficha.setResultado("PENDIENTE");
            ficha.setObservaciones(request.getObservaciones());
            ficha.setFechaInspeccion(ii.getFechaInspeccion());
            ficha.setFechaCreacion(LocalDateTime.now());
            ficha.setFechaActualizacion(LocalDateTime.now());
            ficha.setInstanciaTramiteId(ii.getInstanciaTramite().getIdInstancia());

            // Vincular VehiculoApto si existe
            VehiculoApto apto = vehiculoAptoRepository
                    .findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(tramite.getIdTramite(), vehiculo.getIdVehiculo())
                    .orElse(null);
            ficha.setVehiculoApto(apto);

            fichaInspeccionRepository.save(ficha);
        } else {
            // Actualizar ficha existente
            ficha.setVehiculo(vehiculo.getIdVehiculo());
            ficha.setUsuarioInspector(request.getUsuarioInspectorId());
            ficha.setObservaciones(request.getObservaciones());
            ficha.setFechaInspeccion(ii.getFechaInspeccion());
            ficha.setFechaActualizacion(LocalDateTime.now());
            fichaInspeccionRepository.save(ficha);
        }
    }

    @Transactional
    public void completarInstancia(Long instanciaId, InspeccionInstanciaInspeccionarRequest request) {
        InspeccionInstancia ii = inspeccionInstanciaRepository.findById(instanciaId)
                .orElseThrow(() -> new IllegalArgumentException("Instancia de inspección no encontrada"));

        Tramite tramite = ii.getInspeccion().getTramite();

        // Actualizar InspeccionInstancia: marcar como inspeccionado (permite actualizaciones múltiples)
        ii.setEstadoInstancia("INSPECCIONADO");
        if (request.getPlaca() != null && !request.getPlaca().trim().isEmpty()) {
            ii.setPlaca(request.getPlaca().toUpperCase().trim());
        }
        ii.setObservaciones(request.getObservaciones());
        ii.setFechaInspeccion(request.getFechaInspeccion() != null ? request.getFechaInspeccion() : LocalDateTime.now());

        inspeccionInstanciaRepository.save(ii);

        // Buscar vehículo por placa (usar la placa ya guardada en ii)
        String placa = ii.getPlaca();
        if (placa == null || placa.trim().isEmpty()) {
            throw new IllegalStateException("No se ha registrado placa para esta instancia");
        }
        Vehiculo vehiculo = obtenerOcrearVehiculo(placa);

        // Buscar ficha por inspección y vehículo
        FichaInspeccion ficha = fichaInspeccionRepository.findByInspeccionAndVehiculo(
                ii.getInspeccion().getIdInspeccion(), vehiculo.getIdVehiculo()).orElse(null);

        if (ficha != null) {
            ficha.setResultado(request.getResultado());
            ficha.setEstado(request.getEstado() != null ? request.getEstado() : true);
            ficha.setObservaciones(request.getObservaciones());
            ficha.setFechaInspeccion(ii.getFechaInspeccion());
            ficha.setFechaActualizacion(LocalDateTime.now());

            // Actualizar parámetros si se envían
            if (request.getParametros() != null && !request.getParametros().isEmpty()) {
                // Eliminar parámetros existentes
                parametrosInspeccionRepository.deleteByFichaInspeccion_IdFichaInspeccion(ficha.getIdFichaInspeccion());

                // Crear nuevos parámetros
                for (ParametroInspeccionDTO paramDTO : request.getParametros()) {
                    ParametrosInspeccion param = new ParametrosInspeccion();
                    param.setParametro(paramDTO.getParametro());
                    param.setObservacion(paramDTO.getObservacion() != null ? paramDTO.getObservacion() : "");
                    param.setFichaInspeccion(ficha);
                    parametrosInspeccionRepository.save(param);
                }
            }

            fichaInspeccionRepository.save(ficha);
        } else {
            // Si no existe ficha, crearla con los datos finales
            ficha = new FichaInspeccion();
            ficha.setInspeccion(ii.getInspeccion().getIdInspeccion());
            ficha.setVehiculo(vehiculo.getIdVehiculo());
            ficha.setSolicitud(null);
            ficha.setUsuarioInspector(ii.getInspeccion().getUsuarioInspector() != null ?
                    ii.getInspeccion().getUsuarioInspector().getIdUsuarios() : null);
            ficha.setEstado(request.getEstado() != null ? request.getEstado() : true);
            ficha.setResultado(request.getResultado());
            ficha.setObservaciones(request.getObservaciones());
            ficha.setFechaInspeccion(ii.getFechaInspeccion());
            ficha.setFechaCreacion(LocalDateTime.now());
            ficha.setFechaActualizacion(LocalDateTime.now());

            // Vincular VehiculoApto
            if (tramite != null) {
                VehiculoApto apto = vehiculoAptoRepository
                        .findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(tramite.getIdTramite(), vehiculo.getIdVehiculo())
                        .orElse(null);
                ficha.setVehiculoApto(apto);
            }

            fichaInspeccionRepository.save(ficha);

            // Guardar parámetros si se envían
            if (request.getParametros() != null && !request.getParametros().isEmpty()) {
                for (ParametroInspeccionDTO paramDTO : request.getParametros()) {
                    ParametrosInspeccion param = new ParametrosInspeccion();
                    param.setParametro(paramDTO.getParametro());
                    param.setObservacion(paramDTO.getObservacion() != null ? paramDTO.getObservacion() : "");
                    param.setFichaInspeccion(ficha);
                    parametrosInspeccionRepository.save(param);
                }
            }
        }
    }

    // ==================== ACCIONES POR BLOQUE ====================

    /**
     * Obtiene las inspecciones que pertenecen a un bloque (fecha + lugar).
     */
    public List<Inspeccion> getInspeccionesByBloque(LocalDate fecha, String lugar) {
        return listarTodas().stream()
                .filter(i -> i.getFechaProgramada().equals(fecha) && lugar.equals(i.getLugar()))
                .collect(Collectors.toList());
    }

    /**
     * Crea una nueva inspección dentro de un bloque existente (misma fecha y lugar)
     * con las instancias de trámite especificadas.
     */
    @Transactional
    public InspeccionResponse crearInspeccionEnBloque(LocalDate fecha, String lugar, CrearInspeccionEnBloqueRequest request) {
        if (request.getInstanciasTramiteIds() == null || request.getInstanciasTramiteIds().isEmpty()) {
            throw new IllegalArgumentException("Debe proporcionar al menos una instancia de trámite");
        }
        if (request.getHora() == null || request.getHora().trim().isEmpty()) {
            throw new IllegalArgumentException("La hora es obligatoria para programar la inspección");
        }

        // Obtener primera instancia para derivar trámite
        InstanciaTramite primeraInstancia = instanciaTramiteRepository.findById(request.getInstanciasTramiteIds().get(0))
                .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + request.getInstanciasTramiteIds().get(0)));
        Tramite tramite = primeraInstancia.getTramite();
        if (tramite == null) {
            throw new IllegalStateException("La primera instancia no tiene trámite asociado");
        }

        // Validar que todas las instancias pertenezcan al mismo trámite
        for (Long instanciaId : request.getInstanciasTramiteIds()) {
            InstanciaTramite it = instanciaTramiteRepository.findById(instanciaId)
                    .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + instanciaId));
            if (!it.getTramite().getIdTramite().equals(tramite.getIdTramite())) {
                throw new IllegalArgumentException("Todas las instancias deben pertenecer al mismo trámite");
            }
        }

        // Crear inspección
        Inspeccion inspeccion = new Inspeccion();
        inspeccion.setCodigo(generarCodigoInspeccion());
        inspeccion.setFechaProgramada(fecha);
        inspeccion.setHora(request.getHora());
        inspeccion.setLugar(lugar);
        inspeccion.setObservacionesGenerales(request.getObservacionesGenerales());
        inspeccion.setEstado("PROGRAMADA");
        inspeccion.setTramite(tramite);
        inspeccion.setInstanciaTramite(primeraInstancia);

        // Asignar inspector si se proporciona
        if (request.getUsuarioInspectorId() != null) {
            Users inspector = usersRepository.findById(request.getUsuarioInspectorId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario inspector no encontrado"));
            inspeccion.setUsuarioInspector(inspector);
        }

        inspeccion = inspeccionRepository.save(inspeccion);

        // Agregar instancias
        for (Long instanciaId : request.getInstanciasTramiteIds()) {
            InstanciaTramite instancia = instanciaTramiteRepository.findById(instanciaId)
                    .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + instanciaId));
            InspeccionInstancia ii = new InspeccionInstancia();
            ii.setInstanciaTramite(instancia);
            ii.setEstadoInstancia("PENDIENTE");
            inspeccion.addInstancia(ii);
        }

        inspeccion = inspeccionRepository.save(inspeccion);



         // Crear ficha de inspección para cada instancia (una por vehículo)
         for (Long instanciaId : request.getInstanciasTramiteIds()) {
                InstanciaTramite instancia = instanciaTramiteRepository.findById(instanciaId)
                        .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + instanciaId));
                String placa = instancia.getIdentificador();
                if (placa == null || placa.trim().isEmpty()) {
                    throw new IllegalStateException("Instancia " + instanciaId + " no tiene identificador (placa) asignado");
                }
                Vehiculo vehiculo = obtenerOcrearVehiculo(placa);
                Long vehiculoId = vehiculo.getIdVehiculo();

             FichaInspeccion ficha = new FichaInspeccion();
             ficha.setInspeccion(inspeccion.getIdInspeccion());
             ficha.setInstanciaTramiteId(instanciaId);
             ficha.setEstado(true);
             ficha.setResultado("PENDIENTE");
             ficha.setFechaCreacion(LocalDateTime.now());
             ficha.setFechaActualizacion(LocalDateTime.now());
             ficha.setVehiculo(vehiculoId);
             // Asociar solicitud del trámite si está disponible
             if (tramite.getSolicitud() != null) {
                 ficha.setSolicitud(tramite.getSolicitud().getIdSolicitud());
             }
             fichaInspeccionRepository.save(ficha);
         }

        return convertirAResponse(inspeccion);
    }

    /**
     * Inicia todas las inspecciones de un bloque (cambia estado a EN_CURSO).
     * Opcionalmente asigna un inspector a todas.
     */
    @Transactional
    public List<InspeccionResponse> iniciarBloque(LocalDate fecha, String lugar, Long usuarioInspectorId) {
        List<Inspeccion> inspecciones = getInspeccionesByBloque(fecha, lugar);
        if (inspecciones.isEmpty()) {
            throw new IllegalArgumentException("No hay inspecciones en el bloque especificado");
        }

        Users inspector = null;
        if (usuarioInspectorId != null) {
            inspector = usersRepository.findById(usuarioInspectorId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario inspector no encontrado"));
        }

        List<InspeccionResponse> result = new ArrayList<>();
        for (Inspeccion inspeccion : inspecciones) {
            if ("PROGRAMADA".equals(inspeccion.getEstado())) {
                if (inspector != null) {
                    inspeccion.setUsuarioInspector(inspector);
                }
                inspeccion.setEstado("EN_CURSO");
                inspeccion.setFechaEjecucion(LocalDateTime.now());
                inspeccion.setFechaActualizacion(LocalDateTime.now());
                inspeccion = inspeccionRepository.save(inspeccion);
                result.add(convertirAResponse(inspeccion));
            }
        }

        if (result.isEmpty()) {
            throw new IllegalStateException("Ninguna inspección del bloque estaba en estado PROGRAMADA");
        }

        return result;
    }

    /**
     * Cancela todas las inspecciones de un bloque (cambia estado a CANCELADA).
     * Solo cancela las que no estén ya FINALIZADA.
     */
    @Transactional
    public List<InspeccionResponse> cancelarBloque(LocalDate fecha, String lugar) {
        List<Inspeccion> inspecciones = getInspeccionesByBloque(fecha, lugar);
        if (inspecciones.isEmpty()) {
            throw new IllegalArgumentException("No hay inspecciones en el bloque especificado");
        }

        List<InspeccionResponse> result = new ArrayList<>();
        for (Inspeccion inspeccion : inspecciones) {
            if (!"CANCELADA".equals(inspeccion.getEstado()) && !"FINALIZADA".equals(inspeccion.getEstado())) {
                inspeccion.setEstado("CANCELADA");
                inspeccion.setFechaActualizacion(LocalDateTime.now());
                inspeccion = inspeccionRepository.save(inspeccion);
                result.add(convertirAResponse(inspeccion));
            }
        }

        if (result.isEmpty()) {
            throw new IllegalStateException("Ninguna inspección del bloque podía ser cancelada (ya están FINALIZADA o CANCELADA)");
        }

        return result;
    }

    //Lista todas las instancias de trámite con su estado de inspección.
    public List<InspeccionInstanciaResponse> listarInstanciasPorTramite(Long tramiteId) {
        // Obtener todas las inspecciones del trámite
        List<Inspeccion> inspecciones = listarPorTramite(tramiteId);
        List<InspeccionInstanciaResponse> respuestas = new ArrayList<>();
        for (Inspeccion inspeccion : inspecciones) {
            // Cargar la inspección con sus instancias
            Inspeccion inspeccionCompleta = buscarPorId(inspeccion.getIdInspeccion());
            if (inspeccionCompleta != null && inspeccionCompleta.getInstancias() != null) {
                for (InspeccionInstancia ii : inspeccionCompleta.getInstancias()) {
                    respuestas.add(convertirAInspeccionInstanciaResponse(ii));
                }
            }
        }
        return respuestas;
    }

    //Lista las instancias de trámite que NO están asignadas a una inspección específica.
    //Útil para agregar instancias faltantes a una inspección existente.
    public List<InspeccionInstanciaResponse> listarInstanciasDisponibles(Long tramiteId, Long inspeccionId) {
        List<InstanciaTramite> todasInstancias = instanciaTramiteRepository.findByTramite_IdTramiteOrderByFechaCreacionDesc(tramiteId);

        // Obtener las instancias ya asignadas a la inspección usando el método que carga las relaciones
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId).orElse(null);
        final Set<Long> instanciasAsignadas;
        if (inspeccion != null && inspeccion.getInstancias() != null) {
            instanciasAsignadas = inspeccion.getInstancias().stream()
                    .map(ii -> ii.getInstanciaTramite().getIdInstancia())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
        } else {
            instanciasAsignadas = new HashSet<>();
        }

        return todasInstancias.stream()
                .filter(ii -> !instanciasAsignadas.contains(ii.getIdInstancia()))
                .map(this::convertirInstanciaTramiteAInspeccionInstanciaResponse)
                .collect(Collectors.toList());
    }
}
