package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "observaciones")
public class Observaciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idObservaciones;

    private String observaciones;

    // Relación con Solicitud
    @OneToOne
    @JoinColumn(name = "id_solicitud", nullable = false)
    private Solicitud solicitud;

    // Getters y setters
    public Integer getIdObservaciones() { return idObservaciones; }
    public void setIdObservaciones(Integer idObservaciones) { this.idObservaciones = idObservaciones; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Solicitud getSolicitud() { return solicitud; }
    public void setSolicitud(Solicitud solicitud) { this.solicitud = solicitud; }
}
