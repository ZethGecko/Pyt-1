package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "formatos")
public class Formatos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formato")
    private Long idFormato;

    @Column(name = "archivo_ruta", length = 255, nullable = false)
    private String archivoRuta;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    // Relaciones
    @OneToMany(mappedBy = "formato", cascade = CascadeType.ALL)
    private java.util.List<RequisitoTUPAC> requisitos;

    @OneToMany(mappedBy = "formato", cascade = CascadeType.ALL)
    private java.util.List<Publicacion> publicaciones;

    // Getters y setters
    public Long getIdFormato() { return idFormato; }
    public void setIdFormato(Long idFormato) { this.idFormato = idFormato; }

    public String getArchivoRuta() { return archivoRuta; }
    public void setArchivoRuta(String archivoRuta) { this.archivoRuta = archivoRuta; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public java.util.List<RequisitoTUPAC> getRequisitos() { return requisitos; }
    public void setRequisitos(java.util.List<RequisitoTUPAC> requisitos) { this.requisitos = requisitos; }

    public java.util.List<Publicacion> getPublicaciones() { return publicaciones; }
    public void setPublicaciones(java.util.List<Publicacion> publicaciones) { this.publicaciones = publicaciones; }
}
