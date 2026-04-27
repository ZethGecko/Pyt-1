package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FichaInspeccionResponseDTO {
    private Long idFichaInspeccion;
    private Long vehiculoId;
    private String vehiculoPlaca;
    private String vehiculoMarca;
    private String vehiculoModelo;
    private Boolean estado;
    private String resultado;
    private String observaciones;
    private LocalDateTime fechaInspeccion;
    private List<ParametroInspeccionResponseDTO> parametros;

    public FichaInspeccionResponseDTO() {}

    public Long getIdFichaInspeccion() { return idFichaInspeccion; }
    public void setIdFichaInspeccion(Long idFichaInspeccion) { this.idFichaInspeccion = idFichaInspeccion; }

    public Long getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Long vehiculoId) { this.vehiculoId = vehiculoId; }

    public String getVehiculoPlaca() { return vehiculoPlaca; }
    public void setVehiculoPlaca(String vehiculoPlaca) { this.vehiculoPlaca = vehiculoPlaca; }

    public String getVehiculoMarca() { return vehiculoMarca; }
    public void setVehiculoMarca(String vehiculoMarca) { this.vehiculoMarca = vehiculoMarca; }

    public String getVehiculoModelo() { return vehiculoModelo; }
    public void setVehiculoModelo(String vehiculoModelo) { this.vehiculoModelo = vehiculoModelo; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaInspeccion() { return fechaInspeccion; }
    public void setFechaInspeccion(LocalDateTime fechaInspeccion) { this.fechaInspeccion = fechaInspeccion; }

    public List<ParametroInspeccionResponseDTO> getParametros() { return parametros; }
    public void setParametros(List<ParametroInspeccionResponseDTO> parametros) { this.parametros = parametros; }
}
