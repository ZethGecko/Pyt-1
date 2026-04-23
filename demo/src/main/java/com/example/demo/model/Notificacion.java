package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Long idNotificacion;

    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_destinatario", nullable = false)
    private Users usuarioDestinatario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_remitente")
    private Users usuarioRemitente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_destino")
    private Departamento departamentoDestino;

    @Column(name = "tramite")
    private Long tramite;

    @Column(name = "tipo_notificacion", length = 50, nullable = false)
    private String tipoNotificacion;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Column(name = "prioridad")
    private Integer prioridad;

    @Column(name = "asunto", length = 200, nullable = false)
    private String asunto;

    @Column(name = "mensaje", columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(name = "accion_requerida", length = 100)
    private String accionRequerida;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_leida")
    private LocalDateTime fechaLeida;

    @Column(name = "fecha_limite")
    private LocalDateTime fechaLimite;

    // Getters and setters
    public Long getIdNotificacion() {
        return idNotificacion;
    }

    public void setIdNotificacion(Long idNotificacion) {
        this.idNotificacion = idNotificacion;
    }

    public Users getUsuarioDestinatario() {
        return usuarioDestinatario;
    }

    public void setUsuarioDestinatario(Users usuarioDestinatario) {
        this.usuarioDestinatario = usuarioDestinatario;
    }

    public Users getUsuarioRemitente() {
        return usuarioRemitente;
    }

    public void setUsuarioRemitente(Users usuarioRemitente) {
        this.usuarioRemitente = usuarioRemitente;
    }

    public Departamento getDepartamentoDestino() {
        return departamentoDestino;
    }

    public void setDepartamentoDestino(Departamento departamentoDestino) {
        this.departamentoDestino = departamentoDestino;
    }

    public Long getTramite() {
        return tramite;
    }

    public void setTramite(Long tramite) {
        this.tramite = tramite;
    }

    public String getTipoNotificacion() {
        return tipoNotificacion;
    }

    public void setTipoNotificacion(String tipoNotificacion) {
        this.tipoNotificacion = tipoNotificacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(Integer prioridad) {
        this.prioridad = prioridad;
    }

    public String getAsunto() {
        return asunto;
    }

    public void setAsunto(String asunto) {
        this.asunto = asunto;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getAccionRequerida() {
        return accionRequerida;
    }

    public void setAccionRequerida(String accionRequerida) {
        this.accionRequerida = accionRequerida;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaLeida() {
        return fechaLeida;
    }

    public void setFechaLeida(LocalDateTime fechaLeida) {
        this.fechaLeida = fechaLeida;
    }

    public LocalDateTime getFechaLimite() {
        return fechaLimite;
    }

    public void setFechaLimite(LocalDateTime fechaLimite) {
        this.fechaLimite = fechaLimite;
    }
}
