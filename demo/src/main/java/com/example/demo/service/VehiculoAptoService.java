package com.example.demo.service;

import com.example.demo.dto.BloqueRevisarRequestDTO;
import com.example.demo.dto.TerminarInstanciaRequestDTO;
import com.example.demo.dto.VehiculoAptoProgresoDTO;
import com.example.demo.dto.VehiculoAptoResponseDTO;
import com.example.demo.dto.VehiculoResponseDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VehiculoAptoService {

    private final VehiculoAptoRepository vehiculoAptoRepository;
    private final TramiteRepository tramiteRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UsersRepository usersRepository;

    public VehiculoAptoService(VehiculoAptoRepository vehiculoAptoRepository,
                               TramiteRepository tramiteRepository,
                               VehiculoRepository vehiculoRepository,
                               UsersRepository usersRepository) {
        this.vehiculoAptoRepository = vehiculoAptoRepository;
        this.tramiteRepository = tramiteRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.usersRepository = usersRepository;
    }

    /**
     * Inicia revisión documental para un bloque de vehículos
     * Crea una nueva instancia por vehículo (o incrementa contador si ya existía)
     */
    @Transactional
    public void iniciarRevisionDocumental(Long tramiteId, List<Long> vehiculosIds, Long usuarioId) {
        Tramite tramite = tramiteRepository.findById(tramiteId)
                .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado: " + tramiteId));

        Users usuario = usersRepository.findById(usuarioId).orElse(null);

        for (Long vehiculoId : vehiculosIds) {
            Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                    .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado: " + vehiculoId));

            // Validar que el vehículo pertenezca a la empresa del trámite
            if (vehiculo.getEmpresa() != null && tramite.getEmpresa() != null &&
                !vehiculo.getEmpresa().getIdEmpresa().equals(tramite.getEmpresa().getIdEmpresa())) {
                throw new IllegalArgumentException("Vehículo " + vehiculo.getPlaca() +
                        " no pertenece a la empresa del trámite");
            }

            // Verificar si ya existe una instancia EN_REVISION para este vehículo en este trámite
            Optional<VehiculoApto> existente = vehiculoAptoRepository
                    .findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(tramiteId, vehiculoId);

            VehiculoApto apto;
            Integer nuevaInstancia;

            if (existente.isPresent()) {
                VehiculoApto anterior = existente.get();
                if (anterior.getEstadoInstancia() == EstadoInstancia.EN_REVISION) {
                    // Finalizar instancia anterior
                    anterior.setEstadoInstancia(EstadoInstancia.FINALIZADA);
                    anterior.setFechaInstanciaFin(LocalDateTime.now());
                    vehiculoAptoRepository.save(anterior);
                }
                // Nueva instancia
                nuevaInstancia = (anterior.getNumeroInstancia() != null ? anterior.getNumeroInstancia() : 0) + 1;
                apto = new VehiculoApto();
                apto.setTramite(tramite);
                apto.setVehiculo(vehiculo);
                apto.setUsuarioAprobador(usuario);
                apto.setNumeroInstancia(nuevaInstancia);
            } else {
                // Primera instancia
                nuevaInstancia = 1;
                apto = new VehiculoApto();
                apto.setTramite(tramite);
                apto.setVehiculo(vehiculo);
                apto.setUsuarioAprobador(usuario);
                apto.setNumeroInstancia(1);
            }

            apto.setEstadoDocumental(EstadoDocumental.PENDIENTE);
            apto.setFechaInstanciaInicio(LocalDateTime.now());
            apto.setEstadoInstancia(EstadoInstancia.EN_REVISION);
            apto.setFechaCreacion(LocalDateTime.now());
            apto.setActivo(true);

            vehiculoAptoRepository.save(apto);
        }
    }

    /**
     * Termina una instancia de revisión (aprobar o rechazar un vehículo)
     */
    @Transactional
    public VehiculoAptoResponseDTO terminarInstancia(TerminarInstanciaRequestDTO request, Long usuarioId) {
        VehiculoApto apto = vehiculoAptoRepository.findById(request.getVehiculoAptoId())
                .orElseThrow(() -> new IllegalArgumentException("Registro no encontrado"));

        // Validar que la instancia esté EN_REVISION
        if (apto.getEstadoInstancia() != EstadoInstancia.EN_REVISION) {
            throw new IllegalStateException("Esta instancia ya fue finalizada. Instancia actual: " + apto.getNumeroInstancia());
        }

        Users usuario = usersRepository.findById(usuarioId).orElse(null);

        if (request.getAprobar()) {
            apto.setEstadoDocumental(EstadoDocumental.APTO);
            apto.setFechaAprobacion(LocalDateTime.now());
            apto.setUsuarioAprobador(usuario);
        } else {
            apto.setEstadoDocumental(EstadoDocumental.NO_APTO);
            apto.setMotivoRechazo(request.getMotivoRechazo());
            apto.setFechaRechazo(LocalDateTime.now());
        }

        apto.setObservaciones(request.getObservaciones());
        apto.setEstadoInstancia(EstadoInstancia.FINALIZADA);
        apto.setFechaInstanciaFin(LocalDateTime.now());
        apto.setFechaActualizacion(LocalDateTime.now());

        VehiculoApto saved = vehiculoAptoRepository.save(apto);

        // Actualizar estado del trámite
        actualizarEstadoTramite(apto.getTramite().getIdTramite());

        return convertirAResponseDTO(saved);
    }

    /**
     * Revisa un bloque de vehículos (aprobar o rechazar en lote)
     */
    @Transactional
    public List<VehiculoAptoResponseDTO> revisarEnBloque(BloqueRevisarRequestDTO request, Long usuarioId) {
        Tramite tramite = tramiteRepository.findById(request.getTramiteId())
                .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado"));

        Users usuario = usersRepository.findById(usuarioId).orElse(null);
        EstadoDocumental nuevoEstado = request.getAprobarTodos() ? EstadoDocumental.APTO : EstadoDocumental.NO_APTO;

        List<VehiculoApto> resultados = request.getVehiculosIds().stream()
                .map(vehiculoId -> {
                    VehiculoApto apto = vehiculoAptoRepository
                            .findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(request.getTramiteId(), vehiculoId)
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Vehículo " + vehiculoId + " no está asociado al trámite"));

                    // Validar que esté EN_REVISION
                    if (apto.getEstadoInstancia() != EstadoInstancia.EN_REVISION) {
                        throw new IllegalStateException("Vehículo placa " + apto.getVehiculo().getPlaca() +
                                " ya fue revisado en instancia " + apto.getNumeroInstancia());
                    }

                    // Finalizar instancia actual
                    apto.setEstadoDocumental(nuevoEstado);
                    apto.setEstadoInstancia(EstadoInstancia.FINALIZADA);
                    apto.setFechaInstanciaFin(LocalDateTime.now());
                    apto.setFechaActualizacion(LocalDateTime.now());

                    if (nuevoEstado == EstadoDocumental.APTO) {
                        apto.setFechaAprobacion(LocalDateTime.now());
                        apto.setUsuarioAprobador(usuario);
                    } else {
                        apto.setMotivoRechazo(request.getMotivoRechazoGlobal());
                        apto.setFechaRechazo(LocalDateTime.now());
                    }

                    if (request.getObservacionesGlobales() != null) {
                        apto.setObservaciones(request.getObservacionesGlobales());
                    }

                    return vehiculoAptoRepository.save(apto);
                })
                .collect(Collectors.toList());

        // Actualizar estado del trámite
        actualizarEstadoTramite(tramite.getIdTramite());

        return resultados.stream()
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todas las instancias de revisión de un trámite (dashboard)
     */
    public List<VehiculoAptoResponseDTO> obtenerPorTramite(Long tramiteId) {
        List<VehiculoApto> aptos = vehiculoAptoRepository
                .findByTramiteIdOrderByNumeroInstanciaAscFechaCreacionDesc(tramiteId);
        return aptos.stream()
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene progreso de revisión de un trámite
     */
    public VehiculoAptoProgresoDTO obtenerProgreso(Long tramiteId) {
        Tramite tramite = tramiteRepository.findById(tramiteId)
                .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado"));

        Long total = vehiculoAptoRepository.countByTramiteId(tramiteId);
        Long aptos = vehiculoAptoRepository.countByTramiteIdAndEstadoDocumental(tramiteId, EstadoDocumental.APTO);
        Long noAptos = vehiculoAptoRepository.countByTramiteIdAndEstadoDocumental(tramiteId, EstadoDocumental.NO_APTO);
        Long observados = vehiculoAptoRepository.countByTramiteIdAndEstadoDocumental(tramiteId, EstadoDocumental.OBSERVADO);
        Long pendientes = total - aptos - noAptos - observados;

        double porcentaje = total > 0 ? (double) aptos / total * 100 : 0;
        boolean todosAprobados = total > 0 && total.equals(aptos);

        // Determinar estado general del trámite basado en vehículos
        EstadoDocumental estadoGeneral;
        if (todosAprobados) {
            estadoGeneral = EstadoDocumental.APTO;
        } else if (observados > 0) {
            estadoGeneral = EstadoDocumental.OBSERVADO;
        } else if (noAptos > 0) {
            estadoGeneral = EstadoDocumental.NO_APTO;
        } else {
            estadoGeneral = EstadoDocumental.PENDIENTE;
        }

        VehiculoAptoProgresoDTO progreso = new VehiculoAptoProgresoDTO();
        progreso.setTramiteId(tramiteId);
        progreso.setTramiteCodigo(tramite.getCodigoRut());
        progreso.setTotalVehiculos(total);
        progreso.setVehiculosAptos(aptos);
        progreso.setVehiculosObservados(observados);
        progreso.setVehiculosNoAptos(noAptos);
        progreso.setVehiculosPendientes(pendientes);
        progreso.setPorcentajeAprobacion(porcentaje);
        progreso.setTodosAprobados(todosAprobados);
        progreso.setEstadoGeneralTramite(estadoGeneral);
        progreso.setUltimaActualizacion(LocalDateTime.now());

        return progreso;
    }

    /**
     * Obtiene vehículos APTOS disponibles para inspección (no inspeccionados aún)
     */
    public List<VehiculoAptoResponseDTO> obtenerAptosParaInspeccion(Long tramiteId) {
        List<VehiculoApto> aptos = vehiculoAptoRepository
                .findByTramiteIdAndEstadoDocumental(tramiteId, EstadoDocumental.APTO);

        return aptos.stream()
                .filter(va -> va.getFichaInspeccion() == null) // Solo los que no tienen ficha
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todas las instancias de un vehículo en un trámite (historial)
     */
    public List<VehiculoAptoResponseDTO> obtenerHistorialVehiculo(Long tramiteId, Long vehiculoId) {
        return vehiculoAptoRepository
                .findByVehiculoIdOrderByInstanciaDesc(vehiculoId)
                .stream()
                .filter(va -> va.getTramite().getIdTramite().equals(tramiteId))
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Marca un trámite como completado (cierra todas las instancias pendientes como APTO
     * y fuerza el estado del trámite a APROBADO, permitiendo continuar con la inspección
     * incluso si algunos vehículos previamente fueron rechazados).
     */
    @Transactional
    public void completarTramite(Long tramiteId) {
        // Cerrar todas las instancias pendientes (EN_REVISION con estado PENDIENTE)
        List<VehiculoApto> pendientes = vehiculoAptoRepository
                .findByTramiteIdAndEstadoDocumental(tramiteId, EstadoDocumental.PENDIENTE);
        LocalDateTime ahora = LocalDateTime.now();

        for (VehiculoApto apto : pendientes) {
            if (apto.getEstadoInstancia() == EstadoInstancia.EN_REVISION) {
                apto.setEstadoDocumental(EstadoDocumental.APTO);
                apto.setFechaAprobacion(ahora);
                apto.setEstadoInstancia(EstadoInstancia.FINALIZADA);
                apto.setFechaInstanciaFin(ahora);
                apto.setFechaActualizacion(ahora);
                vehiculoAptoRepository.save(apto);
            }
        }

        // Forzar estado APROBADO del trámite, independientemente de los resultados previos
        Tramite tramite = tramiteRepository.findById(tramiteId).orElseThrow();
        tramite.setEstado("APROBADO");
        if (tramite.getFechaFinalizacion() == null) {
            tramite.setFechaFinalizacion(ahora);
        }
        tramiteRepository.save(tramite);
    }

    /**
     * Actualiza el estado del trámite basado en el estado de sus vehículos
     */
    @Transactional
    public void actualizarEstadoTramite(Long tramiteId) {
        VehiculoAptoProgresoDTO progreso = obtenerProgreso(tramiteId);
        Tramite tramite = tramiteRepository.findById(tramiteId).orElseThrow();

        String nuevoEstado;
        if (progreso.getTodosAprobados()) {
            nuevoEstado = "APROBADO";
        } else if (progreso.getVehiculosAptos() > 0 || progreso.getVehiculosNoAptos() > 0) {
            // Al menos un vehículo revisado pero no todos aprobados
            nuevoEstado = "EN_REVISION"; // Podría ser "OBSERVADO"
        } else {
            nuevoEstado = "REGISTRADO"; // Sin revisiones aún
        }

        tramite.setEstado(nuevoEstado);
        if ("APROBADO".equals(nuevoEstado) && tramite.getFechaFinalizacion() == null) {
            tramite.setFechaFinalizacion(LocalDateTime.now());
        }
        tramiteRepository.save(tramite);
    }

    /**
     * Convierte entidad a DTO de respuesta
     */
    private VehiculoAptoResponseDTO convertirAResponseDTO(VehiculoApto apto) {
        VehiculoAptoResponseDTO dto = new VehiculoAptoResponseDTO();
        dto.setIdVehiculoApto(apto.getIdVehiculoApto());

        // Vehículo como DTO
        if (apto.getVehiculo() != null) {
            VehiculoResponseDTO vehiculoDTO = new VehiculoResponseDTO();
            vehiculoDTO.setIdVehiculo(apto.getVehiculo().getIdVehiculo());
            vehiculoDTO.setPlaca(apto.getVehiculo().getPlaca());
            vehiculoDTO.setMarca(apto.getVehiculo().getMarca());
            vehiculoDTO.setModelo(apto.getVehiculo().getModelo());
            if (apto.getVehiculo().getEmpresa() != null) {
                vehiculoDTO.setEmpresaNombre(apto.getVehiculo().getEmpresa().getNombre());
            }
            dto.setVehiculo(vehiculoDTO);
        }

        dto.setTramiteId(apto.getTramite() != null ? apto.getTramite().getIdTramite() : null);
        dto.setTramiteCodigo(apto.getTramite() != null ? apto.getTramite().getCodigoRut() : null);
        dto.setEstadoDocumental(apto.getEstadoDocumental());
        dto.setMotivoRechazo(apto.getMotivoRechazo());
        dto.setObservaciones(apto.getObservaciones());
        dto.setFechaAprobacion(apto.getFechaAprobacion());
        dto.setFechaRechazo(apto.getFechaRechazo());
        dto.setEstadoInstancia(apto.getEstadoInstancia());
        dto.setNumeroInstancia(apto.getNumeroInstancia());
        dto.setFechaInstanciaInicio(apto.getFechaInstanciaInicio());
        dto.setFechaInstanciaFin(apto.getFechaInstanciaFin());
        dto.setFechaCreacion(apto.getFechaCreacion());
        dto.setFechaActualizacion(apto.getFechaActualizacion());

        // Usuario aprobador (campos planos)
        if (apto.getUsuarioAprobador() != null) {
            dto.setUsuarioAprobadorId(apto.getUsuarioAprobador().getIdUsuarios());
            dto.setUsuarioAprobadorNombre(apto.getUsuarioAprobador().getUsername());
        }

        return dto;
    }
}
