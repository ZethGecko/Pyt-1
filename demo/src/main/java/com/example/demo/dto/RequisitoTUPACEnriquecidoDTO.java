package com.example.demo.dto;

public class RequisitoTUPACEnriquecidoDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private Boolean obligatorio;
    private String tipoDocumento;
    private Boolean esExamen;
    private String observaciones;
    private Boolean activo;
    private Integer diasValidez;
    private Long tupacId;
    private String tupacCodigo;
    private String tupacDescripcion;
    private String tupacCategoria;
    private String tupacEstado;
    private Long formatoId;
    private String formatoDescripcion;
    private String formatoArchivoRuta;
    private Integer totalDocumentos;
    private Integer documentosAprobados;
    private Integer documentosPendientes;
    private Integer gruposProgramados;

    public RequisitoTUPACEnriquecidoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Boolean getObligatorio() { return obligatorio; }
    public void setObligatorio(Boolean obligatorio) { this.obligatorio = obligatorio; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public Boolean getEsExamen() { return esExamen; }
    public void setEsExamen(Boolean esExamen) { this.esExamen = esExamen; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Integer getDiasValidez() { return diasValidez; }
    public void setDiasValidez(Integer diasValidez) { this.diasValidez = diasValidez; }

    public Long getTupacId() { return tupacId; }
    public void setTupacId(Long tupacId) { this.tupacId = tupacId; }

    public String getTupacCodigo() { return tupacCodigo; }
    public void setTupacCodigo(String tupacCodigo) { this.tupacCodigo = tupacCodigo; }

    public String getTupacDescripcion() { return tupacDescripcion; }
    public void setTupacDescripcion(String tupacDescripcion) { this.tupacDescripcion = tupacDescripcion; }

    public String getTupacCategoria() { return tupacCategoria; }
    public void setTupacCategoria(String tupacCategoria) { this.tupacCategoria = tupacCategoria; }

    public String getTupacEstado() { return tupacEstado; }
    public void setTupacEstado(String tupacEstado) { this.tupacEstado = tupacEstado; }

    public Long getFormatoId() { return formatoId; }
    public void setFormatoId(Long formatoId) { this.formatoId = formatoId; }

    public String getFormatoDescripcion() { return formatoDescripcion; }
    public void setFormatoDescripcion(String formatoDescripcion) { this.formatoDescripcion = formatoDescripcion; }

    public String getFormatoArchivoRuta() { return formatoArchivoRuta; }
    public void setFormatoArchivoRuta(String formatoArchivoRuta) { this.formatoArchivoRuta = formatoArchivoRuta; }

    public Integer getTotalDocumentos() { return totalDocumentos; }
    public void setTotalDocumentos(Integer totalDocumentos) { this.totalDocumentos = totalDocumentos; }

    public Integer getDocumentosAprobados() { return documentosAprobados; }
    public void setDocumentosAprobados(Integer documentosAprobados) { this.documentosAprobados = documentosAprobados; }

    public Integer getDocumentosPendientes() { return documentosPendientes; }
    public void setDocumentosPendientes(Integer documentosPendientes) { this.documentosPendientes = documentosPendientes; }

    public Integer getGruposProgramados() { return gruposProgramados; }
    public void setGruposProgramados(Integer gruposProgramados) { this.gruposProgramados = gruposProgramados; }
}
