package com.example.demo.dto;

import java.util.List;

public class TipoTransporteResponseDTO {
    private Long id;
    private String nombre;
    private Long categoriaId;
    private CategoriaTransporteResponseDTO categoriaTransporte;
    private List<SubtipoTransporteResponseDTO> subtipos;

    public TipoTransporteResponseDTO() {}

    public TipoTransporteResponseDTO(Long id, String nombre, Long categoriaId, CategoriaTransporteResponseDTO categoriaTransporte, List<SubtipoTransporteResponseDTO> subtipos) {
        this.id = id;
        this.nombre = nombre;
        this.categoriaId = categoriaId;
        this.categoriaTransporte = categoriaTransporte;
        this.subtipos = subtipos;
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

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public CategoriaTransporteResponseDTO getCategoriaTransporte() {
        return categoriaTransporte;
    }

    public void setCategoriaTransporte(CategoriaTransporteResponseDTO categoriaTransporte) {
        this.categoriaTransporte = categoriaTransporte;
    }

    public List<SubtipoTransporteResponseDTO> getSubtipos() {
        return subtipos;
    }

    public void setSubtipos(List<SubtipoTransporteResponseDTO> subtipos) {
        this.subtipos = subtipos;
    }
}