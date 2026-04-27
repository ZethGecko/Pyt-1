package com.example.demo.dto;

import java.time.LocalDateTime;

public class InscripcionExamenRegistroDTO {
    private Integer dni;
    private Long grupoPresentacionId;
    private String codigoRUT;
    private String tipoTramite;
    private String observaciones;
    private Boolean pagado;
    private LocalDateTime fechaInscripcion;
    private String estado;

    public Integer getDni() {
        return dni;
    }

    public void setDni(Integer dni) {
        this.dni = dni;
    }

    public Long getGrupoPresentacionId() {
        return grupoPresentacionId;
    }

    public void setGrupoPresentacionId(Long grupoPresentacionId) {
        this.grupoPresentacionId = grupoPresentacionId;
    }

    public String getCodigoRUT() {
        return codigoRUT;
    }

    public void setCodigoRUT(String codigoRUT) {
        this.codigoRUT = codigoRUT;
    }

    public String getTipoTramite() {
        return tipoTramite;
    }

    public void setTipoTramite(String tipoTramite) {
        this.tipoTramite = tipoTramite;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Boolean getPagado() {
        return pagado;
    }

    public void setPagado(Boolean pagado) {
        this.pagado = pagado;
    }

    public LocalDateTime getFechaInscripcion() {
        return fechaInscripcion;
    }

    public void setFechaInscripcion(LocalDateTime fechaInscripcion) {
        this.fechaInscripcion = fechaInscripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
