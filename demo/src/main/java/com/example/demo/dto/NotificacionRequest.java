package com.example.demo.dto;

import java.time.LocalDateTime;
import com.example.demo.model.Notificacion;

public class NotificacionRequest {
    private String titulo;
    private String mensaje;
    private Notificacion.TipoNotificacion tipo;
    private LocalDateTime fechaPublicacion;
    private LocalDateTime fechaExpiracion;
    private Integer prioridad;
    private String urlDestino;
    private Boolean paraTodos;
    private Boolean activo;
    private Long usuarioDestinoId;

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

    public Notificacion.TipoNotificacion getTipo() {
        return tipo;
    }

    public void setTipo(Notificacion.TipoNotificacion tipo) {
        this.tipo = tipo;
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

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Long getUsuarioDestinoId() {
        return usuarioDestinoId;
    }

    public void setUsuarioDestinoId(Long usuarioDestinoId) {
        this.usuarioDestinoId = usuarioDestinoId;
    }
}
