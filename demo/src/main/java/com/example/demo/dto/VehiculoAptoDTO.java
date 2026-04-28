package com.example.demo.dto;

import java.util.List;

public class VehiculoAptoDTO {
    private Long tramiteId;
    private List<Long> vehiculosIds; // Cambiado a lista para bloque
    private String observaciones;

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

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
