package com.example.demo.service;

import com.example.demo.dto.CampoFormatoDTO;
import com.example.demo.dto.FormatoInspeccionCreateRequestDTO;
import com.example.demo.dto.FormatoInspeccionResponseDTO;
import com.example.demo.model.CampoFormato;
import com.example.demo.model.FormatoInspeccion;
import com.example.demo.model.Inspeccion;
import com.example.demo.repository.CampoFormatoRepository;
import com.example.demo.repository.FormatoInspeccionRepository;
import com.example.demo.repository.InspeccionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FormatoInspeccionService {

    private final FormatoInspeccionRepository formatoRepository;
    private final CampoFormatoRepository campoRepository;
    private final InspeccionRepository inspeccionRepository;

    public FormatoInspeccionService(FormatoInspeccionRepository formatoRepository,
                                     CampoFormatoRepository campoRepository,
                                     InspeccionRepository inspeccionRepository) {
        this.formatoRepository = formatoRepository;
        this.campoRepository = campoRepository;
        this.inspeccionRepository = inspeccionRepository;
    }

    @Transactional
    public FormatoInspeccionResponseDTO crearFormato(FormatoInspeccionCreateRequestDTO request) {
        FormatoInspeccion formato = new FormatoInspeccion();
        formato.setNombre(request.getNombre());
        formato.setDescripcion(request.getDescripcion());
        formato.setTituloPrincipal(request.getTituloPrincipal());
        formato.setTituloFontSize(request.getTituloFontSize());
        formato.setSubtituloPrincipal(request.getSubtituloPrincipal());
        formato.setSubtituloFontSize(request.getSubtituloFontSize());
        formato.setSubtitulo2(request.getSubtitulo2());
        formato.setSubtitulo3(request.getSubtitulo3());
        formato.setSubtitulo4(request.getSubtitulo4());
        formato.setTituloSeccionDatosGenerales(request.getTituloSeccionDatosGenerales());
        formato.setTituloSeccionPlaca(request.getTituloSeccionPlaca());
        formato.setTituloSeccionPlanLunca(request.getTituloSeccionPlanLunca());
        formato.setTituloSeccionLaboratorio(request.getTituloSeccionLaboratorio());
        formato.setActivo(true);

        FormatoInspeccion guardado = formatoRepository.save(formato);
        formatoRepository.flush();

        // Asociar a inspección solo si existe y el ID es válido
        if (request.getInspeccionId() != null && request.getInspeccionId() > 0) {
            inspeccionRepository.findById(request.getInspeccionId()).ifPresent(inspeccion -> {
                inspeccion.setFormatoInspeccion(guardado);
                inspeccionRepository.save(inspeccion);
            });
            inspeccionRepository.flush();
        }

        if (request.getCampos() != null) {
            if (guardado.getCampos() == null) {
                guardado.setCampos(new ArrayList<>());
            }
            for (CampoFormatoDTO campoDTO : request.getCampos()) {
                CampoFormato campo = new CampoFormato();
                campo.setNombre(campoDTO.getNombre());
                campo.setSeccion(campoDTO.getSeccion() != null ? campoDTO.getSeccion() : "LABORATORIO");
                campo.setOrden(campoDTO.getOrden() != null ? campoDTO.getOrden() : 0);
                campo.setTipoEvaluacion(campoDTO.getTipoEvaluacion() != null ? campoDTO.getTipoEvaluacion() : "TEXTO");
                campo.setObligatorio(campoDTO.getObligatorio() != null ? campoDTO.getObligatorio() : false);
                campo.setFormatoInspeccion(guardado);
                guardado.getCampos().add(campo);
            }
            campoRepository.flush();
        }

        return convertirAResponseDTO(guardado);
    }

    @Transactional
    public FormatoInspeccionResponseDTO actualizarFormato(Long id, FormatoInspeccionCreateRequestDTO request) {
        FormatoInspeccion formato = formatoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formato no encontrado"));

        formato.setNombre(request.getNombre());
        formato.setDescripcion(request.getDescripcion());
        formato.setTituloPrincipal(request.getTituloPrincipal());
        formato.setTituloFontSize(request.getTituloFontSize());
        formato.setSubtituloPrincipal(request.getSubtituloPrincipal());
        formato.setSubtituloFontSize(request.getSubtituloFontSize());
        formato.setSubtitulo2(request.getSubtitulo2());
        formato.setSubtitulo3(request.getSubtitulo3());
        formato.setSubtitulo4(request.getSubtitulo4());
        formato.setTituloSeccionDatosGenerales(request.getTituloSeccionDatosGenerales());
        formato.setTituloSeccionPlaca(request.getTituloSeccionPlaca());
        formato.setTituloSeccionPlanLunca(request.getTituloSeccionPlanLunca());
        formato.setTituloSeccionLaboratorio(request.getTituloSeccionLaboratorio());

        sincronizarCampos(formato, request.getCampos());

        // Asociar a inspección solo si se proporciona un ID válido
        if (request.getInspeccionId() != null && request.getInspeccionId() > 0) {
            inspeccionRepository.findById(request.getInspeccionId()).ifPresent(inspeccion -> {
                inspeccion.setFormatoInspeccion(formato);
                inspeccionRepository.save(inspeccion);
            });
        }

        FormatoInspeccion guardado = formatoRepository.save(formato);
        return convertirAResponseDTO(guardado);
    }

    private void sincronizarCampos(FormatoInspeccion formato, List<CampoFormatoDTO> camposNuevos) {
        List<CampoFormato> existentes = formato.getCampos();
        if (existentes == null) {
            existentes = new ArrayList<>();
            formato.setCampos(existentes);
        }

        Map<Long, CampoFormato> mapaExistentes = existentes.stream()
                .filter(c -> c.getIdCampoFormato() != null)
                .collect(Collectors.toMap(CampoFormato::getIdCampoFormato, c -> c));

        Set<Long> idsEnRequest = new HashSet<>();
        if (camposNuevos != null) {
            for (CampoFormatoDTO dto : camposNuevos) {
                if (dto.getId() != null) {
                    idsEnRequest.add(dto.getId());
                }
            }
        }

        existentes.removeIf(c -> {
            Long idCampo = c.getIdCampoFormato();
            return idCampo != null && !idsEnRequest.contains(idCampo);
        });

        int ordenSecuencial = existentes.size();
        if (camposNuevos != null) {
            for (CampoFormatoDTO dto : camposNuevos) {
                if (dto.getId() != null) {
                    CampoFormato campo = mapaExistentes.get(dto.getId());
                    if (campo != null) {
                        campo.setNombre(dto.getNombre());
                        if (dto.getSeccion() != null) {
                            campo.setSeccion(dto.getSeccion());
                        }
                        if (dto.getTipoEvaluacion() != null) {
                            campo.setTipoEvaluacion(dto.getTipoEvaluacion());
                        }
                        if (dto.getObligatorio() != null) {
                            campo.setObligatorio(dto.getObligatorio());
                        }
                        if (dto.getOrden() != null) {
                            campo.setOrden(dto.getOrden());
                        }
                    }
                } else {
                    CampoFormato campo = new CampoFormato();
                    campo.setNombre(dto.getNombre());
                    campo.setSeccion(dto.getSeccion() != null ? dto.getSeccion() : "LABORATORIO");
                    campo.setOrden(dto.getOrden() != null ? dto.getOrden() : ordenSecuencial++);
                    campo.setTipoEvaluacion(dto.getTipoEvaluacion() != null ? dto.getTipoEvaluacion() : "TEXTO");
                    campo.setObligatorio(dto.getObligatorio() != null ? dto.getObligatorio() : false);
                    campo.setFormatoInspeccion(formato);
                    existentes.add(campo);
                }
            }
        }

        existentes.sort(Comparator.comparingInt(CampoFormato::getOrden));
    }

    public FormatoInspeccionResponseDTO obtenerFormato(Long id) {
        FormatoInspeccion formato = formatoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formato no encontrado"));
        return convertirAResponseDTO(formato);
    }

    @Transactional
    public FormatoInspeccionResponseDTO obtenerPorInspeccion(Long inspeccionId) {
        Inspeccion inspeccion = inspeccionRepository.findById(inspeccionId)
                .orElseThrow(() -> new RuntimeException("Inspección no encontrada"));
        FormatoInspeccion formato = inspeccion.getFormatoInspeccion();
        if (formato == null) {
            throw new RuntimeException("Formato no encontrado para la inspección");
        }
        return convertirAResponseDTO(formato);
    }

    public List<FormatoInspeccionResponseDTO> listarFormatos() {
        return formatoRepository.findAll().stream()
                .map(this::convertirASimpleDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el formato principal (el más reciente sin asociar a inspección específica)
     * Se usa para edición global cuando no hay inspección seleccionada
     * Si no hay formatos, retorna null
     */
    @Transactional
    public FormatoInspeccionResponseDTO obtenerFormatoGlobal() {
        List<FormatoInspeccion> formatos = formatoRepository.findAll();
        if (formatos.isEmpty()) {
            return null;
        }
        // Buscar el formato no asociado (sin inspecciones)
        for (FormatoInspeccion f : formatos) {
            if (f.getInspecciones() == null || f.getInspecciones().isEmpty()) {
                return convertirAResponseDTO(f);
            }
        }
        // Si todos están asociados, devolver el más reciente
        FormatoInspeccion ultimo = formatos.stream()
                .max((a, b) -> {
                    LocalDateTime da = a.getFechaActualizacion() != null ? a.getFechaActualizacion() : a.getFechaCreacion();
                    LocalDateTime db = b.getFechaActualizacion() != null ? b.getFechaActualizacion() : b.getFechaCreacion();
                    return da.compareTo(db);
                })
                .orElse(formatos.get(0));
        return convertirAResponseDTO(ultimo);
    }

    @Transactional
    public void eliminarFormato(Long id) {
        FormatoInspeccion formato = formatoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formato no encontrado"));
        if (formato.getInspecciones() != null && !formato.getInspecciones().isEmpty()) {
            throw new RuntimeException("No se puede eliminar: el formato está siendo usado en inspecciones");
        }
        formatoRepository.delete(formato);
    }

    @Transactional
    public CampoFormatoDTO agregarCampo(Long formatoId, CampoFormatoDTO campoDTO) {
        FormatoInspeccion formato = formatoRepository.findById(formatoId)
                .orElseThrow(() -> new RuntimeException("Formato no encontrado"));

        CampoFormato campo = new CampoFormato();
        campo.setNombre(campoDTO.getNombre());
        campo.setSeccion(campoDTO.getSeccion() != null ? campoDTO.getSeccion() : "LABORATORIO");
        Integer maxOrden = campoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(formatoId)
                .stream()
                .mapToInt(CampoFormato::getOrden)
                .max()
                .orElse(-1);
        campo.setOrden(maxOrden + 1);
        campo.setTipoEvaluacion(campoDTO.getTipoEvaluacion() != null ? campoDTO.getTipoEvaluacion() : "TEXTO");
        campo.setObligatorio(campoDTO.getObligatorio() != null ? campoDTO.getObligatorio() : false);
        campo.setFormatoInspeccion(formato);

        CampoFormato guardado = campoRepository.save(campo);
        return convertirACampoDTO(guardado);
    }

    @Transactional
    public CampoFormatoDTO actualizarCampo(Long campoId, CampoFormatoDTO campoDTO) {
        CampoFormato campo = campoRepository.findById(campoId)
                .orElseThrow(() -> new RuntimeException("Campo no encontrado"));

        campo.setNombre(campoDTO.getNombre());
        if (campoDTO.getSeccion() != null) {
            campo.setSeccion(campoDTO.getSeccion());
        }
        if (campoDTO.getTipoEvaluacion() != null) {
            campo.setTipoEvaluacion(campoDTO.getTipoEvaluacion());
        }
        if (campoDTO.getObligatorio() != null) {
            campo.setObligatorio(campoDTO.getObligatorio());
        }

        CampoFormato guardado = campoRepository.save(campo);
        return convertirACampoDTO(guardado);
    }

    @Transactional
    public void eliminarCampo(Long campoId) {
        campoRepository.deleteById(campoId);
    }

    @Transactional
    public void reordenarCampos(Long formatoId, List<Long> idsCamposEnOrden) {
        for (int i = 0; i < idsCamposEnOrden.size(); i++) {
            final Long id = idsCamposEnOrden.get(i);
            Optional<CampoFormato> opt = campoRepository.findById(id);
            CampoFormato campo = opt.orElseThrow(() -> new RuntimeException("Campo no encontrado: " + id));
            if (campo.getFormatoInspeccion().getIdFormatoInspeccion().equals(formatoId)) {
                campo.setOrden(i);
                campoRepository.save(campo);
            } else {
                throw new RuntimeException("El campo no pertenece al formato");
            }
        }
    }

    private FormatoInspeccionResponseDTO convertirAResponseDTO(FormatoInspeccion formato) {
        FormatoInspeccionResponseDTO dto = new FormatoInspeccionResponseDTO();
        dto.setId(formato.getIdFormatoInspeccion());
        dto.setNombre(formato.getNombre());
        dto.setDescripcion(formato.getDescripcion());
        dto.setActivo(formato.getActivo());
        dto.setFechaCreacion(formato.getFechaCreacion() != null ? formato.getFechaCreacion().toString() : null);
        dto.setTituloPrincipal(formato.getTituloPrincipal());
        dto.setTituloFontSize(formato.getTituloFontSize());
        dto.setSubtituloPrincipal(formato.getSubtituloPrincipal());
        dto.setSubtituloFontSize(formato.getSubtituloFontSize());
        dto.setSubtitulo2(formato.getSubtitulo2());
        dto.setSubtitulo3(formato.getSubtitulo3());
        dto.setSubtitulo4(formato.getSubtitulo4());
        dto.setTituloSeccionDatosGenerales(formato.getTituloSeccionDatosGenerales());
        dto.setTituloSeccionPlaca(formato.getTituloSeccionPlaca());
        dto.setTituloSeccionPlanLunca(formato.getTituloSeccionPlanLunca());
        dto.setTituloSeccionLaboratorio(formato.getTituloSeccionLaboratorio());

        if (formato.getCampos() != null) {
            dto.setCampos(formato.getCampos().stream()
                    .sorted(Comparator.comparingInt(CampoFormato::getOrden))
                    .map(this::convertirACampoDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private FormatoInspeccionResponseDTO convertirASimpleDTO(FormatoInspeccion formato) {
        FormatoInspeccionResponseDTO dto = new FormatoInspeccionResponseDTO();
        dto.setId(formato.getIdFormatoInspeccion());
        dto.setNombre(formato.getNombre());
        dto.setDescripcion(formato.getDescripcion());
        dto.setActivo(formato.getActivo());
        dto.setFechaCreacion(formato.getFechaCreacion() != null ? formato.getFechaCreacion().toString() : null);
        dto.setTituloPrincipal(formato.getTituloPrincipal());
        dto.setSubtituloPrincipal(formato.getSubtituloPrincipal());
        return dto;
    }

    private CampoFormatoDTO convertirACampoDTO(CampoFormato campo) {
        CampoFormatoDTO dto = new CampoFormatoDTO();
        dto.setId(campo.getIdCampoFormato());
        dto.setNombre(campo.getNombre());
        dto.setSeccion(campo.getSeccion());
        dto.setOrden(campo.getOrden());
        dto.setTipoEvaluacion(campo.getTipoEvaluacion());
        dto.setObligatorio(campo.getObligatorio());
        return dto;
    }
}
