package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.BloqueInspeccionDTO;
import com.example.demo.dto.CrearInspeccionEnBloqueRequest;
import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.InspeccionCabeceraCreateDTO;
import com.example.demo.dto.InspeccionConInstanciasCreateRequest;
import com.example.demo.dto.InspeccionCreateRequestDTO;
import com.example.demo.dto.InspeccionIniciarRequest;
import com.example.demo.dto.InspeccionInstanciaInspeccionarRequest;
import com.example.demo.dto.InspeccionInstanciaResponse;
import com.example.demo.dto.InspeccionPublicaDTO;
import com.example.demo.dto.InspeccionResponse;
import com.example.demo.dto.InspeccionRezagadaRequest;
import com.example.demo.dto.InspeccionTerminarRequest;
import com.example.demo.dto.InspeccionUpdateRequestDTO;
import com.example.demo.dto.ParametroInspeccionDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
import com.example.demo.dto.SiguienteInstanciaPendienteResponse;
import com.example.demo.dto.TareaInspeccionColumnaDTO;
import com.example.demo.dto.TareasInspeccionResponse;
import com.example.demo.dto.VehiculoDTO;
import com.example.demo.model.CampoFormato;
import com.example.demo.model.Empresa;
import com.example.demo.model.EstadoDocumental;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.FormatoInspeccion;
import com.example.demo.model.Inspeccion;
import com.example.demo.model.InspeccionInstancia;
import com.example.demo.model.InstanciaTramite;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.model.ValorCampo;
import com.example.demo.model.Vehiculo;
import com.example.demo.model.VehiculoApto;
import com.example.demo.repository.CampoFormatoRepository;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.FormatoInspeccionRepository;
import com.example.demo.repository.InspeccionInstanciaRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.InstanciaTramiteRepository;
import com.example.demo.repository.ParametrosInspeccionRepository;
import com.example.demo.repository.RequisitoTUPACRepository;
import com.example.demo.repository.TramiteRepository;
import com.example.demo.repository.UsersRepository;
import com.example.demo.repository.ValorCampoRepository;
import com.example.demo.repository.VehiculoAptoRepository;
import com.example.demo.repository.VehiculoRepository;

@Service
public class InspeccionService {

    private final InspeccionRepository inspeccionRepository;
    private final TramiteRepository tramiteRepository;
    private final VehiculoRepository vehiculoRepository;
    private final FichaInspeccionRepository fichaInspeccionRepository;
    private final RequisitoTUPACRepository requisitoTUPACRepository;
    private final UsersRepository usersRepository;
    private final VehiculoAptoRepository vehiculoAptoRepository;
    private final InstanciaTramiteRepository instanciaTramiteRepository;
    private final InspeccionInstanciaRepository inspeccionInstanciaRepository;
    private final CampoFormatoRepository campoFormatoRepository;
    private final ValorCampoRepository valorCampoRepository;
    private final FichaInspeccionService fichaInspeccionService;

