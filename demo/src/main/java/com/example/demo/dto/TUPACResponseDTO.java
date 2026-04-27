package com.example.demo.dto;

public class TUPACResponseDTO {
    private Long id;
    private String fechaVigencia;
    private String estado;
    private String categoria;
    private String codigo;
    private String descripcion;

    public TUPACResponseDTO() {}

    public TUPACResponseDTO(Long id, String fechaVigencia, String estado, String categoria, String codigo, String descripcion) {
        this.id = id;
        this.fechaVigencia = fechaVigencia;
        this.estado = estado;
        this.categoria = categoria;
        this.codigo = codigo;
        this.descripcion = descripcion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFechaVigencia() { return fechaVigencia; }
    public void setFechaVigencia(String fechaVigencia) { this.fechaVigencia = fechaVigencia; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
