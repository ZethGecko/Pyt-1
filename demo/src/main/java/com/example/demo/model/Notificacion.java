package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacion tipo;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_publicacion")
    private LocalDateTime fechaPublicacion;

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "prioridad")
    private Integer prioridad = 0;

    @Column(name = "url_destino")
    private String urlDestino;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "usuario_creador_id", nullable = true)
    private Users usuarioCreador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_destino_id")
    private Users usuarioDestino;

    @Column(name = "para_todos", nullable = false)
    private Boolean paraTodos = false;

    @Column(name = "leido", nullable = false, columnDefinition = "boolean default false")
    private Boolean leido = false;

    public enum TipoNotificacion {
        INFO, WARNING, ERROR, SUCCESS, ANUNCIO
    }

    // Constructors
    public Notificacion() {
        this.fechaCreacion = LocalDateTime.now();
        this.activo = true;
        this.prioridad = 0;
        this.paraTodos = false;
    }

    public Notificacion(String titulo, String mensaje, TipoNotificacion tipo) {
        this();
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public TipoNotificacion getTipo() {
        return tipo;
    }

    public void setTipo(TipoNotificacion tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaPublicacion() {
        return fechaPublicacion;
    }

    public void setFechaPublicacion(LocalDateTime fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Integer getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(Integer prioridad) {
        this.prioridad = prioridad;
    }

    public String getUrlDestino() {
        return urlDestino;
    }

    public void setUrlDestino(String urlDestino) {
        this.urlDestino = urlDestino;
    }

    public Users getUsuarioCreador() {
        return usuarioCreador;
    }

    public void setUsuarioCreador(Users usuarioCreador) {
        this.usuarioCreador = usuarioCreador;
    }

    public Users getUsuarioDestino() {
        return usuarioDestino;
    }

    public void setUsuarioDestino(Users usuarioDestino) {
        this.usuarioDestino = usuarioDestino;
    }

    public Boolean getParaTodos() {
        return paraTodos;
    }

    public void setParaTodos(Boolean paraTodos) {
        this.paraTodos = paraTodos;
    }

    public Boolean getLeido() {
        return leido;
    }

    public void setLeido(Boolean leido) {
        this.leido = leido;
    }
}
