package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspeccion_instancia", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"inspeccion_id", "instancia_tramite_id"})
})
public class InspeccionInstancia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inspeccion_instancia")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instancia_tramite_id", nullable = false)
    private InstanciaTramite instanciaTramite;

    @Column(name = "estado_instancia", length = 50)
    private String estadoInstancia;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_inspeccion")
    private LocalDateTime fechaInspeccion;

    @Column(name = "placa", length = 20)
    private String placa;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Inspeccion getInspeccion() { return inspeccion; }
    public void setInspeccion(Inspeccion inspeccion) { this.inspeccion = inspeccion; }

    public InstanciaTramite getInstanciaTramite() { return instanciaTramite; }
    public void setInstanciaTramite(InstanciaTramite instanciaTramite) { this.instanciaTramite = instanciaTramite; }

    public String getEstadoInstancia() { return estadoInstancia; }
    public void setEstadoInstancia(String estadoInstancia) { this.estadoInstancia = estadoInstancia; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaInspeccion() { return fechaInspeccion; }
    public void setFechaInspeccion(LocalDateTime fechaInspeccion) { this.fechaInspeccion = fechaInspeccion; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}
