package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class EmpresaHabilitadaDTO {
    private Long empresaId;
    private String empresaNombre;
    private String empresaRuc;
    private LocalDateTime fechaEmisionTUC;
    private LocalDateTime fechaVencimientoTUC;
    private String estadoTUC;
    private Integer totalVehiculosHabilitados;
    private List<VehiculoTucDTO> vehiculos;

    public EmpresaHabilitadaDTO() {}

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

    public String getEmpresaRuc() { return empresaRuc; }
    public void setEmpresaRuc(String empresaRuc) { this.empresaRuc = empresaRuc; }

    public LocalDateTime getFechaEmisionTUC() { return fechaEmisionTUC; }
    public void setFechaEmisionTUC(LocalDateTime fechaEmisionTUC) { this.fechaEmisionTUC = fechaEmisionTUC; }

    public LocalDateTime getFechaVencimientoTUC() { return fechaVencimientoTUC; }
    public void setFechaVencimientoTUC(LocalDateTime fechaVencimientoTUC) { this.fechaVencimientoTUC = fechaVencimientoTUC; }

    public String getEstadoTUC() { return estadoTUC; }
    public void setEstadoTUC(String estadoTUC) { this.estadoTUC = estadoTUC; }

    public Integer getTotalVehiculosHabilitados() { return totalVehiculosHabilitados; }
    public void setTotalVehiculosHabilitados(Integer totalVehiculosHabilitados) { this.totalVehiculosHabilitados = totalVehiculosHabilitados; }

    public List<VehiculoTucDTO> getVehiculos() { return vehiculos; }
    public void setVehiculos(List<VehiculoTucDTO> vehiculos) { this.vehiculos = vehiculos; }
}
