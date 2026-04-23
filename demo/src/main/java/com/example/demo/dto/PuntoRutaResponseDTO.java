package com.example.demo.dto;

import java.time.LocalDateTime;

public class PuntoRutaResponseDTO {
    private Long idPuntoRuta;
    private String nombre;
    private String descripcion;
    private Double latitud;
    private Double longitud;
    private Integer orden;
    private String tipo;
    private String estado;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;

    // Información de relaciones
    private Long rutaId;
    private String rutaNombre;
    private String rutaCodigo;
    private Long empresaId;
    private String empresaNombre;
    private Long usuarioRegistraId;
    private String usuarioRegistraNombre;

    public PuntoRutaResponseDTO() {}

    public PuntoRutaResponseDTO(Long idPuntoRuta, String nombre, String descripcion, Double latitud,
                              Double longitud, Integer orden, String tipo, String estado,
                              LocalDateTime fechaRegistro, LocalDateTime fechaActualizacion,
                              Long rutaId, String rutaNombre, String rutaCodigo,
                              Long empresaId, String empresaNombre,
                              Long usuarioRegistraId, String usuarioRegistraNombre) {
        this.idPuntoRuta = idPuntoRuta;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.latitud = latitud;
        this.longitud = longitud;
        this.orden = orden;
        this.tipo = tipo;
        this.estado = estado;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.rutaId = rutaId;
        this.rutaNombre = rutaNombre;
        this.rutaCodigo = rutaCodigo;
        this.empresaId = empresaId;
        this.empresaNombre = empresaNombre;
        this.usuarioRegistraId = usuarioRegistraId;
        this.usuarioRegistraNombre = usuarioRegistraNombre;
    }

    // Getters y setters
    public Long getIdPuntoRuta() { return idPuntoRuta; }
    public void setIdPuntoRuta(Long idPuntoRuta) { this.idPuntoRuta = idPuntoRuta; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Long getRutaId() { return rutaId; }
    public void setRutaId(Long rutaId) { this.rutaId = rutaId; }

    public String getRutaNombre() { return rutaNombre; }
    public void setRutaNombre(String rutaNombre) { this.rutaNombre = rutaNombre; }

    public String getRutaCodigo() { return rutaCodigo; }
    public void setRutaCodigo(String rutaCodigo) { this.rutaCodigo = rutaCodigo; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

    public Long getUsuarioRegistraId() { return usuarioRegistraId; }
    public void setUsuarioRegistraId(Long usuarioRegistraId) { this.usuarioRegistraId = usuarioRegistraId; }

    public String getUsuarioRegistraNombre() { return usuarioRegistraNombre; }
    public void setUsuarioRegistraNombre(String usuarioRegistraNombre) { this.usuarioRegistraNombre = usuarioRegistraNombre; }
}