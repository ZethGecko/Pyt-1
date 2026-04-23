package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "subtipo_transporte")
public class SubtipoTransporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSubtipoTransporte;

    private String nombre; // urbano, interurbano, taxis, estudiantes, mudanzas, etc.

    // Relación con TipoTransporte
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_transporte", nullable = false)
    @JsonIgnore
    private TipoTransporte tipoTransporte;

    // Constructors
    public SubtipoTransporte() {
    }

    // Getters and setters
    public Long getIdSubtipoTransporte() {
        return idSubtipoTransporte;
    }

    public void setIdSubtipoTransporte(Long idSubtipoTransporte) {
        this.idSubtipoTransporte = idSubtipoTransporte;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public TipoTransporte getTipoTransporte() {
        return tipoTransporte;
    }

    public void setTipoTransporte(TipoTransporte tipoTransporte) {
        this.tipoTransporte = tipoTransporte;
    }
}
