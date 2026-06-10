package com.example.demo.dto;

import java.util.List;

public class HabilitacionTucRequestDTO {
    private Long empresaId;
    private Long inspeccionId;
    private String tipo;
    private Integer anioVencimiento;
    private List<VehiculoHabilitacionTucRequestDTO> vehiculos;

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public Long getInspeccionId() { return inspeccionId; }
    public void setInspeccionId(Long inspeccionId) { this.inspeccionId = inspeccionId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getAnioVencimiento() { return anioVencimiento; }
    public void setAnioVencimiento(Integer anioVencimiento) { this.anioVencimiento = anioVencimiento; }

    public List<VehiculoHabilitacionTucRequestDTO> getVehiculos() { return vehiculos; }
    public void setVehiculos(List<VehiculoHabilitacionTucRequestDTO> vehiculos) { this.vehiculos = vehiculos; }
}
