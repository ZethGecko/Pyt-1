package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InspeccionParaHabilitarTucDTO {
    private Long idInspeccion;
    private String codigo;
    private LocalDate fechaProgramada;
    private String hora;
    private String lugar;
    private String estado;
    private String resultadoGeneral;
    private LocalDateTime fechaEjecucion;
    private LocalDateTime fechaCreacion;
    private Long empresaId;
    private String empresaNombre;
    private String empresaRuc;

    public Long getIdInspeccion() { return idInspeccion; }
    public void setIdInspeccion(Long idInspeccion) { this.idInspeccion = idInspeccion; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getResultadoGeneral() { return resultadoGeneral; }
    public void setResultadoGeneral(String resultadoGeneral) { this.resultadoGeneral = resultadoGeneral; }

    public LocalDateTime getFechaEjecucion() { return fechaEjecucion; }
    public void setFechaEjecucion(LocalDateTime fechaEjecucion) { this.fechaEjecucion = fechaEjecucion; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

    public String getEmpresaRuc() { return empresaRuc; }
    public void setEmpresaRuc(String empresaRuc) { this.empresaRuc = empresaRuc; }
}
