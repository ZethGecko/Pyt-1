package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "elemento_canvas")
public class ElementoCanvas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_elemento_canvas")
    private Long idElementoCanvas;

    @Column(name = "ficha_inspeccion", nullable = false)
    private Long fichaInspeccion;

    @Column(name = "parametro_inspeccion")
    private Long parametroInspeccion;

    @Column(name = "tipo_elemento", length = 50, nullable = false)
    private String tipoElemento;

    @Column(name = "titulo", length = 200)
    private String titulo;

    @Column(name = "contenido", columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "estilo", columnDefinition = "TEXT")
    private String estilo;

    @Column(name = "posicion_x", nullable = false)
    private Integer posicionX;

    @Column(name = "posicion_y", nullable = false)
    private Integer posicionY;

    @Column(name = "ancho", nullable = false)
    private Integer ancho;

    @Column(name = "alto", nullable = false)
    private Integer alto;

    @Column(name = "rotacion", nullable = false)
    private Integer rotacion;

    @Column(name = "z_index", nullable = false)
    private Integer zIndex;

    @Column(name = "numero_hoja", nullable = false)
    private Integer numeroHoja;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ficha_inspeccion", insertable = false, updatable = false)
    private FichaInspeccion fichaInspeccionEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parametro_inspeccion", insertable = false, updatable = false)
    private ParametrosInspeccion parametroInspeccionEntity;

    // Getters y setters
    public Long getIdElementoCanvas() { return idElementoCanvas; }
    public void setIdElementoCanvas(Long idElementoCanvas) { this.idElementoCanvas = idElementoCanvas; }

    public Long getFichaInspeccion() { return fichaInspeccion; }
    public void setFichaInspeccion(Long fichaInspeccion) { this.fichaInspeccion = fichaInspeccion; }

    public Long getParametroInspeccion() { return parametroInspeccion; }
    public void setParametroInspeccion(Long parametroInspeccion) { this.parametroInspeccion = parametroInspeccion; }

    public String getTipoElemento() { return tipoElemento; }
    public void setTipoElemento(String tipoElemento) { this.tipoElemento = tipoElemento; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public String getEstilo() { return estilo; }
    public void setEstilo(String estilo) { this.estilo = estilo; }

    public Integer getPosicionX() { return posicionX; }
    public void setPosicionX(Integer posicionX) { this.posicionX = posicionX; }

    public Integer getPosicionY() { return posicionY; }
    public void setPosicionY(Integer posicionY) { this.posicionY = posicionY; }

    public Integer getAncho() { return ancho; }
    public void setAncho(Integer ancho) { this.ancho = ancho; }

    public Integer getAlto() { return alto; }
    public void setAlto(Integer alto) { this.alto = alto; }

    public Integer getRotacion() { return rotacion; }
    public void setRotacion(Integer rotacion) { this.rotacion = rotacion; }

    public Integer getzIndex() { return zIndex; }
    public void setzIndex(Integer zIndex) { this.zIndex = zIndex; }

    public Integer getNumeroHoja() { return numeroHoja; }
    public void setNumeroHoja(Integer numeroHoja) { this.numeroHoja = numeroHoja; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public FichaInspeccion getFichaInspeccionEntity() { return fichaInspeccionEntity; }
    public void setFichaInspeccionEntity(FichaInspeccion fichaInspeccionEntity) { this.fichaInspeccionEntity = fichaInspeccionEntity; }

    public ParametrosInspeccion getParametroInspeccionEntity() { return parametroInspeccionEntity; }
    public void setParametroInspeccionEntity(ParametrosInspeccion parametroInspeccionEntity) { this.parametroInspeccionEntity = parametroInspeccionEntity; }
}
