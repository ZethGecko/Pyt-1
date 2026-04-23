package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "estilo_ruta")
public class EstiloRuta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estilo")
    private Long idEstilo;

    @Column(name = "ruta_id", nullable = false)
    private Long rutaId;

    @Column(name = "tipo_estilo", length = 20, nullable = false)
    private String tipoEstilo;

    @Column(name = "color", length = 10, nullable = false)
    private String color;

    @Column(name = "ancho_linea", nullable = false)
    private Double anchoLinea;

    @Column(name = "opacidad")
    private Double opacidad;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "url_icono", length = 500)
    private String urlIcono;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ruta_id", insertable = false, updatable = false)
    private Ruta ruta;

    // Getters y setters
    public Long getIdEstilo() { return idEstilo; }
    public void setIdEstilo(Long idEstilo) { this.idEstilo = idEstilo; }

    public Long getRutaId() { return rutaId; }
    public void setRutaId(Long rutaId) { this.rutaId = rutaId; }

    public String getTipoEstilo() { return tipoEstilo; }
    public void setTipoEstilo(String tipoEstilo) { this.tipoEstilo = tipoEstilo; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getAnchoLinea() { return anchoLinea; }
    public void setAnchoLinea(Double anchoLinea) { this.anchoLinea = anchoLinea; }

    public Double getOpacidad() { return opacidad; }
    public void setOpacidad(Double opacidad) { this.opacidad = opacidad; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getUrlIcono() { return urlIcono; }
    public void setUrlIcono(String urlIcono) { this.urlIcono = urlIcono; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Ruta getRuta() { return ruta; }
    public void setRuta(Ruta ruta) { this.ruta = ruta; }
}
