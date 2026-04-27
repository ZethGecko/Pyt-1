package com.example.demo.dto;

import java.time.LocalDateTime;

public class VehiculoTucDTO {
    private Long idVehiculo;
    private String placa;
    private String marca;
    private String modelo;
    private LocalDateTime fechaEmisionTUC;
    private LocalDateTime fechaVencimientoTUC;

    public VehiculoTucDTO() {}

    public Long getIdVehiculo() { return idVehiculo; }
    public void setIdVehiculo(Long idVehiculo) { this.idVehiculo = idVehiculo; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public LocalDateTime getFechaEmisionTUC() { return fechaEmisionTUC; }
    public void setFechaEmisionTUC(LocalDateTime fechaEmisionTUC) { this.fechaEmisionTUC = fechaEmisionTUC; }

    public LocalDateTime getFechaVencimientoTUC() { return fechaVencimientoTUC; }
    public void setFechaVencimientoTUC(LocalDateTime fechaVencimientoTUC) { this.fechaVencimientoTUC = fechaVencimientoTUC; }
}
