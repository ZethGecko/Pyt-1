package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RutaResponseDTO {
    private Long idRuta;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Double distanciaKm;
    private Integer tiempoEstimadoMinutos;
    private String estado;
    private String tipo;
    private String observaciones;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;

    // Información de relaciones
    private Long empresaId;
    private String empresaNombre;
    private String empresaRuc;
    private Long gerenteResponsableId;
    private String gerenteResponsableNombre;
    private Long usuarioRegistraId;
    private String usuarioRegistraNombre;

    // Lista de puntos de ruta
    private List<PuntoRutaResponseDTO> puntosRuta;

    public RutaResponseDTO() {}

    public RutaResponseDTO(Long idRuta, String codigo, String nombre, String descripcion,
                          Double distanciaKm, Integer tiempoEstimadoMinutos, String estado,
                          String tipo, String observaciones, LocalDateTime fechaRegistro,
                          LocalDateTime fechaActualizacion, Long empresaId, String empresaNombre,
                          String empresaRuc, Long gerenteResponsableId, String gerenteResponsableNombre,
                          Long usuarioRegistraId, String usuarioRegistraNombre,
                          List<PuntoRutaResponseDTO> puntosRuta) {
        this.idRuta = idRuta;
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.distanciaKm = distanciaKm;
        this.tiempoEstimadoMinutos = tiempoEstimadoMinutos;
        this.estado = estado;
        this.tipo = tipo;
        this.observaciones = observaciones;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.empresaId = empresaId;
        this.empresaNombre = empresaNombre;
        this.empresaRuc = empresaRuc;
        this.gerenteResponsableId = gerenteResponsableId;
        this.gerenteResponsableNombre = gerenteResponsableNombre;
        this.usuarioRegistraId = usuarioRegistraId;
        this.usuarioRegistraNombre = usuarioRegistraNombre;
        this.puntosRuta = puntosRuta;
    }

    // Getters y setters
    public Long getIdRuta() { return idRuta; }
    public void setIdRuta(Long idRuta) { this.idRuta = idRuta; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(Double distanciaKm) { this.distanciaKm = distanciaKm; }

    public Integer getTiempoEstimadoMinutos() { return tiempoEstimadoMinutos; }
    public void setTiempoEstimadoMinutos(Integer tiempoEstimadoMinutos) { this.tiempoEstimadoMinutos = tiempoEstimadoMinutos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

    public String getEmpresaRuc() { return empresaRuc; }
    public void setEmpresaRuc(String empresaRuc) { this.empresaRuc = empresaRuc; }

    public Long getGerenteResponsableId() { return gerenteResponsableId; }
    public void setGerenteResponsableId(Long gerenteResponsableId) { this.gerenteResponsableId = gerenteResponsableId; }

    public String getGerenteResponsableNombre() { return gerenteResponsableNombre; }
    public void setGerenteResponsableNombre(String gerenteResponsableNombre) { this.gerenteResponsableNombre = gerenteResponsableNombre; }

    public Long getUsuarioRegistraId() { return usuarioRegistraId; }
    public void setUsuarioRegistraId(Long usuarioRegistraId) { this.usuarioRegistraId = usuarioRegistraId; }

    public String getUsuarioRegistraNombre() { return usuarioRegistraNombre; }
    public void setUsuarioRegistraNombre(String usuarioRegistraNombre) { this.usuarioRegistraNombre = usuarioRegistraNombre; }

    public List<PuntoRutaResponseDTO> getPuntosRuta() { return puntosRuta; }
    public void setPuntosRuta(List<PuntoRutaResponseDTO> puntosRuta) { this.puntosRuta = puntosRuta; }
}