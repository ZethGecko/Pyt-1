package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class InspeccionInstanciaInspeccionarRequest {
    private String placa;
    private LocalDateTime fechaInspeccion;
    private Long usuarioInspectorId;
    private Boolean estado;
    private String resultado;
    private String observaciones;
    private List<ParametroInspeccionDTO> parametros;

    public InspeccionInstanciaInspeccionarRequest() {}

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public LocalDateTime getFechaInspeccion() {
        return fechaInspeccion;
    }

    public void setFechaInspeccion(LocalDateTime fechaInspeccion) {
        this.fechaInspeccion = fechaInspeccion;
    }

    public Long getUsuarioInspectorId() {
        return usuarioInspectorId;
    }

    public void setUsuarioInspectorId(Long usuarioInspectorId) {
        this.usuarioInspectorId = usuarioInspectorId;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public List<ParametroInspeccionDTO> getParametros() {
        return parametros;
    }

    public void setParametros(List<ParametroInspeccionDTO> parametros) {
        this.parametros = parametros;
    }
}
