package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "observacion_solicitud")
public class ObservacionSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_observaciones_solicitud")
    private Long idObservacionesSolicitud;

    // Relación con Solicitud (obligatoria)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud", nullable = false)
    private Solicitud solicitud;

    // Relación con Tramite (opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tramite")
    private Tramite tramite;

    // Relación con RequisitoTUPAC (opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisito")
    private RequisitoTUPAC requisito;

    // Relación con Usuario observador (obligatoria)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_observador", nullable = false)
    private Users usuarioObservador;

    // Relación con Usuario que subsana (opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_subsana")
    private Users usuarioSubsana;

    @Column(name = "tipo", length = 20, nullable = false)
    private String tipo;

    @Column(name = "severidad", length = 10, nullable = false)
    private String severidad;

    @Column(name = "estado", length = 15)
    private String estado;

    @Column(name = "descripcion", columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "comentario_subsanacion", columnDefinition = "TEXT")
    private String comentarioSubsanacion;

    @Column(name = "fecha_observacion")
    private LocalDateTime fechaObservacion;

    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Getters and setters
    public Long getIdObservacionesSolicitud() {
        return idObservacionesSolicitud;
    }

    public void setIdObservacionesSolicitud(Long idObservacionesSolicitud) {
        this.idObservacionesSolicitud = idObservacionesSolicitud;
    }

    public Solicitud getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Solicitud solicitud) {
        this.solicitud = solicitud;
    }

    public Tramite getTramite() {
        return tramite;
    }

    public void setTramite(Tramite tramite) {
        this.tramite = tramite;
    }

    public RequisitoTUPAC getRequisito() {
        return requisito;
    }

    public void setRequisito(RequisitoTUPAC requisito) {
        this.requisito = requisito;
    }

    public Users getUsuarioObservador() {
        return usuarioObservador;
    }

    public void setUsuarioObservador(Users usuarioObservador) {
        this.usuarioObservador = usuarioObservador;
    }

    public Users getUsuarioSubsana() {
        return usuarioSubsana;
    }

    public void setUsuarioSubsana(Users usuarioSubsana) {
        this.usuarioSubsana = usuarioSubsana;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getSeveridad() {
        return severidad;
    }

    public void setSeveridad(String severidad) {
        this.severidad = severidad;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getComentarioSubsanacion() {
        return comentarioSubsanacion;
    }

    public void setComentarioSubsanacion(String comentarioSubsanacion) {
        this.comentarioSubsanacion = comentarioSubsanacion;
    }

    public LocalDateTime getFechaObservacion() {
        return fechaObservacion;
    }

    public void setFechaObservacion(LocalDateTime fechaObservacion) {
        this.fechaObservacion = fechaObservacion;
    }

    public LocalDateTime getFechaSubsanacion() {
        return fechaSubsanacion;
    }

    public void setFechaSubsanacion(LocalDateTime fechaSubsanacion) {
        this.fechaSubsanacion = fechaSubsanacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
