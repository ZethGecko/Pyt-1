package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "observaciones_inspeccion")
public class ObservacionesInspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idObservacionesInspeccion;

    private String observacionesInpeccion;

    // Relación con FichaInspeccion
    @ManyToOne
    @JoinColumn(name = "id_ficha_inspeccion", nullable = false)
    private FichaInspeccion fichaInspeccion;

    // Getters y setters
    public Integer getIdObservacionesInspeccion() { return idObservacionesInspeccion; }
    public void setIdObservacionesInspeccion(Integer idObservacionesInspeccion) { 
        this.idObservacionesInspeccion = idObservacionesInspeccion; 
    }

    public String getObservacionesInpeccion() { return observacionesInpeccion; }
    public void setObservacionesInpeccion(String observacionesInpeccion) { 
        this.observacionesInpeccion = observacionesInpeccion; 
    }

    public FichaInspeccion getFichaInspeccion() { return fichaInspeccion; }
    public void setFichaInspeccion(FichaInspeccion fichaInspeccion) { 
        this.fichaInspeccion = fichaInspeccion; 
    }
}
