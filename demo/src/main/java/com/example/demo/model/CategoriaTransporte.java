package com.example.demo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "categoria_transporte")
public class CategoriaTransporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_transporte")
    private Long idCategoriaTransporte;

    @Column(name = "nombre", length = 100)
    private String nombre;

    // Relación con TipoTransporte
    @OneToMany(mappedBy = "categoriaTransporte", cascade = CascadeType.ALL)
    private List<TipoTransporte> tiposTransporte;

    // Constructors
    public CategoriaTransporte() {
    }

    // Getters and setters
    public Long getIdCategoriaTransporte() {
        return idCategoriaTransporte;
    }

    public void setIdCategoriaTransporte(Long idCategoriaTransporte) {
        this.idCategoriaTransporte = idCategoriaTransporte;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<TipoTransporte> getTiposTransporte() {
        return tiposTransporte;
    }

    public void setTiposTransporte(List<TipoTransporte> tiposTransporte) {
        this.tiposTransporte = tiposTransporte;
    }
}
