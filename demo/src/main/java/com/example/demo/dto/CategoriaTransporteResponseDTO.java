package com.example.demo.dto;

public class CategoriaTransporteResponseDTO {
    private Long id;
    private String nombre;

    public CategoriaTransporteResponseDTO() {}

    public CategoriaTransporteResponseDTO(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}