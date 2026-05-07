package com.example.demo.dto;

import java.time.LocalDate;
import java.util.List;

public class InspeccionRezagadaRequest {
    private Long instanciaTramiteId;
    private String fechaProgramada;
    private String hora;
    private String lugar;
    private String observaciones;
    private List<Long> vehiculosIds;

    public InspeccionRezagadaRequest() {}

    public Long getInstanciaTramiteId() { return instanciaTramiteId; }
    public void setInstanciaTramiteId(Long instanciaTramiteId) { this.instanciaTramiteId = instanciaTramiteId; }

    public String getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(String fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<Long> getVehiculosIds() { return vehiculosIds; }
    public void setVehiculosIds(List<Long> vehiculosIds) { this.vehiculosIds = vehiculosIds; }
}
