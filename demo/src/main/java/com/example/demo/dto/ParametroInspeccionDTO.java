package com.example.demo.dto;

public class ParametroInspeccionDTO {
    private Integer id; // null para nuevo, id existente para editar
    private String parametro;
    private String observacion;
    private Long requisitoTUPACId; // opcional, referencia al requisito original

    public ParametroInspeccionDTO() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getParametro() { return parametro; }
    public void setParametro(String parametro) { this.parametro = parametro; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Long getRequisitoTUPACId() { return requisitoTUPACId; }
    public void setRequisitoTUPACId(Long requisitoTUPACId) { this.requisitoTUPACId = requisitoTUPACId; }
}
