package com.example.demo.dto;

import java.util.List;

public class FichaInspeccionCreateRequestDTO {
    private Long vehiculoId;
    private Long usuarioInspectorId;
    private Boolean estado;
    private String resultado;
    private String observaciones;
    private List<ParametroInspeccionDTO> parametros;

    public FichaInspeccionCreateRequestDTO() {}

    public Long getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Long vehiculoId) { this.vehiculoId = vehiculoId; }

    public Long getUsuarioInspectorId() { return usuarioInspectorId; }
    public void setUsuarioInspectorId(Long usuarioInspectorId) { this.usuarioInspectorId = usuarioInspectorId; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<ParametroInspeccionDTO> getParametros() { return parametros; }
    public void setParametros(List<ParametroInspeccionDTO> parametros) { this.parametros = parametros; }
}
