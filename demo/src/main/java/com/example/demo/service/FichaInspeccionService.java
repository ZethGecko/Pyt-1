package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.FichaInspeccionUpdateRequestDTO;
import com.example.demo.dto.ParametroInspeccionDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
 import com.example.demo.model.CampoFormato;
 import com.example.demo.model.FormatoInspeccion;
 import com.example.demo.model.FichaInspeccion;
 import com.example.demo.model.Inspeccion;
 import com.example.demo.model.InstanciaTramite;
 import com.example.demo.model.ValorCampo;
 import com.example.demo.model.Vehiculo;
 import com.example.demo.model.VehiculoApto;
import com.example.demo.repository.CampoFormatoRepository;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.FormatoInspeccionRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.ValorCampoRepository;
import com.example.demo.repository.VehiculoRepository;

@Service
public class FichaInspeccionService {

    private final FichaInspeccionRepository fichaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final InspeccionRepository inspeccionRepository;
    private final FormatoInspeccionRepository formatoRepository;
    private final CampoFormatoRepository campoRepository;
    private final ValorCampoRepository valorRepository;

    public FichaInspeccionService(FichaInspeccionRepository fichaRepository,
                                   VehiculoRepository vehiculoRepository,
                                   InspeccionRepository inspeccionRepository,
                                   FormatoInspeccionRepository formatoRepository,
                                   CampoFormatoRepository campoRepository,
                                   ValorCampoRepository valorRepository) {
        this.fichaRepository = fichaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.inspeccionRepository = inspeccionRepository;
        this.formatoRepository = formatoRepository;
        this.campoRepository = campoRepository;
        this.valorRepository = valorRepository;
    }

