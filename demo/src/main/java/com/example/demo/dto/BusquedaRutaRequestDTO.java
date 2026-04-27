package com.example.demo.dto;

public class BusquedaRutaRequestDTO {
    private Double origenLatitud;
    private Double origenLongitud;
    private Double destinoLatitud;
    private Double destinoLongitud;

    public BusquedaRutaRequestDTO() {}

    public BusquedaRutaRequestDTO(Double origenLatitud, Double origenLongitud, Double destinoLatitud, Double destinoLongitud) {
        this.origenLatitud = origenLatitud;
        this.origenLongitud = origenLongitud;
        this.destinoLatitud = destinoLatitud;
        this.destinoLongitud = destinoLongitud;
    }

    public Double getOrigenLatitud() { return origenLatitud; }
    public void setOrigenLatitud(Double origenLatitud) { this.origenLatitud = origenLatitud; }

    public Double getOrigenLongitud() { return origenLongitud; }
    public void setOrigenLongitud(Double origenLongitud) { this.origenLongitud = origenLongitud; }

    public Double getDestinoLatitud() { return destinoLatitud; }
    public void setDestinoLatitud(Double destinoLatitud) { this.destinoLatitud = destinoLatitud; }

    public Double getDestinoLongitud() { return destinoLongitud; }
    public void setDestinoLongitud(Double destinoLongitud) { this.destinoLongitud = destinoLongitud; }
}
