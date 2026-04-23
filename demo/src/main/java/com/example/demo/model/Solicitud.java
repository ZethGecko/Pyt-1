package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "solicitud")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @Column(name = "numero_orden")
    private Integer numeroOrden;

    @Column(name = "placa", length = 20)
    private String placa;

    @Column(name = "codigo", length = 50)
    private String codigo;

    @Column(name = "nota", columnDefinition = "TEXT")
    private String nota;

    @Column(name = "estado_solicitud", length = 20)
    private String estadoSolicitud;

    @Column(name = "tipo_solicitud", length = 20, nullable = false)
    private String tipoSolicitud;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(name = "fecha_rechazo")
    private LocalDateTime fechaRechazo;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Relación con Expediente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente", nullable = false)
    private Expediente expediente;

    // Relación con Vehiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo", nullable = false)
    private Vehiculo vehiculo;

    // Relación con Usuario que aprueba
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_aprueba")
    private Users usuarioAprobado;

    // Relación con Usuario que rechaza
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_rechaza")
    private Users usuarioRechaza;

    // Relación con ObservacionSolicitud (una solicitud puede tener muchas observaciones)
    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL)
    private List<ObservacionSolicitud> observacionesSolicitudes;

    // Getters and setters
    public Long getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public Integer getNumeroOrden() {
        return numeroOrden;
    }

    public void setNumeroOrden(Integer numeroOrden) {
        this.numeroOrden = numeroOrden;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNota() {
        return nota;
    }

    public void setNota(String nota) {
        this.nota = nota;
    }

    public String getEstadoSolicitud() {
        return estadoSolicitud;
    }

    public void setEstadoSolicitud(String estadoSolicitud) {
        this.estadoSolicitud = estadoSolicitud;
    }

    public String getTipoSolicitud() {
        return tipoSolicitud;
    }

    public void setTipoSolicitud(String tipoSolicitud) {
        this.tipoSolicitud = tipoSolicitud;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public LocalDateTime getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDateTime fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }

    public LocalDateTime getFechaRechazo() {
        return fechaRechazo;
    }

    public void setFechaRechazo(LocalDateTime fechaRechazo) {
        this.fechaRechazo = fechaRechazo;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Expediente getExpediente() {
        return expediente;
    }

    public void setExpediente(Expediente expediente) {
        this.expediente = expediente;
    }

    public Vehiculo getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(Vehiculo vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Users getUsuarioAprobado() {
        return usuarioAprobado;
    }

    public void setUsuarioAprobado(Users usuarioAprobado) {
        this.usuarioAprobado = usuarioAprobado;
    }

    public Users getUsuarioRechaza() {
        return usuarioRechaza;
    }

    public void setUsuarioRechaza(Users usuarioRechaza) {
        this.usuarioRechaza = usuarioRechaza;
    }

    public List<ObservacionSolicitud> getObservacionesSolicitudes() {
        return observacionesSolicitudes;
    }

    public void setObservacionesSolicitudes(List<ObservacionSolicitud> observacionesSolicitudes) {
        this.observacionesSolicitudes = observacionesSolicitudes;
    }
}