    public InspeccionService(InspeccionRepository inspeccionRepository,
                             TramiteRepository tramiteRepository,
                             VehiculoRepository vehiculoRepository,
                             FichaInspeccionRepository fichaInspeccionRepository,
                             ParametrosInspeccionRepository parametrosInspeccionRepository,
                             RequisitoTUPACRepository requisitoTUPACRepository,
                             UsersRepository usersRepository,
                             VehiculoAptoRepository vehiculoAptoRepository,
                             InstanciaTramiteRepository instanciaTramiteRepository,
                             InspeccionInstanciaRepository inspeccionInstanciaRepository,
                             FormatoInspeccionRepository formatoInspeccionRepository,
                             CampoFormatoRepository campoFormatoRepository,
                             ValorCampoRepository valorCampoRepository,
                             FichaInspeccionService fichaInspeccionService) {
        this.inspeccionRepository = inspeccionRepository;
        this.tramiteRepository = tramiteRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.fichaInspeccionRepository = fichaInspeccionRepository;
        this.requisitoTUPACRepository = requisitoTUPACRepository;
        this.usersRepository = usersRepository;
        this.vehiculoAptoRepository = vehiculoAptoRepository;
        this.instanciaTramiteRepository = instanciaTramiteRepository;
        this.inspeccionInstanciaRepository = inspeccionInstanciaRepository;
        this.campoFormatoRepository = campoFormatoRepository;
        this.valorCampoRepository = valorCampoRepository;
        this.fichaInspeccionService = fichaInspeccionService;
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
                String empresaNombre = inspeccion.getEmpresaNombre();
                if (empresaNombre == null || empresaNombre.trim().isEmpty()) {
                    empresaNombre = "Sin empresa";
                }

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

        LocalDate fechaProgramada;
        try {
            fechaProgramada = LocalDate.parse(dto.getFechaProgramada());
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato de fecha inválido. Use yyyy-MM-dd");
        }

        Inspeccion inspeccion = new Inspeccion();
        inspeccion.setCodigo(generarCodigoInspeccion());
        inspeccion.setFechaProgramada(fechaProgramada);
        inspeccion.setHora(dto.getHoraProgramada());
        inspeccion.setLugar(dto.getLugar());
        inspeccion.setObservacionesGenerales(dto.getObservaciones());
        inspeccion.setEstado("PROGRAMADA");
        inspeccion.setInstanciaTramite(instancia);
        inspeccion.setTramite(tramite);
        inspeccion.setEmpresa(empresa);
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
        inspeccion.setEmpresa(tramite.getEmpresa());
        inspeccion.setUsuarioInspector(inspector);
        inspeccion = inspeccionRepository.save(inspeccion);

        // Usar formato reutilizable (no crea duplicados si ya hay uno activo)
        FormatoInspeccion formato = fichaInspeccionService.obtenerOCrearFormatoActivo(inspeccion);

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

            // Verificar si ya existe una ficha para este vehículo en esta inspección
            Optional<FichaInspeccion> fichaExistente = fichaInspeccionRepository
                    .findByInspeccionAndVehiculo(inspeccion.getIdInspeccion(), vehiculoId);
            FichaInspeccion ficha;
            if (fichaExistente.isPresent()) {
                ficha = fichaExistente.get();
                ficha.setVehiculoApto(apto);
                ficha.setFormatoInspeccion(formato);
                ficha.setFechaActualizacion(LocalDateTime.now());
                ficha = fichaInspeccionRepository.save(ficha);
                fichaInspeccionService.sincronizarValoresConFormato(ficha, formato);
            } else {
                ficha = new FichaInspeccion();
                ficha.setInspeccion(inspeccion.getIdInspeccion());
                ficha.setSolicitud(null);
                ficha.setUsuarioInspector(request.getUsuarioInspectorId());
                ficha.setVehiculo(vehiculoId);
                ficha.setEstado(true);
                ficha.setResultado("PENDIENTE");
                ficha.setFechaCreacion(LocalDateTime.now());
                ficha.setFechaActualizacion(LocalDateTime.now());
                ficha.setVehiculoApto(apto);
                ficha.setFormatoInspeccion(formato);
                ficha = fichaInspeccionRepository.save(ficha);

                // Crear valores vacíos para cada campo del formato (reutiliza helper)
                fichaInspeccionService.crearValoresCamposParaFicha(ficha, formato);
            }


            // Agregar parámetros basados en requisitos del tipo de trámite (como campos adicionales)
            if (tramite.getTipoTramite() != null && tramite.getTipoTramite().getRequisitosIds() != null) {
                // Buscar el tamaño actual de campos del formato para asignar el orden base
                List<CampoFormato> camposFormato = campoFormatoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(formato.getIdFormatoInspeccion());
                int ordenBase = camposFormato.size();
                List<Long> requisitosIds = parseRequisitosIds(tramite.getTipoTramite().getRequisitosIds());
                for (Long reqId : requisitosIds) {
                    RequisitoTUPAC req = requisitoTUPACRepository.findById(reqId).orElse(null);
                    if (req != null && Boolean.TRUE.equals(req.getActivo())) {
                        String nombreReq = req.getDescripcion();
                        CampoFormato campoReq = campoFormatoRepository.findByFormatoInspeccion_IdFormatoInspeccionAndNombre(formato.getIdFormatoInspeccion(), nombreReq)
                                .orElse(null);
                        if (campoReq == null) {
                            campoReq = new CampoFormato();
                            campoReq.setNombre(nombreReq);
                            campoReq.setSeccion("LABORATORIO");
                            campoReq.setOrden(ordenBase++);
                            campoReq.setTipoEvaluacion("TEXTO");
                            campoReq.setObligatorio(false);
                            campoReq.setFormatoInspeccion(formato);
                            campoReq = campoFormatoRepository.save(campoReq);
                        }
                        // Crear valor para esta ficha si no existe
                        ValorCampo existente = valorCampoRepository.findByFichaInspeccion_IdFichaInspeccionAndCampoFormato_IdCampoFormato(ficha.getIdFichaInspeccion(), campoReq.getIdCampoFormato());
                        if (existente == null) {
                            ValorCampo valor = new ValorCampo();
                            valor.setFichaInspeccion(ficha);
                            valor.setCampoFormato(campoReq);
                            valor.setValor("");
                            valor.setObservacion("");
                            valorCampoRepository.save(valor);
                        }
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

        // Usar formato reutilizable (no crea duplicados si ya hay uno activo)
        FormatoInspeccion formato = fichaInspeccionService.obtenerOCrearFormatoActivo(inspeccion);

        // Verificar si ya existe una ficha para esta instancia; si no viene instancia, recae al vehículo.
        Optional<FichaInspeccion> fichaExistente = request.getInstanciaTramiteId() != null
                ? fichaInspeccionRepository.findByInstanciaTramiteIdAndInspeccion(inspeccionId, request.getInstanciaTramiteId())
                : fichaInspeccionRepository.findByInspeccionAndVehiculo(inspeccionId, request.getVehiculoId());
        FichaInspeccion ficha;
        if (fichaExistente.isPresent()) {
            ficha = fichaExistente.get();
            ficha.setVehiculoApto(apto);
            if (request.getInstanciaTramiteId() != null) {
                ficha.setInstanciaTramiteId(request.getInstanciaTramiteId());
            }
            ficha.setFormatoInspeccion(formato);
            ficha.setFechaActualizacion(LocalDateTime.now());
            ficha = fichaInspeccionRepository.save(ficha);
            fichaInspeccionService.sincronizarValoresConFormato(ficha, formato);
        } else {
            // Crear ficha
            ficha = new FichaInspeccion();
            ficha.setInspeccion(inspeccionId);
            ficha.setInstanciaTramiteId(request.getInstanciaTramiteId());
            ficha.setSolicitud(null);
            ficha.setUsuarioInspector(request.getUsuarioInspectorId());
            ficha.setVehiculo(request.getVehiculoId());
            ficha.setEstado(request.getEstado() != null ? request.getEstado() : true);
            ficha.setResultado(request.getResultado() != null ? request.getResultado() : "PENDIENTE");
            ficha.setObservaciones(request.getObservaciones());
            ficha.setFechaCreacion(LocalDateTime.now());
            ficha.setFechaActualizacion(LocalDateTime.now());
            ficha.setVehiculoApto(apto); // Vincular si existe
            ficha.setFormatoInspeccion(formato);
            ficha = fichaInspeccionRepository.save(ficha);

            // Poblar valores vacíos para todos los campos del formato (reutiliza helper)
            fichaInspeccionService.crearValoresCamposParaFicha(ficha, formato);
        }

        // Si hay requisitos del tipo de trámite, agregarlos como campos al formato (si no existen) y crear valores para esta ficha
        Tramite tramite = inspeccion.getTramite();
        if (tramite != null && tramite.getTipoTramite() != null && tramite.getTipoTramite().getRequisitosIds() != null) {
            List<Long> requisitosIds = parseRequisitosIds(tramite.getTipoTramite().getRequisitosIds());
            // Obtener el tamaño actual de campos del formato para asignar el orden base
            List<CampoFormato> campos = campoFormatoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(formato.getIdFormatoInspeccion());
            int ordenBase = campos.size();
            for (Long reqId : requisitosIds) {
                RequisitoTUPAC req = requisitoTUPACRepository.findById(reqId).orElse(null);
                if (req != null && Boolean.TRUE.equals(req.getActivo())) {
                    String nombreReq = req.getDescripcion();
                    // Buscar si ya existe un campo con ese nombre en el formato
                    CampoFormato campoReq = campoFormatoRepository.findByFormatoInspeccion_IdFormatoInspeccionAndNombre(formato.getIdFormatoInspeccion(), nombreReq)
                            .orElse(null);
                    if (campoReq == null) {
                        campoReq = new CampoFormato();
                        campoReq.setNombre(nombreReq);
                        campoReq.setSeccion("LABORATORIO"); // por defecto, o mapear desde req si tiene sección
                        campoReq.setOrden(ordenBase++);
                        campoReq.setTipoEvaluacion("TEXTO");
                        campoReq.setObligatorio(false);
                        campoReq.setFormatoInspeccion(formato);
                        campoReq = campoFormatoRepository.save(campoReq);
                    }
                    // Crear valor para esta ficha si no existe
                    ValorCampo valExistente = valorCampoRepository.findByFichaInspeccion_IdFichaInspeccionAndCampoFormato_IdCampoFormato(ficha.getIdFichaInspeccion(), campoReq.getIdCampoFormato());
                    if (valExistente == null) {
                        ValorCampo valor = new ValorCampo();
                        valor.setFichaInspeccion(ficha);
                        valor.setCampoFormato(campoReq);
                        valor.setValor("");
                        valor.setObservacion("");
                        valorCampoRepository.save(valor);
                    }
                }
            }
        }

        return convertirAFichaResponseDTO(ficha);
    }

      @Transactional
      public ParametroInspeccionResponseDTO agregarParametro(Long fichaId, ParametroInspeccionDTO dto) {
          FichaInspeccion ficha = fichaInspeccionRepository.findById(fichaId)
                  .orElseThrow(() -> new IllegalArgumentException("Ficha no encontrada"));
          FormatoInspeccion formato = ficha.getFormatoInspeccion();
          if (formato == null) {
              throw new IllegalStateException("La ficha no tiene formato asociado");
          }

          CampoFormato campo;
          if (dto.getId() != null) {
              campo = campoFormatoRepository.findById(dto.getId())
                      .orElseThrow(() -> new IllegalArgumentException("Campo no encontrado"));
              // Verificar que el campo pertenece al formato de la ficha
              if (!formato.getIdFormatoInspeccion().equals(campo.getFormatoInspeccion().getIdFormatoInspeccion())) {
                  throw new IllegalArgumentException("El campo no pertenece al formato de la ficha");
              }
              // Actualizar nombre y sección si se envían
              if (dto.getParametro() != null) campo.setNombre(dto.getParametro());
              if (dto.getSeccion() != null) campo.setSeccion(dto.getSeccion());
              campoFormatoRepository.save(campo);
          } else {
              // Buscar campo por nombre
              campo = campoFormatoRepository.findByFormatoInspeccion_IdFormatoInspeccionAndNombre(formato.getIdFormatoInspeccion(), dto.getParametro())
                      .orElse(null);
              if (campo == null) {
                  // Crear nuevo campo
                  campo = new CampoFormato();
                  campo.setNombre(dto.getParametro());
                  campo.setSeccion(dto.getSeccion() != null ? dto.getSeccion() : "LABORATORIO");
                  int maxOrden = campoFormatoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(formato.getIdFormatoInspeccion())
                          .stream().mapToInt(CampoFormato::getOrden).max().orElse(-1);
                  campo.setOrden(maxOrden + 1);
                  campo.setTipoEvaluacion("TEXTO");
                  campo.setObligatorio(false);
                  campo.setFormatoInspeccion(formato);
                  campo = campoFormatoRepository.save(campo);
              }
          }

          // Buscar ValorCampo existente
          ValorCampo valorExistente = valorCampoRepository.findByFichaInspeccion_IdFichaInspeccionAndCampoFormato_IdCampoFormato(fichaId, campo.getIdCampoFormato());
          if (valorExistente != null) {
              valorExistente.setValor(dto.getObservacion() != null ? dto.getObservacion() : "");
              valorCampoRepository.save(valorExistente);
               return toParametroResponseDTO(campo, valorExistente);
          } else {
              ValorCampo valor = new ValorCampo();
              valor.setFichaInspeccion(ficha);
              valor.setCampoFormato(campo);
              valor.setValor(dto.getObservacion() != null ? dto.getObservacion() : "");
              valor.setObservacion("");
              valor = valorCampoRepository.save(valor);
               return toParametroResponseDTO(campo, valor);
          }
      }

      @Transactional
      public ParametroInspeccionResponseDTO actualizarParametro(Long paramId, ParametroInspeccionDTO dto) {
          ValorCampo valor = valorCampoRepository.findById(paramId)
                  .orElseThrow(() -> new IllegalArgumentException("Parámetro no encontrado"));
          // Actualizar nombre del campo si se envía
          if (dto.getParametro() != null) {
              CampoFormato campo = valor.getCampoFormato();
              campo.setNombre(dto.getParametro());
              if (dto.getSeccion() != null) campo.setSeccion(dto.getSeccion());
              campoFormatoRepository.save(campo);
          }
          if (dto.getObservacion() != null) {
              valor.setValor(dto.getObservacion());
          }
          valorCampoRepository.save(valor);
          return toParametroResponseDTO(valor.getCampoFormato(), valor);
      }

       @Transactional
       public void eliminarParametro(Long paramId) {
           valorCampoRepository.deleteById(paramId);
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
        inspeccion.setEmpresa(empresa);
        inspeccion.setUsuarioInspector(null);
        inspeccion = inspeccionRepository.save(inspeccion);

        FormatoInspeccion formato = fichaInspeccionService.obtenerOCrearFormatoActivo(inspeccion);

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

            // Verificar si ya existe una ficha para este vehículo en esta inspección
            Optional<FichaInspeccion> fichaExistente = fichaInspeccionRepository
                    .findByInspeccionAndVehiculo(inspeccion.getIdInspeccion(), vehiculoId);
            FichaInspeccion ficha;
            if (fichaExistente.isPresent()) {
                ficha = fichaExistente.get();
                ficha.setVehiculoApto(apto);
                ficha.setFormatoInspeccion(formato);
                ficha.setFechaActualizacion(LocalDateTime.now());
                ficha = fichaInspeccionRepository.save(ficha);
                fichaInspeccionService.sincronizarValoresConFormato(ficha, formato);
            } else {
                ficha = new FichaInspeccion();
                ficha.setInspeccion(inspeccion.getIdInspeccion());
                ficha.setSolicitud(null);
                ficha.setUsuarioInspector(null);
                ficha.setVehiculo(vehiculoId);
                ficha.setEstado(true);
                ficha.setResultado("PENDIENTE");
                ficha.setFechaCreacion(LocalDateTime.now());
                ficha.setFechaActualizacion(LocalDateTime.now());
                ficha.setVehiculoApto(apto);
                ficha.setFormatoInspeccion(formato);
                ficha = fichaInspeccionRepository.save(ficha);
                fichaInspeccionService.crearValoresCamposParaFicha(ficha, formato);
            }
            fichasCreadas.add(ficha);
        }

        inspeccion.setFichasInspeccion(fichasCreadas);
        return inspeccion;
    }

    // MÉTODOS PARA GESTIÓN DE INSPECCION-INSTANCIA

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

        Empresa empresa = null;
        if (request.getEmpresaId() != null) {
            Empresa empReq = new Empresa();
            empReq.setIdEmpresa(request.getEmpresaId());
            empresa = empReq;
        }
        if (empresa == null && tramite.getEmpresa() != null) {
            empresa = tramite.getEmpresa();
        }
        if (empresa == null && primeraInstancia.getTramite() != null) {
            empresa = primeraInstancia.getTramite().getEmpresa();
        }
        // empresa permitida como null: se muestra "Sin asignar" en la vista

        Inspeccion inspeccion = new Inspeccion();
        inspeccion.setCodigo(generarCodigoInspeccion());
        inspeccion.setFechaProgramada(request.getFechaProgramada());
        inspeccion.setHora(request.getHora());
        inspeccion.setLugar(request.getLugar());
        inspeccion.setObservacionesGenerales(request.getObservacionesGenerales());
        inspeccion.setEstado("PROGRAMADA");
        inspeccion.setCodigoGrupo(request.getCodigoGrupo());
        inspeccion.setTramite(tramite);
        inspeccion.setEmpresa(empresa);
        inspeccion.setFechaCreacion(LocalDateTime.now());
        inspeccion.setFechaActualizacion(LocalDateTime.now());

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

        // Asegurar FormatoInspeccion reutilizable para la inspección
        FormatoInspeccion formato = fichaInspeccionService.obtenerOCrearFormatoActivo(inspeccion);

        // Crear ficha de inspección para cada instancia (una por vehículo), evitando duplicados
        for (Long instanciaId : request.getInstanciasTramiteIds()) {
            InstanciaTramite instancia = instanciaTramiteRepository.findById(instanciaId)
                    .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + instanciaId));
            String placa = instancia.getIdentificador();
            if (placa == null || placa.trim().isEmpty()) {
                throw new IllegalStateException("Instancia " + instanciaId + " no tiene identificador (placa) asignado");
            }
            Vehiculo vehiculo = obtenerOcrearVehiculo(placa);
            Long vehiculoId = vehiculo.getIdVehiculo();

            Optional<FichaInspeccion> fichaExistente = fichaInspeccionRepository
                    .findByInstanciaTramiteIdAndInspeccion(inspeccion.getIdInspeccion(), instanciaId);
            FichaInspeccion ficha;
            if (fichaExistente.isPresent()) {
                ficha = fichaExistente.get();
                ficha.setVehiculo(vehiculoId);
                ficha.setFormatoInspeccion(formato);
                ficha.setFechaActualizacion(LocalDateTime.now());
                ficha = fichaInspeccionRepository.save(ficha);
                fichaInspeccionService.sincronizarValoresConFormato(ficha, formato);
            } else {
                ficha = new FichaInspeccion();
                ficha.setInspeccion(inspeccion.getIdInspeccion());
                ficha.setInstanciaTramiteId(instanciaId);
                ficha.setEstado(true);
                ficha.setResultado("PENDIENTE");
                ficha.setFechaCreacion(LocalDateTime.now());
                ficha.setFechaActualizacion(LocalDateTime.now());
                ficha.setVehiculo(vehiculoId);
                ficha.setFormatoInspeccion(formato);
                if (tramite.getSolicitud() != null) {
                    ficha.setSolicitud(tramite.getSolicitud().getIdSolicitud());
                }
                ficha = fichaInspeccionRepository.save(ficha);

                fichaInspeccionService.crearValoresCamposParaFicha(ficha, formato);
            }
        }

