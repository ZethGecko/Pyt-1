package com.example.demo.dto;

public class TramiteCreateRequest {
    private Long tipoTramiteId;
    private Long solicitanteId;
    private String tipoSolicitante; // "Empresa", "Gerente", "PersonaNatural"
    private String codigoRUT;
    private String prioridad;
    private String observaciones;

    public TramiteCreateRequest() {}

    public TramiteCreateRequest(Long tipoTramiteId, Long solicitanteId, String tipoSolicitante,
                               String codigoRUT, String prioridad, String observaciones) {
        this.tipoTramiteId = tipoTramiteId;
        this.solicitanteId = solicitanteId;
        this.tipoSolicitante = tipoSolicitante;
        this.codigoRUT = codigoRUT;
        this.prioridad = prioridad;
        this.observaciones = observaciones;
    }

    // Getters y setters
    public Long getTipoTramiteId() { return tipoTramiteId; }
    public void setTipoTramiteId(Long tipoTramiteId) { this.tipoTramiteId = tipoTramiteId; }

    public Long getSolicitanteId() { return solicitanteId; }
    public void setSolicitanteId(Long solicitanteId) { this.solicitanteId = solicitanteId; }

    public String getTipoSolicitante() { return tipoSolicitante; }
    public void setTipoSolicitante(String tipoSolicitante) { this.tipoSolicitante = tipoSolicitante; }

    public String getCodigoRUT() { return codigoRUT; }
    public void setCodigoRUT(String codigoRUT) { this.codigoRUT = codigoRUT; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}