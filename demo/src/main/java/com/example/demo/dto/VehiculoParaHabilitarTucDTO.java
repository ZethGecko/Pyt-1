package com.example.demo.dto;

import java.time.LocalDateTime;

public class VehiculoParaHabilitarTucDTO {
    private Long idVehiculo;
    private Long fichaId;
    private Long inspeccionId;
    private String placa;
    private String marca;
    private String modelo;
    private String color;
    private String categoria;
    private Integer anioFabricacion;
    private Long subtipoTransporteId;
    private Long empresaId;
    private String estado;
    private String resultadoFicha;
    private Boolean estadoFicha;
    private Boolean tieneTucActivo;
    private LocalDateTime fechaVencimientoTuc;
    private String observaciones;

    public Long getIdVehiculo() { return idVehiculo; }
    public void setIdVehiculo(Long idVehiculo) { this.idVehiculo = idVehiculo; }

    public Long getFichaId() { return fichaId; }
    public void setFichaId(Long fichaId) { this.fichaId = fichaId; }

    public Long getInspeccionId() { return inspeccionId; }
    public void setInspeccionId(Long inspeccionId) { this.inspeccionId = inspeccionId; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Integer getAnioFabricacion() { return anioFabricacion; }
    public void setAnioFabricacion(Integer anioFabricacion) { this.anioFabricacion = anioFabricacion; }

    public Long getSubtipoTransporteId() { return subtipoTransporteId; }
    public void setSubtipoTransporteId(Long subtipoTransporteId) { this.subtipoTransporteId = subtipoTransporteId; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getResultadoFicha() { return resultadoFicha; }
    public void setResultadoFicha(String resultadoFicha) { this.resultadoFicha = resultadoFicha; }

    public Boolean getEstadoFicha() { return estadoFicha; }
    public void setEstadoFicha(Boolean estadoFicha) { this.estadoFicha = estadoFicha; }

    public Boolean getTieneTucActivo() { return tieneTucActivo; }
    public void setTieneTucActivo(Boolean tieneTucActivo) { this.tieneTucActivo = tieneTucActivo; }

    public LocalDateTime getFechaVencimientoTuc() { return fechaVencimientoTuc; }
    public void setFechaVencimientoTuc(LocalDateTime fechaVencimientoTuc) { this.fechaVencimientoTuc = fechaVencimientoTuc; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
