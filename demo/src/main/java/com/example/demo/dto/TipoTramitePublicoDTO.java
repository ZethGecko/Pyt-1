package com.example.demo.dto;

import java.util.List;

public class TipoTramitePublicoDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private String categoriaTramite;
    private String tupacCodigo;
    private String tupacDescripcion;
    private List<RequisitoTUPCDTO> requisitos;

    public TipoTramitePublicoDTO() {}

    public TipoTramitePublicoDTO(Long id, String codigo, String descripcion, String categoriaTramite, String tupacCodigo, String tupacDescripcion, List<RequisitoTUPCDTO> requisitos) {
        this.id = id;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.categoriaTramite = categoriaTramite;
        this.tupacCodigo = tupacCodigo;
        this.tupacDescripcion = tupacDescripcion;
        this.requisitos = requisitos;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getCategoriaTramite() { return categoriaTramite; }
    public void setCategoriaTramite(String categoriaTramite) { this.categoriaTramite = categoriaTramite; }
    public String getTupacCodigo() { return tupacCodigo; }
    public void setTupacCodigo(String tupacCodigo) { this.tupacCodigo = tupacCodigo; }
    public String getTupacDescripcion() { return tupacDescripcion; }
    public void setTupacDescripcion(String tupacDescripcion) { this.tupacDescripcion = tupacDescripcion; }
    public List<RequisitoTUPCDTO> getRequisitos() { return requisitos; }
    public void setRequisitos(List<RequisitoTUPCDTO> requisitos) { this.requisitos = requisitos; }
}
