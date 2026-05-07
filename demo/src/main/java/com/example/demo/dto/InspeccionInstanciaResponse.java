package com.example.demo.dto;

import java.time.LocalDateTime;

public class InspeccionInstanciaResponse {
    private Long idInspeccionInstancia;
    private Long idInstancia;
    private Long tramiteId;
    private String identificador;
    private String codigoRut;
    private String estadoInstancia;
    private String placa;
    private String observaciones;
    private LocalDateTime fechaInspeccion;
    private Long fichaId;
    private String fichaResultado;
    private Boolean fichaEstado;

    public InspeccionInstanciaResponse() {}

    public Long getIdInspeccionInstancia() { return idInspeccionInstancia; }
    public void setIdInspeccionInstancia(Long idInspeccionInstancia) { this.idInspeccionInstancia = idInspeccionInstancia; }

    public Long getIdInstancia() { return idInstancia; }
    public void setIdInstancia(Long idInstancia) { this.idInstancia = idInstancia; }

    public String getIdentificador() { return identificador; }
    public void setIdentificador(String identificador) { this.identificador = identificador; }

    public String getCodigoRut() { return codigoRut; }
    public void setCodigoRut(String codigoRut) { this.codigoRut = codigoRut; }

    public String getEstadoInstancia() { return estadoInstancia; }
    public void setEstadoInstancia(String estadoInstancia) { this.estadoInstancia = estadoInstancia; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaInspeccion() { return fechaInspeccion; }
    public void setFechaInspeccion(LocalDateTime fechaInspeccion) { this.fechaInspeccion = fechaInspeccion; }

    public Long getFichaId() { return fichaId; }
    public void setFichaId(Long fichaId) { this.fichaId = fichaId; }

    public String getFichaResultado() { return fichaResultado; }
    public void setFichaResultado(String fichaResultado) { this.fichaResultado = fichaResultado; }

    public Boolean getFichaEstado() { return fichaEstado; }
    public void setFichaEstado(Boolean fichaEstado) { this.fichaEstado = fichaEstado; }

    public Long getTramiteId() { return tramiteId; }
    public void setTramiteId(Long tramiteId) { this.tramiteId = tramiteId; }
}
