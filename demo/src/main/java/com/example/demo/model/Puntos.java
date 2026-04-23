package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "puntos")
public class Puntos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPunto;

    private String punto;

    // Relación con Ruta
    @ManyToOne
    @JoinColumn(name = "id_ruta", nullable = false)
    private Ruta ruta;

    // Getters y setters
    public Integer getIdPunto() { return idPunto; }
    public void setIdPunto(Integer idPunto) { this.idPunto = idPunto; }

    public String getPunto() { return punto; }
    public void setPunto(String punto) { this.punto = punto; }

    public Ruta getRuta() { return ruta; }
    public void setRuta(Ruta ruta) { this.ruta = ruta; }
}
