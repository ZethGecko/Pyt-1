package com.example.demo.dto;

import com.example.demo.model.EstadoDocumental;

import java.time.LocalDateTime;

public class VehiculoAptoProgresoDTO {
    private Long tramiteId;
    private String tramiteCodigo;
    private Long totalVehiculos;
    private Long vehiculosAptos;
    private Long vehiculosObservados;
    private Long vehiculosNoAptos;
    private Long vehiculosPendientes;
    private Double porcentajeAprobacion;
    private Boolean todosAprobados;
    private EstadoDocumental estadoGeneralTramite;
    private LocalDateTime ultimaActualizacion;

    // Getters and Setters
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

    public Long getTotalVehiculos() {
        return totalVehiculos;
    }

    public void setTotalVehiculos(Long totalVehiculos) {
        this.totalVehiculos = totalVehiculos;
    }

    public Long getVehiculosAptos() {
        return vehiculosAptos;
    }

    public void setVehiculosAptos(Long vehiculosAptos) {
        this.vehiculosAptos = vehiculosAptos;
    }

    public Long getVehiculosNoAptos() {
        return vehiculosNoAptos;
    }

    public void setVehiculosNoAptos(Long vehiculosNoAptos) {
        this.vehiculosNoAptos = vehiculosNoAptos;
    }

    public Long getVehiculosObservados() {
        return vehiculosObservados;
    }

    public void setVehiculosObservados(Long vehiculosObservados) {
        this.vehiculosObservados = vehiculosObservados;
    }

    public Long getVehiculosPendientes() {
        return vehiculosPendientes;
    }

    public void setVehiculosPendientes(Long vehiculosPendientes) {
        this.vehiculosPendientes = vehiculosPendientes;
    }

    public Double getPorcentajeAprobacion() {
        return porcentajeAprobacion;
    }

    public void setPorcentajeAprobacion(Double porcentajeAprobacion) {
        this.porcentajeAprobacion = porcentajeAprobacion;
    }

    public Boolean getTodosAprobados() {
        return todosAprobados;
    }

    public void setTodosAprobados(Boolean todosAprobados) {
        this.todosAprobados = todosAprobados;
    }

    public EstadoDocumental getEstadoGeneralTramite() {
        return estadoGeneralTramite;
    }

    public void setEstadoGeneralTramite(EstadoDocumental estadoGeneralTramite) {
        this.estadoGeneralTramite = estadoGeneralTramite;
    }

    public LocalDateTime getUltimaActualizacion() {
        return ultimaActualizacion;
    }

    public void setUltimaActualizacion(LocalDateTime ultimaActualizacion) {
        this.ultimaActualizacion = ultimaActualizacion;
    }
}
