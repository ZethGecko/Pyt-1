package com.example.demo.dto;

public class TerminarInstanciaRequestDTO {
    private Long vehiculoAptoId;
    private Boolean aprobar; // true = APTO, false = NO_APTO
    private String motivoRechazo;
    private String observaciones;

    // Getters and Setters
    public Long getVehiculoAptoId() {
        return vehiculoAptoId;
    }

    public void setVehiculoAptoId(Long vehiculoAptoId) {
        this.vehiculoAptoId = vehiculoAptoId;
    }

    public Boolean getAprobar() {
        return aprobar;
    }

    public void setAprobar(Boolean aprobar) {
        this.aprobar = aprobar;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
