package com.example.demo.dto;

public class FormatoResponseDTO {
    private Long id;
    private String archivoRuta;
    private String descripcion;
    private String fechaCreacion;

    public FormatoResponseDTO() {}

    public FormatoResponseDTO(Long id, String archivoRuta, String descripcion, String fechaCreacion) {
        this.id = id;
        this.archivoRuta = archivoRuta;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getArchivoRuta() { return archivoRuta; }
    public void setArchivoRuta(String archivoRuta) { this.archivoRuta = archivoRuta; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
