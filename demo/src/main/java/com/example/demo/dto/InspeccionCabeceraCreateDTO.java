package com.example.demo.dto;

import java.time.LocalDate;

public class InspeccionCabeceraCreateDTO {
    private Long instanciaTramiteId;
    private String fechaProgramada;
    private String horaProgramada;
    private String lugar;
    private String observaciones;

    public InspeccionCabeceraCreateDTO() {}

    public Long getInstanciaTramiteId() { return instanciaTramiteId; }
    public void setInstanciaTramiteId(Long instanciaTramiteId) { this.instanciaTramiteId = instanciaTramiteId; }

    public String getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(String fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public String getHoraProgramada() { return horaProgramada; }
    public void setHoraProgramada(String horaProgramada) { this.horaProgramada = horaProgramada; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
