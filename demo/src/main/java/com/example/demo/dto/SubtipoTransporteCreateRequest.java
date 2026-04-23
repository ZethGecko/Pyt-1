package com.example.demo.dto;

public class SubtipoTransporteCreateRequest {
    private String nombre;
    private Integer tipoTransporteId;

    public SubtipoTransporteCreateRequest() {}

    public SubtipoTransporteCreateRequest(String nombre, Integer tipoTransporteId) {
        this.nombre = nombre;
        this.tipoTransporteId = tipoTransporteId;
    }

    // Getters y setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getTipoTransporteId() { return tipoTransporteId; }
    public void setTipoTransporteId(Integer tipoTransporteId) { this.tipoTransporteId = tipoTransporteId; }
}