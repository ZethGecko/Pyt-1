package com.example.demo.dto;

public class ParametroInspeccionResponseDTO {
    private Integer idParametros;
    private String parametro;
    private String observacion;
    private Long requisitoTUPACId;

    public ParametroInspeccionResponseDTO() {}

    public Integer getIdParametros() { return idParametros; }
    public void setIdParametros(Integer idParametros) { this.idParametros = idParametros; }

    public String getParametro() { return parametro; }
    public void setParametro(String parametro) { this.parametro = parametro; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Long getRequisitoTUPACId() { return requisitoTUPACId; }
    public void setRequisitoTUPACId(Long requisitoTUPACId) { this.requisitoTUPACId = requisitoTUPACId; }
}
