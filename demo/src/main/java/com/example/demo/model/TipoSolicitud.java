package com.example.demo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tipo_solicitud")
public class TipoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tiposolicitud")
    private Integer idTipoSolicitud;

    @Column(name = "categoria", length = 50)
    private String tipo; // Mantenemos el nombre del campo "tipo" para compatibilidad, pero se mapea a "categoria"

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "es_activo")
    private Boolean activo;

    // Campos de auditoría (opcionales)
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Relación con TUPAC deshabilitada por problema de columna
    // @OneToMany(mappedBy = "tipoSolicitud", cascade = CascadeType.ALL)
    // private java.util.List<TUPAC> tupacs;

    // Getters y setters
    public Integer getIdTipoSolicitud() { return idTipoSolicitud; }
    public void setIdTipoSolicitud(Integer idTipoSolicitud) { this.idTipoSolicitud = idTipoSolicitud; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    // Getter/Setter deshabilitados para tupacs
    // public java.util.List<TUPAC> getTupacs() { return null; }
    // public void setTupacs(java.util.List<TUPAC> tupacs) {}
}
