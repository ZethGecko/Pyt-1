package com.example.demo.dto;

import java.util.List;

public class BloqueRevisarRequestDTO {
    private Long tramiteId;
    private List<Long> vehiculosIds;
    private Boolean aprobarTodos; // true = APTO, false = NO_APTO
    private String motivoRechazoGlobal; // si aprobarTodos = false
    private String observacionesGlobales;

    // Getters and Setters
    public Long getTramiteId() {
        return tramiteId;
    }

    public void setTramiteId(Long tramiteId) {
        this.tramiteId = tramiteId;
    }

    public List<Long> getVehiculosIds() {
        return vehiculosIds;
    }

    public void setVehiculosIds(List<Long> vehiculosIds) {
        this.vehiculosIds = vehiculosIds;
    }

    public Boolean getAprobarTodos() {
        return aprobarTodos;
    }

    public void setAprobarTodos(Boolean aprobarTodos) {
        this.aprobarTodos = aprobarTodos;
    }

    public String getMotivoRechazoGlobal() {
        return motivoRechazoGlobal;
    }

    public void setMotivoRechazoGlobal(String motivoRechazoGlobal) {
        this.motivoRechazoGlobal = motivoRechazoGlobal;
    }

    public String getObservacionesGlobales() {
        return observacionesGlobales;
    }

    public void setObservacionesGlobales(String observacionesGlobales) {
        this.observacionesGlobales = observacionesGlobales;
    }
}
