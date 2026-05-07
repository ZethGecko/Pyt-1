package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.FichaInspeccionUpdateRequestDTO;
import com.example.demo.dto.ParametroInspeccionDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.ParametrosInspeccion;
import com.example.demo.model.Tramite;
import com.example.demo.model.Vehiculo;
import com.example.demo.model.VehiculoApto;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.ParametrosInspeccionRepository;
import com.example.demo.repository.VehiculoRepository;

import jakarta.transaction.Transactional;

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
      * Lista las fichas asociadas a una inspección específica, incluyendo parámetros.
      */
     public List<FichaInspeccionResponseDTO> listarPorInspeccion(Long inspeccionId) {
         System.out.println("[FichaInspeccionService] Buscando fichas para inspeccionId: " + inspeccionId);
         List<FichaInspeccion> fichas = fichaInspeccionRepository.findByInspeccion(inspeccionId);
         System.out.println("[FichaInspeccionService] Fichas encontradas: " + fichas.size());
         
         List<FichaInspeccionResponseDTO> dtos = fichas.stream()
                 .map(this::convertToDetailDTO)
                 .collect(Collectors.toList());
         System.out.println("[FichaInspeccionService] DTOs generados: " + dtos.size());
         return dtos;
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
         System.out.println("[convertToDetailDTO] Procesando ficha ID: " + ficha.getIdFichaInspeccion());
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
         System.out.println("[convertToDetailDTO] Parámetros en ficha (directo): " + (parametros != null ? parametros.size() : "null"));
         if (parametros == null) {
             parametros = parametrosInspeccionRepository
                 .findByFichaInspeccion_IdFichaInspeccion(ficha.getIdFichaInspeccion());
             System.out.println("[convertToDetailDTO] Parámetros obtenidos desde repo: " + parametros.size());
         }
         if (parametros != null) {
             dto.setParametros(parametros.stream()
                     .map(this::convertirAParametroResponseDTO)
                     .collect(Collectors.toList()));
             System.out.println("[convertToDetailDTO] Parámetros en DTO: " + dto.getParametros().size());
         }

          return dto;
      }

       /**
        * Actualiza una ficha de inspección existente (incluyendo parámetros).
        */
       @Transactional
       public FichaInspeccionResponseDTO actualizar(Long id, FichaInspeccionUpdateRequestDTO request) {
           FichaInspeccion ficha = fichaInspeccionRepository.findById(id)
                   .orElse(null);
           if (ficha == null) {
               return null;
           }

           if (request.getUsuarioInspectorId() != null) {
               ficha.setUsuarioInspector(request.getUsuarioInspectorId());
           }
           if (request.getEstado() != null) {
               ficha.setEstado(request.getEstado());
           }
           if (request.getResultado() != null) {
               ficha.setResultado(request.getResultado());
           }
           if (request.getObservaciones() != null) {
               ficha.setObservaciones(request.getObservaciones());
           }
           ficha.setFechaActualizacion(LocalDateTime.now());

           // Actualizar parámetros si se envían
           if (request.getParametros() != null) {
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

           FichaInspeccion saved = fichaInspeccionRepository.save(ficha);
           return convertToDetailDTO(saved);
       }

       /**
        * Lista las fichas aprobadas para una empresa (vehículos habilitados).
        * Solo devuelve fichas con estado=true y resultado='APROBADO'.
        */
       public List<FichaInspeccionResponseDTO> listarAprobadasPorEmpresa(Long empresaId) {
           List<FichaInspeccion> fichas = fichaInspeccionRepository.findApprovedByEmpresa(empresaId);
           return fichas.stream()
                   .map(this::convertToDetailDTO)
                   .collect(Collectors.toList());
       }

       /**
        * Obtiene la ficha aprobada más reciente para un vehículo.
        * Útil para emitir TUC directamente desde vehículo.
        */
       public FichaInspeccionResponseDTO obtenerAprobadaPorVehiculo(Long vehiculoId) {
           List<FichaInspeccion> fichas = fichaInspeccionRepository.findApprovedByVehiculoOrderByFechaCreacionDesc(vehiculoId);
           if (fichas.isEmpty()) {
               return null;
           }
           return convertToDetailDTO(fichas.get(0));
       }
   }