    /**
     * Lista todas las fichas (sin enriquecimiento pesado)
     */
    public List<FichaInspeccionResponseDTO> listarTodas() {
        return fichaRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista las fichas asociadas a un trámite
     */
    public List<FichaInspeccionResponseDTO> listarPorTramite(Long tramiteId) {
        return fichaRepository.findByVehiculoApto_Tramite_IdTramite(tramiteId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista las fichas asociadas a una inspección
     */
    public List<FichaInspeccionResponseDTO> listarPorInspeccion(Long inspeccionId) {
        return fichaRepository.findByInspeccion(inspeccionId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crea una nueva ficha de inspección (para un vehículo)
     */
    @Transactional
    public FichaInspeccionResponseDTO guardar(FichaInspeccionCreateRequestDTO request) {
        Long inspeccionId = request.getInspeccionId();
        if (inspeccionId == null) {
            throw new IllegalArgumentException("InspeccionId es requerido");
        }

        // Obtener inspección con instancias si es necesario
        // Obtener inspección con instancias para buscar vehículo si es necesario
        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElseThrow(() -> new RuntimeException("Inspección no encontrada"));

        // Determinar vehiculoId: si no viene, obtener de la primera instancia de la inspección
        Long vehiculoId = request.getVehiculoId();
        if (vehiculoId == null) {
            if (inspeccion.getInstancias() != null && !inspeccion.getInstancias().isEmpty()) {
                InstanciaTramite instancia = inspeccion.getInstancias().get(0).getInstanciaTramite();
                if (instancia != null && instancia.getIdentificador() != null) {
                    Vehiculo v = vehiculoRepository.findByPlaca(instancia.getIdentificador()).orElse(null);
                    if (v != null) {
                        vehiculoId = v.getIdVehiculo();
                    }
                }
            }
        }
        if (vehiculoId == null) {
            throw new IllegalArgumentException("No se pudo determinar el vehículo. Proporcione vehiculoId o asegúrese que la inspección tiene instancias.");
        }

        // Obtener o crear formato para la inspección
        FormatoInspeccion formato = inspeccion.getFormatoInspeccion();
        if (formato == null) {
            formato = crearFormatoPorDefecto(inspeccion);
        }

        // Crear ficha
        FichaInspeccion ficha = new FichaInspeccion();
        ficha.setInspeccion(inspeccionId);
        ficha.setVehiculo(vehiculoId);
        ficha.setUsuarioInspector(request.getUsuarioInspectorId());
        ficha.setEstado(request.getEstado() != null ? request.getEstado() : true);
        ficha.setResultado(request.getResultado());
        ficha.setObservaciones(request.getObservaciones());
        ficha.setFormatoInspeccion(formato);

        FichaInspeccion guardada = fichaRepository.save(ficha);

        // Crear valores vacíos para cada campo del formato
        crearValoresPorDefecto(guardada, formato);

        return convertirAResponseDTO(guardada);
    }

    /**
     * Busca ficha por ID con asociaciones
     */
    public FichaInspeccionResponseDTO buscarPorId(Long id) {
        FichaInspeccion ficha = fichaRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new RuntimeException("Ficha no encontrada"));
        return convertToDetailDTO(ficha);
    }

    /**
     * Replica el formato de una ficha origen a todas las demás fichas de la misma inspección.
     * Copia título, títulos de sección y crea valores vacíos con la misma estructura de campos.
     */
    @Transactional
    public void replicarFormatoEnInspeccion(Long inspeccionId, Long fichaOrigenId) {
        FichaInspeccion fichaOrigen = fichaRepository.findByIdWithAssociations(fichaOrigenId)
                .orElseThrow(() -> new RuntimeException("Ficha origen no encontrada: " + fichaOrigenId));

        FormatoInspeccion formatoOrigen = fichaOrigen.getFormatoInspeccion();
        if (formatoOrigen == null) {
            throw new RuntimeException("La ficha origen no tiene formato asociado");
        }

        Long formatoId = formatoOrigen.getIdFormatoInspeccion();

        // Asignar el mismo formato a todas las fichas de la inspección que no lo tengan
        List<FichaInspeccion> fichasDestino = fichaRepository.findByInspeccion(inspeccionId);

        for (FichaInspeccion fichaDestino : fichasDestino) {
            if (fichaDestino.getIdFichaInspeccion().equals(fichaOrigenId)) {
                continue; // saltar la ficha origen
            }

            FormatoInspeccion formatoDest = fichaDestino.getFormatoInspeccion();

            if (formatoDest == null || !formatoDest.getIdFormatoInspeccion().equals(formatoId)) {
                // Asignar el formato origen
                fichaDestino.setFormatoInspeccion(formatoOrigen);
                fichaDestino = fichaRepository.save(fichaDestino);
                formatoDest = formatoOrigen;
            }

            // Limpiar valores viejos (si la ficha ya tenía valores)
            List<ValorCampo> valoresViejos = valorRepository.findByFichaInspeccion_IdFichaInspeccion(
                    fichaDestino.getIdFichaInspeccion());
            if (!valoresViejos.isEmpty()) {
                valorRepository.deleteAll(valoresViejos);
            }

            // Recrear valores desde el formato origen
            List<CampoFormato> campos = campoRepository
                    .findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(formatoDest.getIdFormatoInspeccion());
            for (CampoFormato campo : campos) {
                ValorCampo valor = new ValorCampo();
                valor.setFichaInspeccion(fichaDestino);
                valor.setCampoFormato(campo);
                valor.setValor("");
                valor.setObservacion("");
                valorRepository.save(valor);
            }
        }
    }


    /**
     * Elimina una ficha
     */
    public void eliminar(Long id) {
        fichaRepository.deleteById(id);
    }

    /**
     * Actualiza una ficha (datos + valores de campos). Si se envían títulos,
     * se actualizan en el FormatoInspeccion asociado.
     */
    @Transactional
    public FichaInspeccionResponseDTO actualizar(Long id, FichaInspeccionUpdateRequestDTO request) {
        FichaInspeccion ficha = fichaRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new RuntimeException("Ficha no encontrada"));

        // Actualizar datos de la ficha
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
        if (request.getFirmaResponsable() != null) {
            ficha.setFirmaResponsable(request.getFirmaResponsable());
        }
        if (request.getFechaFirma() != null) {
            ficha.setFechaFirma(request.getFechaFirma());
        }

        // Si vienen títulos, actualizar el FormatoInspeccion asociado
        FormatoInspeccion formato = ficha.getFormatoInspeccion();
        if (formato != null) {
            boolean formatoModificado = false;
            if (request.getTituloPrincipal() != null) {
                formato.setTituloPrincipal(request.getTituloPrincipal());
                formatoModificado = true;
            }
            if (request.getSubtituloPrincipal() != null) {
                formato.setSubtituloPrincipal(request.getSubtituloPrincipal());
                formatoModificado = true;
            }
            if (request.getTituloSeccionDatosGenerales() != null) {
                formato.setTituloSeccionDatosGenerales(request.getTituloSeccionDatosGenerales());
                formatoModificado = true;
            }
            if (request.getTituloSeccionPlaca() != null) {
                formato.setTituloSeccionPlaca(request.getTituloSeccionPlaca());
                formatoModificado = true;
            }
            if (request.getTituloSeccionPlanLunca() != null) {
                formato.setTituloSeccionPlanLunca(request.getTituloSeccionPlanLunca());
                formatoModificado = true;
            }
            if (request.getTituloSeccionLaboratorio() != null) {
                formato.setTituloSeccionLaboratorio(request.getTituloSeccionLaboratorio());
                formatoModificado = true;
            }
            if (formatoModificado) {
                formatoRepository.save(formato);
            }
        }

        // Actualizar parámetros (valores de campos)
        if (request.getParametros() != null) {
            actualizarParametros(ficha, request.getParametros());
        }

        FichaInspeccion guardada = fichaRepository.save(ficha);
        return convertirADetailDTO(guardada);
    }

    /**
     * Actualiza los valores de los campos de la ficha
     */
    @Transactional
    private void actualizarParametros(FichaInspeccion ficha, List<ParametroInspeccionDTO> parametros) {
        // Mapa de campoFormatoId -> ValorCampo existente
        Map<Long, ValorCampo> valoresExistentes = ficha.getValores().stream()
                .filter(v -> v.getCampoFormato() != null)
                .collect(Collectors.toMap(
                        v -> v.getCampoFormato().getIdCampoFormato(),
                        v -> v
                ));

        for (ParametroInspeccionDTO paramDTO : parametros) {
            // Buscar el CampoFormato por nombre (o por id si viene)
            CampoFormato campo = null;
            if (paramDTO.getId() != null) {
                campo = campoRepository.findById(paramDTO.getId())
                        .orElse(null);
            }
            if (campo == null && paramDTO.getParametro() != null) {
                // Buscar por nombre en el formato de la ficha
                FormatoInspeccion formato = ficha.getFormatoInspeccion();
                if (formato != null) {
                    campo = formato.getCampos().stream()
                            .filter(c -> c.getNombre().equals(paramDTO.getParametro()))
                            .findFirst()
                            .orElse(null);
                }
            }

            if (campo == null) {
                // No se encontró el campo, ignorar
                continue;
            }

            ValorCampo valor = valoresExistentes.remove(campo.getIdCampoFormato());
            if (valor == null) {
                // Crear nuevo valor
                valor = new ValorCampo();
                valor.setFichaInspeccion(ficha);
                valor.setCampoFormato(campo);
                valor.setValor(paramDTO.getObservacion() != null ? paramDTO.getObservacion() : "");
                valor.setObservacion(""); // ¿observación adicional?
                valorRepository.save(valor);
            } else {
                // Actualizar existente
                valor.setValor(paramDTO.getObservacion() != null ? paramDTO.getObservacion() : "");
                valorRepository.save(valor);
            }
        }
        // Los valores no enviados se mantienen, no se eliminan
    }

    /**
     * Lista aprobadas por empresa
     */
    public List<FichaInspeccionResponseDTO> listarAprobadasPorEmpresa(Long empresaId) {
        return fichaRepository.findApprovedByEmpresa(empresaId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la ficha aprobada más reciente para un vehículo
     */
    public FichaInspeccionResponseDTO obtenerAprobadaPorVehiculo(Long vehiculoId) {
        List<FichaInspeccion> fichas = fichaRepository.findApprovedByVehiculoOrderByFechaCreacionDesc(vehiculoId);
        if (fichas.isEmpty()) {
            return null;
        }
        return convertToDetailDTO(fichas.get(0));
    }

    // ========== MÉTODOS AUXILIARES ==========

    private FormatoInspeccion crearFormatoPorDefecto(Inspeccion inspeccion) {
        FormatoInspeccion formato = new FormatoInspeccion();
        formato.setNombre("Formato " + inspeccion.getCodigo());
        formato.setDescripcion("Formato por defecto para inspección " + inspeccion.getCodigo());
        formato.setActivo(true);
        FormatoInspeccion guardado = formatoRepository.save(formato);

        // Asignar a la inspección
        inspeccion.setFormatoInspeccion(guardado);
        inspeccionRepository.save(inspeccion);

        // Crear campos por defecto (los mismos que en el frontend)
        String[] camposPorDefecto = {
                "ID:", "Nº de la empresa:", "Nombre del representante:", "Teléfono:",
                "Dirección:", "Localización:", "NUMERO DE PLACA:", "MODELO DE LA PLACA:",
                "AÑO DE LA PLACA:", "PRIMEROS AUXILIOS:", "EXTINTORES DE INCENDIOS:",
                "ACCIDENTES:", "CARRETERA DE ACCESO:", "CARREO DE CIRCULACIÓN VIAL VIENTOS:",
                "SEÑALIZACIÓN DE OBRA:", "APLICABILIDAD MUNDIAL DE PLAZA:",
                "SELECCIÓN DE EMERGENCIA:", "A MUNDIAL DE PLAZA:",
                "CIRCULACIÓN VIARIA VIENTOS:", "SELECCIÓN DE PUNTO DE CONTACTO:",
                "APLICABILIDAD DE PLANTA:", "FECHA DE PROGRAMA:", "CARTA DE INDUCCIÓN:",
                "IMPLEMENTACION DE MANTENIMIENTO:", "CONSTRUCCIÓN DE CIUDAD:",
                "ESTRUCTURA DE PLAZA:", "COMPONENTE DE SEGURIDAD:"
        };
        String[] seccionesPorDefecto = {
                "DATOS GENERALES", "DATOS GENERALES", "DATOS GENERALES", "DATOS GENERALES",
                "DATOS GENERALES", "DATOS GENERALES", "PLACA", "PLACA", "PLACA",
                "PLAN LUNCA DE RODALE", "PLAN LUNCA DE RODALE", "PLAN LUNCA DE RODALE",
                "PLAN LUNCA DE RODALE", "PLAN LUNCA DE RODALE", "PLAN LUNCA DE RODALE",
                "LABORATORIO", "LABORATORIO", "LABORATORIO", "LABORATORIO", "LABORATORIO",
                "LABORATORIO", "LABORATORIO", "LABORATORIO", "LABORATORIO", "LABORATORIO",
                "LABORATORIO", "LABORATORIO"
        };
        for (int i = 0; i < camposPorDefecto.length; i++) {
            CampoFormato campo = new CampoFormato();
            campo.setNombre(camposPorDefecto[i]);
            campo.setSeccion(seccionesPorDefecto[i]);
            campo.setOrden(i);
            campo.setTipoEvaluacion("TEXTO");
            campo.setObligatorio(false);
            campo.setFormatoInspeccion(guardado);
            campoRepository.save(campo);
        }
        return guardado;
    }

    private void crearValoresPorDefecto(FichaInspeccion ficha, FormatoInspeccion formato) {
        List<CampoFormato> campos = campoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(
                formato.getIdFormatoInspeccion());
        for (CampoFormato campo : campos) {
            ValorCampo valor = new ValorCampo();
            valor.setFichaInspeccion(ficha);
            valor.setCampoFormato(campo);
            valor.setValor(""); // valor vacío, se llenará después
            valor.setObservacion("");
            valorRepository.save(valor);
        }
    }

    // Conversión a DTO de respuesta simple (sin profundidad)
    private FichaInspeccionResponseDTO convertToResponseDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());

        // Títulos desde FormatoInspeccion
        FormatoInspeccion formato = ficha.getFormatoInspeccion();
        if (formato != null) {
            dto.setTituloPrincipal(formato.getTituloPrincipal());
            dto.setSubtituloPrincipal(formato.getSubtituloPrincipal());
            dto.setTituloSeccionDatosGenerales(formato.getTituloSeccionDatosGenerales());
            dto.setTituloSeccionPlaca(formato.getTituloSeccionPlaca());
            dto.setTituloSeccionPlanLunca(formato.getTituloSeccionPlanLunca());
            dto.setTituloSeccionLaboratorio(formato.getTituloSeccionLaboratorio());
        } else {
            // Valores por defecto
            dto.setTituloPrincipal("CERTIFICADO DE INSTRUCCIONES EQUIVALIDO COMPLEMENTARIA");
            dto.setSubtituloPrincipal("CÁTEDRA DE LA EMPRESA");
            dto.setTituloSeccionDatosGenerales("DATOS GENERALES");
            dto.setTituloSeccionPlaca("PLACA");
            dto.setTituloSeccionPlanLunca("PLAN LUNCA DE RODALE");
            dto.setTituloSeccionLaboratorio("LABORATORIO");
        }

        // Parámetros (vacíos porque no cargamos en listarTodas)
        dto.setParametros(new ArrayList<>());

        return dto;
    }

    // Conversión a DTO detallado (con parámetros)
    private FichaInspeccionResponseDTO convertToDetailDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());
        dto.setFirmaResponsable(ficha.getFirmaResponsable());
        dto.setFechaFirma(ficha.getFechaFirma());

        // Títulos desde FormatoInspeccion
        FormatoInspeccion formato = ficha.getFormatoInspeccion();
        if (formato != null) {
            dto.setTituloPrincipal(formato.getTituloPrincipal());
            dto.setSubtituloPrincipal(formato.getSubtituloPrincipal());
            dto.setTituloSeccionDatosGenerales(formato.getTituloSeccionDatosGenerales());
            dto.setTituloSeccionPlaca(formato.getTituloSeccionPlaca());
            dto.setTituloSeccionPlanLunca(formato.getTituloSeccionPlanLunca());
            dto.setTituloSeccionLaboratorio(formato.getTituloSeccionLaboratorio());
        } else {
            dto.setTituloPrincipal("CERTIFICADO DE INSTRUCCIONES EQUIVALIDO COMPLEMENTARIA");
            dto.setSubtituloPrincipal("CÁTEDRA DE LA EMPRESA");
            dto.setTituloSeccionDatosGenerales("DATOS GENERALES");
            dto.setTituloSeccionPlaca("PLACA");
            dto.setTituloSeccionPlanLunca("PLAN LUNCA DE RODALE");
            dto.setTituloSeccionLaboratorio("LABORATORIO");
        }

        // Parámetros (campos con valores) — cargar valores explícitamente (LAZY)
        List<ParametroInspeccionResponseDTO> parametrosDTO = new ArrayList<>();
        if (formato != null) {
            List<ValorCampo> valores = valorRepository.findByFichaInspeccion_IdFichaInspeccion(ficha.getIdFichaInspeccion());
            Map<Long, ValorCampo> valorPorCampo = valores.stream()
                    .filter(v -> v.getCampoFormato() != null)
                    .collect(Collectors.toMap(
                            v -> v.getCampoFormato().getIdCampoFormato(),
                            v -> v
                    ));

            List<CampoFormato> campos = campoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(
                    formato.getIdFormatoInspeccion());
            for (CampoFormato campo : campos) {
                ParametroInspeccionResponseDTO paramDTO = new ParametroInspeccionResponseDTO();
                paramDTO.setIdParametros(campo.getIdCampoFormato());
                paramDTO.setParametro(campo.getNombre());
                ValorCampo val = valorPorCampo.get(campo.getIdCampoFormato());
                paramDTO.setObservacion(val != null ? val.getValor() : "");
                paramDTO.setSeccion(campo.getSeccion());
                parametrosDTO.add(paramDTO);
            }
        }
        dto.setParametros(parametrosDTO);

        // Datos del vehículo
        Vehiculo vehiculo = ficha.getVehiculoEntity();
        if (vehiculo != null) {
            dto.setVehiculoPlaca(vehiculo.getPlaca());
            dto.setVehiculoMarca(vehiculo.getMarca());
            dto.setVehiculoModelo(vehiculo.getModelo());
        } else {
            Long vehiculoId = ficha.getVehiculo();
            if (vehiculoId != null) {
                vehiculo = vehiculoRepository.findById(vehiculoId).orElse(null);
                if (vehiculo != null) {
                    dto.setVehiculoPlaca(vehiculo.getPlaca());
                    dto.setVehiculoMarca(vehiculo.getMarca());
                    dto.setVehiculoModelo(vehiculo.getModelo());
                }
            }
        }

        // VehiculoApto info
        if (ficha.getVehiculoApto() != null) {
            VehiculoApto va = ficha.getVehiculoApto();
            dto.setVehiculoAptoId(va.getIdVehiculoApto());
            dto.setEstadoDocumental(va.getEstadoDocumental());
        }

        return dto;
    }

    private FichaInspeccionResponseDTO convertirAResponseDTO(FichaInspeccion ficha) {
        return convertToResponseDTO(ficha);
    }

    private FichaInspeccionResponseDTO convertirADetailDTO(FichaInspeccion ficha) {
        return convertToDetailDTO(ficha);
    }
}
