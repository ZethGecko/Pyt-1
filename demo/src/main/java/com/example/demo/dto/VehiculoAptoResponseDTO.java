package com.example.demo.dto;

import com.example.demo.model.EstadoDocumental;
import com.example.demo.model.EstadoInstancia;

import java.time.LocalDateTime;

public class VehiculoAptoResponseDTO {
    private Long idVehiculoApto;
    private VehiculoResponseDTO vehiculo;
    private Long tramiteId;
    private String tramiteCodigo;
    private EstadoDocumental estadoDocumental;
    private String motivoRechazo;
    private String observaciones;
    private LocalDateTime fechaAprobacion;
    private LocalDateTime fechaRechazo;
    private EstadoInstancia estadoInstancia;
    private Integer numeroInstancia;
    private LocalDateTime fechaInstanciaInicio;
    private LocalDateTime fechaInstanciaFin;
    // Campos planos del usuario aprobador (simplificado)
    private Long usuarioAprobadorId;
    private String usuarioAprobadorNombre;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // Getters and Setters
    public Long getIdVehiculoApto() {
        return idVehiculoApto;
    }

    public void setIdVehiculoApto(Long idVehiculoApto) {
        this.idVehiculoApto = idVehiculoApto;
    }

    public VehiculoResponseDTO getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(VehiculoResponseDTO vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Long getTramiteId() {
        return tramiteId;
    }

    public void setTramiteId(Long tramiteId) {
        this.tramiteId = tramiteId;
    }

    public String getTramiteCodigo() {
        return tramiteCodigo;
    }

    public void setTramiteCodigo(String tramiteCodigo) {
        this.tramiteCodigo = tramiteCodigo;
    }

    public EstadoDocumental getEstadoDocumental() {
        return estadoDocumental;
    }

    public void setEstadoDocumental(EstadoDocumental estadoDocumental) {
        this.estadoDocumental = estadoDocumental;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDateTime fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }

    public LocalDateTime getFechaRechazo() {
        return fechaRechazo;
    }

    public void setFechaRechazo(LocalDateTime fechaRechazo) {
        this.fechaRechazo = fechaRechazo;
    }

    public EstadoInstancia getEstadoInstancia() {
        return estadoInstancia;
    }

    public void setEstadoInstancia(EstadoInstancia estadoInstancia) {
        this.estadoInstancia = estadoInstancia;
    }

    public Integer getNumeroInstancia() {
        return numeroInstancia;
    }

    public void setNumeroInstancia(Integer numeroInstancia) {
        this.numeroInstancia = numeroInstancia;
    }

    public LocalDateTime getFechaInstanciaInicio() {
        return fechaInstanciaInicio;
    }

    public void setFechaInstanciaInicio(LocalDateTime fechaInstanciaInicio) {
        this.fechaInstanciaInicio = fechaInstanciaInicio;
    }

    public LocalDateTime getFechaInstanciaFin() {
        return fechaInstanciaFin;
    }

    public void setFechaInstanciaFin(LocalDateTime fechaInstanciaFin) {
        this.fechaInstanciaFin = fechaInstanciaFin;
    }

    public Long getUsuarioAprobadorId() {
        return usuarioAprobadorId;
    }

    public void setUsuarioAprobadorId(Long usuarioAprobadorId) {
        this.usuarioAprobadorId = usuarioAprobadorId;
    }

    public String getUsuarioAprobadorNombre() {
        return usuarioAprobadorNombre;
    }

    public void setUsuarioAprobadorNombre(String usuarioAprobadorNombre) {
        this.usuarioAprobadorNombre = usuarioAprobadorNombre;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
