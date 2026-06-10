package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "formato_inspeccion")
public class FormatoInspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formato_inspeccion")
    private Long idFormatoInspeccion;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Títulos del certificado
    @Column(name = "titulo_principal", length = 200)
    private String tituloPrincipal;

    @Column(name = "titulo_font_size")
    private Integer tituloFontSize;

    @Column(name = "subtitulo_principal", length = 200)
    private String subtituloPrincipal;

    @Column(name = "subtitulo_font_size")
    private Integer subtituloFontSize;

    @Column(name = "subtitulo2", length = 200)
    private String subtitulo2;

    @Column(name = "subtitulo3", length = 200)
    private String subtitulo3;

    @Column(name = "subtitulo4", length = 200)
    private String subtitulo4;

    @Column(name = "titulo_seccion_datos_generales", length = 100)
    private String tituloSeccionDatosGenerales;

    @Column(name = "titulo_seccion_placa", length = 100)
    private String tituloSeccionPlaca;

    @Column(name = "titulo_seccion_plan_lunca", length = 100)
    private String tituloSeccionPlanLunca;

    @Column(name = "titulo_seccion_laboratorio", length = 100)
    private String tituloSeccionLaboratorio;

    // Relación con Campos del formato
    @OneToMany(mappedBy = "formatoInspeccion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnore
    private List<CampoFormato> campos;

    // Relación con Inspeccion (qué inspecciones usan este formato)
    @OneToMany(mappedBy = "formatoInspeccion")
    @JsonIgnore
    private List<Inspeccion> inspecciones;

    // Lifecycle callbacks
    @PrePersist
    public void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (fechaActualizacion == null) {
            fechaActualizacion = LocalDateTime.now();
        }
        if (tituloPrincipal == null || tituloPrincipal.trim().isEmpty()) {
            tituloPrincipal = "CERTIFICADO DE INSTRUCCIONES EQUIVALIDO COMPLEMENTARIA";
        }
        if (subtituloPrincipal == null || subtituloPrincipal.trim().isEmpty()) {
            subtituloPrincipal = "CÁTEDRA DE LA EMPRESA";
        }
        if (tituloSeccionDatosGenerales == null || tituloSeccionDatosGenerales.trim().isEmpty()) {
            tituloSeccionDatosGenerales = "DATOS GENERALES";
        }
        if (tituloSeccionPlaca == null || tituloSeccionPlaca.trim().isEmpty()) {
            tituloSeccionPlaca = "PLACA";
        }
        if (tituloSeccionPlanLunca == null || tituloSeccionPlanLunca.trim().isEmpty()) {
            tituloSeccionPlanLunca = "PLAN LUNCA DE RODALE";
        }
        if (tituloSeccionLaboratorio == null || tituloSeccionLaboratorio.trim().isEmpty()) {
            tituloSeccionLaboratorio = "LABORATORIO";
        }
        if (tituloFontSize == null) {
            tituloFontSize = 24; // tamaño por defecto
        }
        if (subtituloFontSize == null) {
            subtituloFontSize = 18; // tamaño por defecto
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    // Getters y setters
    public Long getIdFormatoInspeccion() {
        return idFormatoInspeccion;
    }

    public void setIdFormatoInspeccion(Long idFormatoInspeccion) {
        this.idFormatoInspeccion = idFormatoInspeccion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public String getTituloPrincipal() {
        return tituloPrincipal;
    }

    public void setTituloPrincipal(String tituloPrincipal) {
        this.tituloPrincipal = tituloPrincipal;
    }

    public String getSubtituloPrincipal() {
        return subtituloPrincipal;
    }

    public void setSubtituloPrincipal(String subtituloPrincipal) {
        this.subtituloPrincipal = subtituloPrincipal;
    }

    public Integer getTituloFontSize() {
        return tituloFontSize;
    }

    public void setTituloFontSize(Integer tituloFontSize) {
        this.tituloFontSize = tituloFontSize;
    }

    public Integer getSubtituloFontSize() {
        return subtituloFontSize;
    }

    public void setSubtituloFontSize(Integer subtituloFontSize) {
        this.subtituloFontSize = subtituloFontSize;
    }

    public String getSubtitulo2() {
        return subtitulo2;
    }

    public void setSubtitulo2(String subtitulo2) {
        this.subtitulo2 = subtitulo2;
    }

    public String getSubtitulo3() {
        return subtitulo3;
    }

    public void setSubtitulo3(String subtitulo3) {
        this.subtitulo3 = subtitulo3;
    }

    public String getSubtitulo4() {
        return subtitulo4;
    }

    public void setSubtitulo4(String subtitulo4) {
        this.subtitulo4 = subtitulo4;
    }

    public String getTituloSeccionDatosGenerales() {
        return tituloSeccionDatosGenerales;
    }

    public void setTituloSeccionDatosGenerales(String tituloSeccionDatosGenerales) {
        this.tituloSeccionDatosGenerales = tituloSeccionDatosGenerales;
    }

    public String getTituloSeccionPlaca() {
        return tituloSeccionPlaca;
    }

    public void setTituloSeccionPlaca(String tituloSeccionPlaca) {
        this.tituloSeccionPlaca = tituloSeccionPlaca;
    }

    public String getTituloSeccionPlanLunca() {
        return tituloSeccionPlanLunca;
    }

    public void setTituloSeccionPlanLunca(String tituloSeccionPlanLunca) {
        this.tituloSeccionPlanLunca = tituloSeccionPlanLunca;
    }

    public String getTituloSeccionLaboratorio() {
        return tituloSeccionLaboratorio;
    }

    public void setTituloSeccionLaboratorio(String tituloSeccionLaboratorio) {
        this.tituloSeccionLaboratorio = tituloSeccionLaboratorio;
    }

    public List<CampoFormato> getCampos() {
        return campos;
    }

    public void setCampos(List<CampoFormato> campos) {
        this.campos = campos;
    }

    public List<Inspeccion> getInspecciones() {
        return inspecciones;
    }

    public void setInspecciones(List<Inspeccion> inspecciones) {
        this.inspecciones = inspecciones;
    }
}
