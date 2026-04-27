package com.example.demo.dto;

public class RequisitoTUPCDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private String tipoDocumento;
    private Boolean obligatorio;
    private Boolean esExamen;
    private String formatoArchivo;

    public RequisitoTUPCDTO() {}

    public RequisitoTUPCDTO(Long id, String codigo, String descripcion, String tipoDocumento, Boolean obligatorio, Boolean esExamen, String formatoArchivo) {
        this.id = id;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.tipoDocumento = tipoDocumento;
        this.obligatorio = obligatorio;
        this.esExamen = esExamen;
        this.formatoArchivo = formatoArchivo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }
    public Boolean getObligatorio() { return obligatorio; }
    public void setObligatorio(Boolean obligatorio) { this.obligatorio = obligatorio; }
    public Boolean getEsExamen() { return esExamen; }
    public void setEsExamen(Boolean esExamen) { this.esExamen = esExamen; }
    public String getFormatoArchivo() { return formatoArchivo; }
    public void setFormatoArchivo(String formatoArchivo) { this.formatoArchivo = formatoArchivo; }
}
