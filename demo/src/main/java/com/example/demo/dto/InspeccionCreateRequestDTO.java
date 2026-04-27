package com.example.demo.dto;

import java.time.LocalDate;
import java.util.List;

public class InspeccionCreateRequestDTO {
    private Long tramiteId;
    private Long empresaId;
    private Long usuarioInspectorId;
    private LocalDate fechaProgramada;
    private String hora;
    private String lugar;
    private List<Long> vehiculosSeleccionados;

    public InspeccionCreateRequestDTO() {}

    public Long getTramiteId() { return tramiteId; }
    public void setTramiteId(Long tramiteId) { this.tramiteId = tramiteId; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public Long getUsuarioId() { return usuarioInspectorId; }
    public void setUsuarioId(Long usuarioInspectorId) { this.usuarioInspectorId = usuarioInspectorId; }

    public Long getUsuarioInspectorId() { return usuarioInspectorId; }
    public void setUsuarioInspectorId(Long usuarioInspectorId) { this.usuarioInspectorId = usuarioInspectorId; }

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public List<Long> getVehiculosSeleccionados() { return vehiculosSeleccionados; }
    public void setVehiculosSeleccionados(List<Long> vehiculosSeleccionados) { this.vehiculosSeleccionados = vehiculosSeleccionados; }
}
