package com.example.demo.service;

import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.ParametrosInspeccion;
import com.example.demo.model.Tramite;
import com.example.demo.model.Vehiculo;
import com.example.demo.model.VehiculoApto;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.ParametrosInspeccionRepository;
import com.example.demo.repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FichaInspeccionService {

    private final FichaInspeccionRepository fichaInspeccionRepository;
    private final VehiculoRepository vehiculoRepository;
    private final ParametrosInspeccionRepository parametrosInspeccionRepository;

    public FichaInspeccionService(FichaInspeccionRepository fichaInspeccionRepository,
                                  VehiculoRepository vehiculoRepository,
                                  ParametrosInspeccionRepository parametrosInspeccionRepository) {
        this.fichaInspeccionRepository = fichaInspeccionRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.parametrosInspeccionRepository = parametrosInspeccionRepository;
    }

    /**
     * Lista todas las fichas (sin enriquecimiento de vehículo por performance)
     */
    public List<FichaInspeccionResponseDTO> listarTodas() {
        return fichaInspeccionRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista las fichas de inspección asociadas a un trámite (a través de VehiculoApto).
     * Incluye datos completos: vehículo, parámetros, trámite, expediente.
     */
    public List<FichaInspeccionResponseDTO> listarPorTramite(Long tramiteId) {
        return fichaInspeccionRepository.findByVehiculoApto_Tramite_IdTramite(tramiteId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    /**
     * Guarda una ficha desde request DTO (creación directa)
     */
    public FichaInspeccionResponseDTO guardar(FichaInspeccionCreateRequestDTO request) {
        FichaInspeccion ficha = new FichaInspeccion();
        ficha.setVehiculo(request.getVehiculoId());
        ficha.setUsuarioInspector(request.getUsuarioInspectorId());
        ficha.setEstado(request.getEstado() != null ? request.getEstado() : true);
        ficha.setResultado(request.getResultado() != null ? request.getResultado() : "PENDIENTE");
        ficha.setObservaciones(request.getObservaciones());
        ficha.setFechaCreacion(LocalDateTime.now());
        ficha.setFechaActualizacion(LocalDateTime.now());
        FichaInspeccion saved = fichaInspeccionRepository.save(ficha);
        return convertToResponseDTO(saved);
    }

    /**
     * Busca ficha por ID con asociaciones cargadas
     */
    public FichaInspeccionResponseDTO buscarPorId(Long id) {
        return fichaInspeccionRepository.findByIdWithAssociations(id)
                .map(this::convertToDetailDTO)
                .orElse(null);
    }

    /**
     * Elimina una ficha
     */
    public void eliminar(Long id) {
        fichaInspeccionRepository.deleteById(id);
    }

    /**
     * Convierte entidad FichaInspeccion a DTO de respuesta (rápido)
     */
    private FichaInspeccionResponseDTO convertToResponseDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());

        // VehiculoApto (trazabilidad de revisión documental)
        if (ficha.getVehiculoApto() != null) {
            dto.setVehiculoAptoId(ficha.getVehiculoApto().getIdVehiculoApto());
        }

        // Datos del vehículo: intentar obtener desde la entidad ya cargada
        Vehiculo vehiculo = ficha.getVehiculoEntity();
        if (vehiculo != null) {
            dto.setVehiculoPlaca(vehiculo.getPlaca());
            dto.setVehiculoMarca(vehiculo.getMarca());
            dto.setVehiculoModelo(vehiculo.getModelo());
        } else {
            // Fallback: hacer consulta separada si no está cargado
            vehiculo = vehiculoRepository.findById(ficha.getVehiculo()).orElse(null);
            if (vehiculo != null) {
                dto.setVehiculoPlaca(vehiculo.getPlaca());
                dto.setVehiculoMarca(vehiculo.getMarca());
                dto.setVehiculoModelo(vehiculo.getModelo());
            }
        }

        return dto;
    }

    private ParametroInspeccionResponseDTO convertirAParametroResponseDTO(ParametrosInspeccion param) {
        ParametroInspeccionResponseDTO dto = new ParametroInspeccionResponseDTO();
        dto.setIdParametros(param.getIdParametros());
        dto.setParametro(param.getParametro());
        dto.setObservacion(param.getObservacion());
        return dto;
    }

    /**
     * Conversión detallada para vistas de formulario (incluye parámetros y datos del trámite)
     */
    private FichaInspeccionResponseDTO convertToDetailDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());

        // VehiculoApto y datos del trámite
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

        // Vehículo
        Vehiculo vehiculo = ficha.getVehiculoEntity();
        if (vehiculo != null) {
            dto.setVehiculoPlaca(vehiculo.getPlaca());
            dto.setVehiculoMarca(vehiculo.getMarca());
            dto.setVehiculoModelo(vehiculo.getModelo());
        } else {
            vehiculo = vehiculoRepository.findById(ficha.getVehiculo()).orElse(null);
            if (vehiculo != null) {
                dto.setVehiculoPlaca(vehiculo.getPlaca());
                dto.setVehiculoMarca(vehiculo.getMarca());
                dto.setVehiculoModelo(vehiculo.getModelo());
            }
        }

        // Parámetros: si no vienen cargados, obtener desde repo
        List<ParametrosInspeccion> parametros = ficha.getParametros();
        if (parametros == null) {
            parametros = parametrosInspeccionRepository
                .findByFichaInspeccion_IdFichaInspeccion(ficha.getIdFichaInspeccion());
        }
        if (parametros != null) {
            dto.setParametros(parametros.stream()
                    .map(this::convertirAParametroResponseDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
