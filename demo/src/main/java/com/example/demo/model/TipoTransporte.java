package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tipo_transporte")
public class TipoTransporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_transporte")
    private Long idTipoTransporte;

    @Column(name = "nombre", length = 100)
    private String nombre;

    // Relación con CategoriaTransporte
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria_transporte", nullable = false)
    private CategoriaTransporte categoriaTransporte;

    // Relación con SubtipoTransporte
    @OneToMany(mappedBy = "tipoTransporte", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SubtipoTransporte> subtipos;

    // Constructors
    public TipoTransporte() {
    }

    // Getters and setters
    public Long getIdTipoTransporte() {
        return idTipoTransporte;
    }

    public void setIdTipoTransporte(Long idTipoTransporte) {
        this.idTipoTransporte = idTipoTransporte;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public CategoriaTransporte getCategoriaTransporte() {
        return categoriaTransporte;
    }

    public void setCategoriaTransporte(CategoriaTransporte categoriaTransporte) {
        this.categoriaTransporte = categoriaTransporte;
    }

    public List<SubtipoTransporte> getSubtipos() {
        return subtipos;
    }

    public void setSubtipos(List<SubtipoTransporte> subtipos) {
        this.subtipos = subtipos;
    }
}
