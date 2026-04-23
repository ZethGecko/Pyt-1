package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "departamento")
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_departamento")
    private Long idDepartamento;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Users responsable;

    @OneToMany(mappedBy = "departamentoActual", cascade = CascadeType.ALL)
    private List<Tramite> tramites;

    @OneToMany(mappedBy = "departamentoOrigen", cascade = CascadeType.ALL)
    private List<HistorialTramite> historialesOrigen;

    @OneToMany(mappedBy = "departamentoDestino", cascade = CascadeType.ALL)
    private List<HistorialTramite> historialesDestino;

    @OneToMany(mappedBy = "departamentoDestino", cascade = CascadeType.ALL)
    private List<Notificacion> notificaciones;

    // Getters y setters
    public Long getIdDepartamento() { return idDepartamento; }
    public void setIdDepartamento(Long idDepartamento) { this.idDepartamento = idDepartamento; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Users getResponsable() { return responsable; }
    public void setResponsable(Users responsable) { this.responsable = responsable; }

    public List<Tramite> getTramites() { return tramites; }
    public void setTramites(List<Tramite> tramites) { this.tramites = tramites; }

    public List<HistorialTramite> getHistorialesDestino() { return historialesDestino; }
    public void setHistorialesDestino(List<HistorialTramite> historialesDestino) { this.historialesDestino = historialesDestino; }

    public List<HistorialTramite> getHistorialesOrigen() { return historialesOrigen; }
    public void setHistorialesOrigen(List<HistorialTramite> historialesOrigen) { this.historialesOrigen = historialesOrigen; }

    public List<Notificacion> getNotificaciones() { return notificaciones; }
    public void setNotificaciones(List<Notificacion> notificaciones) { this.notificaciones = notificaciones; }
}
