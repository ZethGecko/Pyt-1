package com.example.demo.dto;

public class TramiteUpdateRequest {
    private String codigoRut;
    private String estado;
    private String tipoSolicitante;
    private String prioridad;
    private String observaciones;
    private Long tipoTramiteId;
    private Long solicitanteId;

    public TramiteUpdateRequest() {}

    public TramiteUpdateRequest(String codigoRut, String estado, String tipoSolicitante,
                               String prioridad, String observaciones, Long tipoTramiteId, Long solicitanteId) {
        this.codigoRut = codigoRut;
        this.estado = estado;
        this.tipoSolicitante = tipoSolicitante;
        this.prioridad = prioridad;
        this.observaciones = observaciones;
        this.tipoTramiteId = tipoTramiteId;
        this.solicitanteId = solicitanteId;
    }

    // Getters y setters
    public String getCodigoRut() { return codigoRut; }
    public void setCodigoRut(String codigoRut) { this.codigoRut = codigoRut; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTipoSolicitante() { return tipoSolicitante; }
    public void setTipoSolicitante(String tipoSolicitante) { this.tipoSolicitante = tipoSolicitante; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Long getTipoTramiteId() { return tipoTramiteId; }
    public void setTipoTramiteId(Long tipoTramiteId) { this.tipoTramiteId = tipoTramiteId; }
    
    public Long getSolicitanteId() { return solicitanteId; }
    public void setSolicitanteId(Long solicitanteId) { this.solicitanteId = solicitanteId; }


}