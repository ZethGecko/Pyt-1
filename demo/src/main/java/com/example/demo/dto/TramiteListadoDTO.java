package com.example.demo.dto;

import java.time.LocalDateTime;

public class TramiteListadoDTO {
    private Long id;
    private String codigoRUT;
    private String estado;
    private String prioridad;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;
    private String departamentoActualNombre;
    private String usuarioRegistraNombre;
    private String solicitanteNombre;
    private String tipoTramiteDescripcion;
    private Long tipoTramiteId;
    private Long solicitanteId;
    private String solicitanteTipo;
    private String solicitanteIdentificacion;
    // Estadísticas de documentos
    private Long totalDocumentos;
    private Long documentosAprobados;
    private Long documentosPendientes;
    private Long documentosObservados;
    private Long documentosRechazados;

    // Constructors
    public TramiteListadoDTO(Long id, String codigoRUT, String estado, String prioridad,
                            LocalDateTime fechaRegistro, LocalDateTime fechaActualizacion,
                            String departamentoActualNombre, String usuarioRegistraNombre) {
        this.id = id;
        this.codigoRUT = codigoRUT;
        this.estado = estado;
        this.prioridad = prioridad;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.departamentoActualNombre = departamentoActualNombre;
        this.usuarioRegistraNombre = usuarioRegistraNombre;
    }

    public TramiteListadoDTO(Long id, String codigoRUT, String estado, String prioridad,
                            LocalDateTime fechaRegistro, LocalDateTime fechaActualizacion,
                            String departamentoActualNombre, String usuarioRegistraNombre,
                            String solicitanteNombre) {
        this.id = id;
        this.codigoRUT = codigoRUT;
        this.estado = estado;
        this.prioridad = prioridad;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.departamentoActualNombre = departamentoActualNombre;
        this.usuarioRegistraNombre = usuarioRegistraNombre;
        this.solicitanteNombre = solicitanteNombre;
    }

    public TramiteListadoDTO(Long id, String codigoRUT, String estado, String prioridad,
                            LocalDateTime fechaRegistro, LocalDateTime fechaActualizacion,
                            String departamentoActualNombre, String usuarioRegistraNombre,
                            String solicitanteNombre, String tipoTramiteDescripcion) {
        this.id = id;
        this.codigoRUT = codigoRUT;
        this.estado = estado;
        this.prioridad = prioridad;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.departamentoActualNombre = departamentoActualNombre;
        this.usuarioRegistraNombre = usuarioRegistraNombre;
        this.solicitanteNombre = solicitanteNombre;
        this.tipoTramiteDescripcion = tipoTramiteDescripcion;
    }

    public TramiteListadoDTO(Long id, String codigoRUT, String estado, String prioridad,
                            LocalDateTime fechaRegistro, LocalDateTime fechaActualizacion,
                            String departamentoActualNombre, String usuarioRegistraNombre,
                            String solicitanteNombre, String tipoTramiteDescripcion, Long tipoTramiteId) {
        this.id = id;
        this.codigoRUT = codigoRUT;
        this.estado = estado;
        this.prioridad = prioridad;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.departamentoActualNombre = departamentoActualNombre;
        this.usuarioRegistraNombre = usuarioRegistraNombre;
        this.solicitanteNombre = solicitanteNombre;
        this.tipoTramiteDescripcion = tipoTramiteDescripcion;
        this.tipoTramiteId = tipoTramiteId;
    }

    // Full constructor with all solicitante fields and estadísticas
    public TramiteListadoDTO(Long id, String codigoRUT, String estado, String prioridad,
                            LocalDateTime fechaRegistro, LocalDateTime fechaActualizacion,
                            String departamentoActualNombre, String usuarioRegistraNombre,
                            String solicitanteNombre, String tipoTramiteDescripcion, Long tipoTramiteId,
                            Long solicitanteId, String solicitanteTipo, String solicitanteIdentificacion,
                            Long totalDocumentos, Long documentosAprobados, Long documentosPendientes,
                            Long documentosObservados, Long documentosRechazados) {
        this.id = id;
        this.codigoRUT = codigoRUT;
        this.estado = estado;
        this.prioridad = prioridad;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.departamentoActualNombre = departamentoActualNombre;
        this.usuarioRegistraNombre = usuarioRegistraNombre;
        this.solicitanteNombre = solicitanteNombre;
        this.tipoTramiteDescripcion = tipoTramiteDescripcion;
        this.tipoTramiteId = tipoTramiteId;
        this.solicitanteId = solicitanteId;
        this.solicitanteTipo = solicitanteTipo;
        this.solicitanteIdentificacion = solicitanteIdentificacion;
        this.totalDocumentos = totalDocumentos;
        this.documentosAprobados = documentosAprobados;
        this.documentosPendientes = documentosPendientes;
        this.documentosObservados = documentosObservados;
        this.documentosRechazados = documentosRechazados;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigoRUT() { return codigoRUT; }
    public void setCodigoRUT(String codigoRUT) { this.codigoRUT = codigoRUT; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getDepartamentoActualNombre() { return departamentoActualNombre; }
    public void setDepartamentoActualNombre(String departamentoActualNombre) { this.departamentoActualNombre = departamentoActualNombre; }

    public String getUsuarioRegistraNombre() { return usuarioRegistraNombre; }
    public void setUsuarioRegistraNombre(String usuarioRegistraNombre) { this.usuarioRegistraNombre = usuarioRegistraNombre; }

    public String getSolicitanteNombre() { return solicitanteNombre; }
    public void setSolicitanteNombre(String solicitanteNombre) { this.solicitanteNombre = solicitanteNombre; }

    public String getTipoTramiteDescripcion() { return tipoTramiteDescripcion; }
    public void setTipoTramiteDescripcion(String tipoTramiteDescripcion) { this.tipoTramiteDescripcion = tipoTramiteDescripcion; }

    public Long getTipoTramiteId() { return tipoTramiteId; }
    public void setTipoTramiteId(Long tipoTramiteId) { this.tipoTramiteId = tipoTramiteId; }

    public Long getSolicitanteId() { return solicitanteId; }
    public void setSolicitanteId(Long solicitanteId) { this.solicitanteId = solicitanteId; }

    public String getSolicitanteTipo() { return solicitanteTipo; }
    public void setSolicitanteTipo(String solicitanteTipo) { this.solicitanteTipo = solicitanteTipo; }

    public String getSolicitanteIdentificacion() { return solicitanteIdentificacion; }
    public void setSolicitanteIdentificacion(String solicitanteIdentificacion) { this.solicitanteIdentificacion = solicitanteIdentificacion; }

    // Getters and Setters for estadísticas
    public Long getTotalDocumentos() { return totalDocumentos; }
    public void setTotalDocumentos(Long totalDocumentos) { this.totalDocumentos = totalDocumentos; }

    public Long getDocumentosAprobados() { return documentosAprobados; }
    public void setDocumentosAprobados(Long documentosAprobados) { this.documentosAprobados = documentosAprobados; }

    public Long getDocumentosPendientes() { return documentosPendientes; }
    public void setDocumentosPendientes(Long documentosPendientes) { this.documentosPendientes = documentosPendientes; }

    public Long getDocumentosObservados() { return documentosObservados; }
    public void setDocumentosObservados(Long documentosObservados) { this.documentosObservados = documentosObservados; }

    public Long getDocumentosRechazados() { return documentosRechazados; }
    public void setDocumentosRechazados(Long documentosRechazados) { this.documentosRechazados = documentosRechazados; }
}
