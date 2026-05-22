package com.example.demo.dto;

import java.time.LocalDateTime;

public class NotificacionResponse {
    private Long id;
    private String titulo;
    private String mensaje;
    private String tipo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaPublicacion;
    private LocalDateTime fechaExpiracion;
    private Boolean activo;
    private Integer prioridad;
    private String urlDestino;
    private Boolean paraTodos;
    private String usuarioCreadorUsername;
    private String usuarioDestinoUsername;
    private Boolean leido;

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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
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

    public Boolean getParaTodos() {
        return paraTodos;
    }

    public void setParaTodos(Boolean paraTodos) {
        this.paraTodos = paraTodos;
    }

    public String getUsuarioCreadorUsername() {
        return usuarioCreadorUsername;
    }

    public void setUsuarioCreadorUsername(String usuarioCreadorUsername) {
        this.usuarioCreadorUsername = usuarioCreadorUsername;
    }

    public String getUsuarioDestinoUsername() {
        return usuarioDestinoUsername;
    }

    public void setUsuarioDestinoUsername(String usuarioDestinoUsername) {
        this.usuarioDestinoUsername = usuarioDestinoUsername;
    }

    public Boolean getLeido() {
        return leido;
    }

    public void setLeido(Boolean leido) {
        this.leido = leido;
    }
}
