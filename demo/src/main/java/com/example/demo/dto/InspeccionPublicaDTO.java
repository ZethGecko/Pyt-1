package com.example.demo.dto;

import java.time.LocalDate;

public class InspeccionPublicaDTO {
    private Long idInspeccion;
    private String codigo;
    private LocalDate fechaProgramada;
    private String hora;
    private String lugar;
    private String empresaNombre;
    private Long numeroUnidades;

    public InspeccionPublicaDTO() {}

    public InspeccionPublicaDTO(Long idInspeccion, String codigo, LocalDate fechaProgramada,
                                String hora, String lugar, String empresaNombre, Long numeroUnidades) {
        this.idInspeccion = idInspeccion;
        this.codigo = codigo;
        this.fechaProgramada = fechaProgramada;
        this.hora = hora;
        this.lugar = lugar;
        this.empresaNombre = empresaNombre;
        this.numeroUnidades = numeroUnidades;
    }

    public Long getIdInspeccion() {
        return idInspeccion;
    }

    public void setIdInspeccion(Long idInspeccion) {
        this.idInspeccion = idInspeccion;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public LocalDate getFechaProgramada() {
        return fechaProgramada;
    }

    public void setFechaProgramada(LocalDate fechaProgramada) {
        this.fechaProgramada = fechaProgramada;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public String getEmpresaNombre() {
        return empresaNombre;
    }

    public void setEmpresaNombre(String empresaNombre) {
        this.empresaNombre = empresaNombre;
    }

    public Long getNumeroUnidades() {
        return numeroUnidades;
    }

    public void setNumeroUnidades(Long numeroUnidades) {
        this.numeroUnidades = numeroUnidades;
    }
}
