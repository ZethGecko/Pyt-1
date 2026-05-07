package com.example.demo.dto;

import java.time.LocalDateTime;

public class SiguienteInstanciaPendienteResponse {
    private Long idInspeccionInstancia;
    private Long idInstancia;
    private String identificador;
    private String placa;
    private String estadoInstancia;

    public SiguienteInstanciaPendienteResponse() {}

    public Long getIdInspeccionInstancia() {
        return idInspeccionInstancia;
    }

    public void setIdInspeccionInstancia(Long idInspeccionInstancia) {
        this.idInspeccionInstancia = idInspeccionInstancia;
    }

    public Long getIdInstancia() {
        return idInstancia;
    }

    public void setIdInstancia(Long idInstancia) {
        this.idInstancia = idInstancia;
    }

    public String getIdentificador() {
        return identificador;
    }

    public void setIdentificador(String identificador) {
        this.identificador = identificador;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getEstadoInstancia() {
        return estadoInstancia;
    }

    public void setEstadoInstancia(String estadoInstancia) {
        this.estadoInstancia = estadoInstancia;
    }
}
