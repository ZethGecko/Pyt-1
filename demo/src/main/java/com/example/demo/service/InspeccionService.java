package com.example.demo.service;

import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.InspeccionCreateRequestDTO;
import com.example.demo.dto.ParametroInspeccionDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
import com.example.demo.model.EstadoDocumental;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.Inspeccion;
import com.example.demo.model.ParametrosInspeccion;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.model.Vehiculo;
import com.example.demo.model.VehiculoApto;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.ParametrosInspeccionRepository;
import com.example.demo.repository.RequisitoTUPACRepository;
import com.example.demo.repository.TramiteRepository;
import com.example.demo.repository.UsersRepository;
import com.example.demo.repository.VehiculoAptoRepository;
import com.example.demo.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    public InspeccionService(InspeccionRepository inspeccionRepository,
                            TramiteRepository tramiteRepository,
                            VehiculoRepository vehiculoRepository,
                            FichaInspeccionRepository fichaInspeccionRepository,
                            ParametrosInspeccionRepository parametrosInspeccionRepository,
                            RequisitoTUPACRepository requisitoTUPACRepository,
                            UsersRepository usersRepository,
                            VehiculoAptoRepository vehiculoAptoRepository) {
        this.inspeccionRepository = inspeccionRepository;
        this.tramiteRepository = tramiteRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.fichaInspeccionRepository = fichaInspeccionRepository;
        this.parametrosInspeccionRepository = parametrosInspeccionRepository;
        this.requisitoTUPACRepository = requisitoTUPACRepository;
        this.usersRepository = usersRepository;
        this.vehiculoAptoRepository = vehiculoAptoRepository;
    }

    public List<Inspeccion> listarTodas() {
        return inspeccionRepository.findAll();
    }

    public Inspeccion guardar(Inspeccion inspeccion) {
        return inspeccionRepository.save(inspeccion);
    }

    public Inspeccion buscarPorId(Long id) {
        return inspeccionRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        inspeccionRepository.deleteById(id);
    }

    @Transactional
    public Inspeccion crearDesdeTramiteAprobado(InspeccionCreateRequestDTO request) {
        if (request.getUsuarioInspectorId() == null) {
            throw new IllegalArgumentException("usuarioInspectorId es obligatorio");
        }

        Tramite tramite = tramiteRepository.findById(request.getTramiteId())
                .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado"));

        // Validar que trámite esté completamente aprobado (todos los vehículos APTO)
        if (!"APROBADO".equals(tramite.getEstado())) {
            throw new IllegalStateException("El trámite debe estar completamente aprobado para iniciar una inspección");
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

        Users inspector = usersRepository.findById(request.getUsuarioInspectorId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario inspector no encontrado"));

        Inspeccion inspeccion = new Inspeccion();
        inspeccion.setCodigo(generarCodigoInspeccion());
        inspeccion.setFechaProgramada(request.getFechaProgramada());
        inspeccion.setHora(request.getHora());
        inspeccion.setLugar(request.getLugar());
        inspeccion.setEstado("PROGRAMADA");
        inspeccion.setEmpresa(tramite.getEmpresa());
        inspeccion.setExpediente(tramite.getExpediente());
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

    private List<Long> parseRequisitosIds(String requisitosIdsStr) {
        if (requisitosIdsStr == null || requisitosIdsStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return java.util.Arrays.stream(requisitosIdsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
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
                if (tram.getExpediente() != null) {
                    dto.setExpediente(tram.getExpediente().getCodigo());
                }
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
}