        return convertirAResponse(inspeccion);
    }

    //Inicia todas las inspecciones de un bloque (cambia estado a EN_CURSO).
    // Opcionalmente asigna un inspector a todas.
    private List<Inspeccion> getInspeccionesByBloque(LocalDate fecha, String lugar) {
        return inspeccionRepository.findAllWithDetails().stream()
                .filter(i -> fecha.equals(i.getFechaProgramada()))
                .filter(i -> lugar != null && lugar.equals(i.getLugar()))
                .collect(java.util.stream.Collectors.toList());
    }

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
        List<Inspeccion> inspecciones = listarPorTramite(tramiteId);
        List<InspeccionInstanciaResponse> respuestas = new ArrayList<>();
        for (Inspeccion inspeccion : inspecciones) {
            if (inspeccion.getInstancias() != null) {
                for (InspeccionInstancia ii : inspeccion.getInstancias()) {
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

    /**
     * Replica el formato (campos + títulos) de una ficha origen a todas las demás fichas de la inspección.
     * Limpia valores previos y crea estructura nueva a partir del formato origen.
     */
    @Transactional
    public void replicarFormatoEnInspeccion(Long inspeccionId, Long fichaOrigenId) {
        fichaInspeccionService.replicarFormatoEnInspeccion(inspeccionId, fichaOrigenId);
    }

    // ========== TAREAS DE INSPECCIÓN ==========

    /**
     * Construye columnas + filas para la tabla de tareas de inspección.
     * Columnas: cabecera (empresa, estado) + campos del {@link FormatoInspeccion} asociado.
     * Filas: una por {@link InspeccionInstancia}; valores de cabecera se repiten,
     * valores de formato se dejan vacíos (los completa el frontend).
     */
    @Transactional(readOnly = true)
    public TareasInspeccionResponse listaTareasFormato(Long inspeccionId) {
        // --- 1. Cargar entidad + formato de cabecera ---
        Inspeccion inspeccionCabecera = inspeccionRepository.findById(inspeccionId).orElse(null);
        if (inspeccionCabecera == null || inspeccionCabecera.getFormatoInspeccion() == null) {
            return new TareasInspeccionResponse(List.of(), List.of(), 0);
        }

        FormatoInspeccion formato = inspeccionCabecera.getFormatoInspeccion();
        String empresaNombre = inspeccionCabecera.getEmpresa() != null
                ? inspeccionCabecera.getEmpresa().getNombre() : "";

        // --- 2. Construir columnas desde el formato ---
        List<TareaInspeccionColumnaDTO> columnas = new ArrayList<>();

        // Columnas de cabecera (repetidas en cada fila)
        columnas.add(new TareaInspeccionColumnaDTO("N°", "cabecera.contador", true));
        columnas.add(new TareaInspeccionColumnaDTO("idInspeccion", "cabecera.idInspeccion", true));
        columnas.add(new TareaInspeccionColumnaDTO("empresaNombre", "cabecera.empresaNombre", true));
        columnas.add(new TareaInspeccionColumnaDTO("estado", "cabecera.estado", true));

        // Columnas desde formato_inspeccion (por cada campo del formato)
        List<CampoFormato> camposFormato = campoFormatoRepository
                .findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(formato.getIdFormatoInspeccion());
        for (CampoFormato campo : camposFormato) {
            // field se arma como "campo.<nombre del campo>" para que el frontend haga split y
            // resuelva el Nombre → ValorCampo
            columnas.add(new TareaInspeccionColumnaDTO(campo.getNombre(), "campo." + campo.getNombre(), true));
        }

        // Columna acciones (no es útil, es estructural)
        columnas.add(new TareaInspeccionColumnaDTO(null, "acciones", false));

        // --- 3. Cargar instancias (filas de tareas) ---
        List<InspeccionInstancia> instancias = inspeccionInstanciaRepository
                .findByInspeccion_IdInspeccion(inspeccionId);

        List<Map<String, Object>> filas = new ArrayList<>();
        int contador = 1;
        for (InspeccionInstancia instancia : instancias) {
            Map<String, Object> fila = new java.util.LinkedHashMap<>();

            // Columnas de cabecera
            fila.put("cabecera.contador", contador);
            fila.put("cabecera.idInspeccion", inspeccionCabecera.getIdInspeccion());
            fila.put("cabecera.empresaNombre", empresaNombre);
            fila.put("cabecera.estado", inspeccionCabecera.getEstado());

            // Columnas desde formato_inspeccion (valores por defecto vacíos; el frontend los rellena)
            for (CampoFormato campo : camposFormato) {
                fila.put("campo." + campo.getNombre(), "");
            }

            // Columna acciones
            fila.put("acciones", "");

            filas.add(fila);
            contador++;
        }

        return new TareasInspeccionResponse(columnas, filas, filas.size());
    }

    /**
     * Versión compacta de {@link #listaTareasFormato(Long)}: devuelve únicamente la cantidad
     * total de filas para la inspección dada. Pensado para consultas rápidas sin traer todo el
     * detalle de columnas y filas.
     *
     * @param inspeccionId identificador de la inspeccion
     * @return {@link TareasInspeccionResponse} con columnas, una fila vacía y la cantidad poblada
     */
    @Transactional(readOnly = true)
    public TareasInspeccionResponse inspeccionGetTareasInspeccionCantidad(Long inspeccionId) {
        List<TareaInspeccionColumnaDTO> columnas = List.of(
                new TareaInspeccionColumnaDTO("idInspeccion", "inspeccion.idInspeccion", true)
        );

        Inspeccion inspeccionEntity = inspeccionRepository.findById(inspeccionId).orElse(null);
        long cantidad = (inspeccionEntity != null)
                ? inspeccionInstanciaRepository.countByInspeccion_IdInspeccion(inspeccionId)
                : 0;

        java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
        fila.put("inspeccion.idInspeccion",
                inspeccionEntity != null ? inspeccionEntity.getIdInspeccion() : null);
        fila.put("cantidad", (int) cantidad);

        return new TareasInspeccionResponse(columnas, List.of(fila), (int) cantidad);
    }

    public InspeccionResponse obtenerConInstancias(Long inspeccionId) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElse(null);
        if (inspeccion == null) {
            return null;
        }
        return convertirAResponse(inspeccion);
    }

    @Transactional
    public InspeccionResponse actualizar(Long id, InspeccionUpdateRequestDTO dto) {
        Inspeccion inspeccion = inspeccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        if (dto.getEstado() != null) inspeccion.setEstado(dto.getEstado());
        if (dto.getFechaProgramada() != null) inspeccion.setFechaProgramada(dto.getFechaProgramada());
        if (dto.getHora() != null) inspeccion.setHora(dto.getHora());
        if (dto.getLugar() != null) inspeccion.setLugar(dto.getLugar());
        if (dto.getObservacionesGenerales() != null) inspeccion.setObservacionesGenerales(dto.getObservacionesGenerales());
        inspeccion.setFechaActualizacion(LocalDateTime.now());
        inspeccion = inspeccionRepository.save(inspeccion);
        return convertirAResponse(inspeccion);
    }

    @Transactional
    public InspeccionResponse cancelar(Long id) {
        Inspeccion inspeccion = inspeccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        inspeccion.setEstado("CANCELADA");
        inspeccion.setFechaActualizacion(LocalDateTime.now());
        inspeccion = inspeccionRepository.save(inspeccion);
        return convertirAResponse(inspeccion);
    }

    @Transactional
    public InspeccionResponse iniciar(Long id, InspeccionIniciarRequest request) {
        Inspeccion inspeccion = inspeccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        if (!"PROGRAMADA".equals(inspeccion.getEstado())) {
            throw new IllegalStateException("Solo se pueden iniciar inspecciones PROGRAMADAS");
        }
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
        Inspeccion inspeccion = inspeccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        inspeccion.setEstado("FINALIZADA");
        inspeccion.setResultadoGeneral(request.getResultadoGeneral());
        inspeccion.setFechaActualizacion(LocalDateTime.now());
        inspeccion = inspeccionRepository.save(inspeccion);
        return convertirAResponse(inspeccion);
    }

    public SiguienteInstanciaPendienteResponse obtenerSiguienteInstanciaPendiente(Long id) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(id).orElse(null);
        if (inspeccion == null || inspeccion.getInstancias() == null) {
            return null;
        }
        return inspeccion.getInstancias().stream()
                .filter(ii -> !"INSPECCIONADO".equals(ii.getEstadoInstancia()))
                .findFirst()
                .map(ii -> {
                    SiguienteInstanciaPendienteResponse r = new SiguienteInstanciaPendienteResponse();
                    r.setIdInspeccionInstancia(ii.getId());
                    InstanciaTramite it = ii.getInstanciaTramite();
                    if (it != null) {
                        r.setIdentificador(it.getIdentificador());
                    }
                    r.setEstadoInstancia(ii.getEstadoInstancia());
                    return r;
                })
                .orElse(null);
    }

    @Transactional
    public void inspeccionarInstancia(Long instanciaId, InspeccionInstanciaInspeccionarRequest request) {
        InspeccionInstancia ii = inspeccionInstanciaRepository.findById(instanciaId)
                .orElseThrow(() -> new IllegalArgumentException("Instancia de inspección no encontrada"));
        ii.setPlaca(request.getPlaca());
        ii.setObservaciones(request.getObservaciones());
        ii.setFechaInspeccion(LocalDateTime.now());
        ii.setEstadoInstancia("INSPECCIONADO");
        inspeccionInstanciaRepository.save(ii);
    }

    @Transactional
    public void completarInstancia(Long instanciaId, InspeccionInstanciaInspeccionarRequest request) {
        inspeccionarInstancia(instanciaId, request);
    }

    @Transactional
    public InspeccionResponse agregarInstancias(Long inspeccionId, List<Long> instanciasIds) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        for (Long instanciaId : instanciasIds) {
            InstanciaTramite instancia = instanciaTramiteRepository.findById(instanciaId)
                    .orElseThrow(() -> new IllegalArgumentException("Instancia de trámite no encontrada: " + instanciaId));
            InspeccionInstancia ii = new InspeccionInstancia();
            ii.setInstanciaTramite(instancia);
            ii.setEstadoInstancia("PENDIENTE");
            inspeccion.addInstancia(ii);
        }
        inspeccion = inspeccionRepository.save(inspeccion);

        java.util.Map<Long, InspeccionInstancia> instanciasPorId = new java.util.LinkedHashMap<>();
        if (inspeccion.getInstancias() != null) {
            for (InspeccionInstancia ii : inspeccion.getInstancias()) {
                if (ii.getInstanciaTramite() == null) continue;
                String placa = ii.getInstanciaTramite().getIdentificador();
                if (placa == null || placa.trim().isEmpty()) continue;
                instanciasPorId.put(ii.getInstanciaTramite().getIdInstancia(), ii);
            }
        }

        FormatoInspeccion formato = fichaInspeccionService.obtenerOCrearFormatoActivo(inspeccion);

        for (java.util.Map.Entry<Long, InspeccionInstancia> entry : instanciasPorId.entrySet()) {
            Long instanciaId = entry.getKey();
            InspeccionInstancia ii = entry.getValue();
            String placa = ii.getInstanciaTramite().getIdentificador();
            Long vehiculoId = vehiculoRepository.findByPlaca(placa).map(Vehiculo::getIdVehiculo).orElse(null);

            java.util.Optional<FichaInspeccion> fichaExistente = fichaInspeccionRepository
                    .findByInstanciaTramiteIdAndInspeccion(inspeccionId, instanciaId);
            if (fichaExistente.isPresent()) {
                FichaInspeccion ficha = fichaExistente.get();
                if (vehiculoId != null && ficha.getVehiculo() == null) {
                    ficha.setVehiculo(vehiculoId);
                }
                ficha.setFormatoInspeccion(formato);
                ficha.setFechaActualizacion(java.time.LocalDateTime.now());
                ficha = fichaInspeccionRepository.save(ficha);
                fichaInspeccionService.sincronizarValoresConFormato(ficha, formato);
            } else {
                FichaInspeccion ficha = new FichaInspeccion();
                ficha.setInspeccion(inspeccionId);
                ficha.setInstanciaTramiteId(instanciaId);
                ficha.setVehiculo(vehiculoId);
                ficha.setEstado(true);
                ficha.setResultado("PENDIENTE");
                ficha.setFechaCreacion(java.time.LocalDateTime.now());
                ficha.setFechaActualizacion(java.time.LocalDateTime.now());
                ficha.setFormatoInspeccion(formato);
                FichaInspeccion guardada = fichaInspeccionRepository.save(ficha);
                fichaInspeccionService.crearValoresCamposParaFicha(guardada, formato);
            }
        }

        return convertirAResponse(inspeccion);
    }

    @Transactional
    public void removerInstancia(Long inspeccionId, Long instanciaId) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
        inspeccion.getInstancias().removeIf(ii -> ii.getId().equals(instanciaId));
        inspeccionRepository.save(inspeccion);
    }

    public List<InspeccionPublicaDTO> listarInspeccionesPublicas(LocalDate desde, LocalDate hasta, String empresaNombre) {
        List<Inspeccion> inspecciones = inspeccionRepository.findAllWithDetails();
        return inspecciones.stream()
                .filter(i -> desde == null || (i.getFechaProgramada() != null && !i.getFechaProgramada().isBefore(desde)))
                .filter(i -> hasta == null || (i.getFechaProgramada() != null && !i.getFechaProgramada().isAfter(hasta)))
                .filter(i -> empresaNombre == null || empresaNombre.trim().isEmpty() ||
                        (i.getEmpresaNombre() != null && i.getEmpresaNombre().toLowerCase().contains(empresaNombre.toLowerCase())))
                .map(this::convertirAPublicaDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private InspeccionPublicaDTO convertirAPublicaDTO(Inspeccion i) {
        InspeccionPublicaDTO dto = new InspeccionPublicaDTO();
        dto.setIdInspeccion(i.getIdInspeccion());
        dto.setCodigo(i.getCodigo());
        dto.setFechaProgramada(i.getFechaProgramada());
        dto.setHora(i.getHora());
        dto.setLugar(i.getLugar());
        dto.setEmpresaNombre(i.getEmpresaNombre() != null ? i.getEmpresaNombre() : "Sin asignar");
        return dto;
    }

    public List<VehiculoDTO> obtenerVehiculosPorInspeccion(Long inspeccionId) {
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId).orElse(null);
        if (inspeccion == null || inspeccion.getInstancias() == null) {
            return List.of();
        }
        return inspeccion.getInstancias().stream()
                .map(ii -> {
                    VehiculoDTO dto = new VehiculoDTO();
                    InstanciaTramite it = ii.getInstanciaTramite();
                    if (it != null) {
                        dto.setIdentificador(it.getIdentificador());
                    }
                    dto.setPlaca(ii.getPlaca());
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public InspeccionResponse crearInspeccionEnBloque(LocalDate fecha, String lugar, CrearInspeccionEnBloqueRequest request) {
        InspeccionConInstanciasCreateRequest req = new InspeccionConInstanciasCreateRequest();
        req.setFechaProgramada(fecha);
        req.setHora(request.getHora());
        req.setLugar(lugar);
        req.setObservacionesGenerales(request.getObservacionesGenerales());
        req.setCodigoGrupo(request.getCodigoGrupo());
        req.setEmpresaId(request.getEmpresaId());
        req.setInstanciasTramiteIds(request.getInstanciasTramiteIds());
        return crearConInstancias(req);
    }

    private String generarCodigoInspeccion() {
        int year = LocalDate.now().getYear();
        int num = (int) (Math.random() * 9000) + 1000;
        return "INS-" + year + "-" + num;
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

    private FichaInspeccionResponseDTO convertirAFichaResponseDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setInspeccionId(ficha.getInspeccion());
        dto.setInstanciaTramiteId(ficha.getInstanciaTramiteId());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());
        return dto;
    }

    private Vehiculo obtenerOcrearVehiculo(String placa) {
        Optional<Vehiculo> existente = vehiculoRepository.findByPlaca(placa);
        if (existente.isPresent()) {
            return existente.get();
        }
        Vehiculo v = new Vehiculo();
        v.setPlaca(placa);
        v.setEstado("DESHABILITADO");
        v.setFechaRegistro(java.time.LocalDateTime.now());
        v.setFechaActualizacion(java.time.LocalDateTime.now());
        return vehiculoRepository.save(v);
    }

    private InspeccionResponse convertirAResponse(Inspeccion inspeccion) {
        InspeccionResponse dto = new InspeccionResponse();
        dto.setIdInspeccion(inspeccion.getIdInspeccion());
        dto.setCodigo(inspeccion.getCodigo());
        dto.setFechaProgramada(inspeccion.getFechaProgramada());
        dto.setHora(inspeccion.getHora());
        dto.setLugar(inspeccion.getLugar());
        dto.setEstado(inspeccion.getEstado());
        dto.setResultadoGeneral(inspeccion.getResultadoGeneral());
        dto.setFechaEjecucion(inspeccion.getFechaEjecucion());
        dto.setFechaCreacion(inspeccion.getFechaCreacion());
        dto.setFechaActualizacion(inspeccion.getFechaActualizacion());
        dto.setObservacionesGenerales(inspeccion.getObservacionesGenerales());
        dto.setCodigoGrupo(inspeccion.getCodigoGrupo());
        dto.setEmpresaId(inspeccion.getEmpresaId());
        dto.setEmpresaNombre(inspeccion.getEmpresaNombre());
        dto.setEmpresaRuc(inspeccion.getEmpresaRuc());
        dto.setEmpresaDireccion(inspeccion.getEmpresa() != null ? inspeccion.getEmpresa().getDireccionLegal() : null);

        if (inspeccion.getEmpresa() != null && inspeccion.getEmpresa().getContactoTelefono() != null) {
            dto.setEmpresaTelefono(inspeccion.getEmpresa().getContactoTelefono());
        }
        if (inspeccion.getTramite() != null && inspeccion.getTramite().getCodigoRut() != null) {
            dto.setCodigoRut(inspeccion.getTramite().getCodigoRut());
        }
        if (inspeccion.getUsuarioInspector() != null) {
            dto.setInspectorId(inspeccion.getUsuarioInspector().getIdUsuarios());
            dto.setInspectorNombre(inspeccion.getUsuarioInspector().getUsername());
        }
        if (inspeccion.getEmpresa() != null && inspeccion.getEmpresa().getGerente() != null) {
            dto.setGerenteNombre(inspeccion.getEmpresa().getGerente().getNombre());
        }
        if (inspeccion.getInstancias() != null) {
            List<InspeccionInstanciaResponse> instancias = inspeccion.getInstancias().stream()
                    .map(this::convertirAInspeccionInstanciaResponse)
                    .collect(java.util.stream.Collectors.toList());
            dto.setInstancias(instancias);
        }
        return dto;
    }

    private InspeccionInstanciaResponse convertirAInspeccionInstanciaResponse(InspeccionInstancia ii) {
        InspeccionInstanciaResponse dto = new InspeccionInstanciaResponse();
        dto.setIdInspeccionInstancia(ii.getId());
        InstanciaTramite it = ii.getInstanciaTramite();
        if (it != null) {
            dto.setIdInstancia(it.getIdInstancia());
            dto.setIdentificador(it.getIdentificador());
            if (it.getTramite() != null) {
                dto.setCodigoRut(it.getTramite().getCodigoRut());
                dto.setTramiteId(it.getTramite().getIdTramite());
            }
        }
        dto.setEstadoInstancia(ii.getEstadoInstancia());
        dto.setPlaca(ii.getPlaca());
        dto.setObservaciones(ii.getObservaciones());
        dto.setFechaInspeccion(ii.getFechaInspeccion());

        if (ii.getInspeccion() != null && it != null) {
            java.util.Optional<FichaInspeccion> fichaOpt = fichaInspeccionRepository.findByInstanciaTramiteIdAndInspeccion(
                    ii.getInspeccion().getIdInspeccion(),
                    it.getIdInstancia()
            );
            if (fichaOpt.isPresent()) {
                FichaInspeccion ficha = fichaOpt.get();
                dto.setFichaId(ficha.getIdFichaInspeccion());
                dto.setFichaResultado(ficha.getResultado());
                dto.setFichaEstado(ficha.getEstado());
            }
        }

        return dto;
    }

    private InspeccionInstanciaResponse convertirInstanciaTramiteAInspeccionInstanciaResponse(InstanciaTramite it) {
        InspeccionInstanciaResponse dto = new InspeccionInstanciaResponse();
        dto.setIdInstancia(it.getIdInstancia());
        dto.setIdentificador(it.getIdentificador());
        if (it.getTramite() != null) {
            dto.setCodigoRut(it.getTramite().getCodigoRut());
            dto.setTramiteId(it.getTramite().getIdTramite());
        }
        dto.setEstadoInstancia("PENDIENTE");
        dto.setPlaca("");
        dto.setObservaciones("");
        dto.setFechaInspeccion(null);
        return dto;
    }

    private ParametroInspeccionResponseDTO toParametroResponseDTO(CampoFormato campo, ValorCampo valor) {
        ParametroInspeccionResponseDTO dto = new ParametroInspeccionResponseDTO();
        dto.setIdParametros(valor.getIdValorCampo());
        dto.setParametro(campo.getNombre());
        dto.setSeccion(campo.getSeccion());
        dto.setObservacion(valor.getValor());
        return dto;
    }
}
