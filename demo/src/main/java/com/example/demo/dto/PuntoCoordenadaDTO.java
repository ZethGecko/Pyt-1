package com.example.demo.dto;

public class PuntoCoordenadaDTO {
    private Double latitud;
    private Double longitud;

    public PuntoCoordenadaDTO() {}

    public PuntoCoordenadaDTO(Double latitud, Double longitud) {
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
}
