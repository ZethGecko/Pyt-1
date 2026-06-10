package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class AuditLogResponseDTO {
    private String tablaAfectada;
    private Long registroId;
    private String accion;
    private String tipoAccion; // "CREACION", "MODIFICACION", "ELIMINACION"
    private LocalDateTime fechaAccion;
    private String usuario;
    private String descripcion;
    private Map<String, Object> datosAnteriores;
    private Map<String, Object> datosNuevos;

    public AuditLogResponseDTO() {}

    public String getTablaAfectada() {
        return tablaAfectada;
    }

    public void setTablaAfectada(String tablaAfectada) {
        this.tablaAfectada = tablaAfectada;
    }

    public Long getRegistroId() {
        return registroId;
    }

    public void setRegistroId(Long registroId) {
        this.registroId = registroId;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public String getTipoAccion() {
        return tipoAccion;
    }

    public void setTipoAccion(String tipoAccion) {
        this.tipoAccion = tipoAccion;
    }

    public LocalDateTime getFechaAccion() {
        return fechaAccion;
    }

    public void setFechaAccion(LocalDateTime fechaAccion) {
        this.fechaAccion = fechaAccion;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Map<String, Object> getDatosAnteriores() {
        return datosAnteriores;
    }

    public void setDatosAnteriores(Map<String, Object> datosAnteriores) {
        this.datosAnteriores = datosAnteriores;
    }

    public Map<String, Object> getDatosNuevos() {
        return datosNuevos;
    }

    public void setDatosNuevos(Map<String, Object> datosNuevos) {
        this.datosNuevos = datosNuevos;
    }
}
