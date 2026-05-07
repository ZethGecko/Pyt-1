package com.example.demo.dto;

import java.time.LocalDate;

public class InspeccionIniciarRequest {
    private Long usuarioInspectorId;
    private LocalDate fechaInspeccion;

    public InspeccionIniciarRequest() {}

    public Long getUsuarioInspectorId() {
        return usuarioInspectorId;
    }

    public void setUsuarioInspectorId(Long usuarioInspectorId) {
        this.usuarioInspectorId = usuarioInspectorId;
    }

    public LocalDate getFechaInspeccion() {
        return fechaInspeccion;
    }

    public void setFechaInspeccion(LocalDate fechaInspeccion) {
        this.fechaInspeccion = fechaInspeccion;
    }
}
