package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "requisito_tupac")
public class RequisitoTUPAC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_requisito")
    private Long id;

    @Column(name = "codigo", length = 50, unique = true)
    private String codigo;

    @Column(name = "descripcion", columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "tipo_documento", length = 50, nullable = false)
    private String tipoDocumento;

    @Column(name = "obligatorio", nullable = false)
    private Boolean obligatorio = true;

    @Column(name = "es_examen")
    private Boolean esExamen = false;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(name = "dias_validez")
    private Integer diasValidez;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // Relación con TUPAC
    @ManyToOne
    @JoinColumn(name = "tupac", nullable = false)
    @JsonIgnore
    private TUPAC tupac;

    @ManyToOne
    @JoinColumn(name = "formato_id")
    @JsonIgnore
    private Formatos formato;

    // Relación con DocumentoTramite
    @JsonIgnore
    @OneToMany(mappedBy = "requisito", cascade = CascadeType.ALL)
    private java.util.List<DocumentoTramite> documentos;

    // Relación con GrupoPresentacion
    @JsonIgnore
    @OneToMany(mappedBy = "requisitoExamen", cascade = CascadeType.ALL)
    private java.util.List<GrupoPresentacion> gruposPresentacion;

    // Relación con ObservacionSolicitud
    @JsonIgnore
    @OneToMany(mappedBy = "requisito", cascade = CascadeType.ALL)
    private java.util.List<ObservacionSolicitud> observacionesSolicitudes;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public Boolean getObligatorio() { return obligatorio; }
    public void setObligatorio(Boolean obligatorio) { this.obligatorio = obligatorio; }

    public Boolean getEsExamen() { return esExamen; }
    public void setEsExamen(Boolean esExamen) { this.esExamen = esExamen; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Integer getDiasValidez() { return diasValidez; }
    public void setDiasValidez(Integer diasValidez) { this.diasValidez = diasValidez; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public TUPAC getTupac() { return tupac; }
    public void setTupac(TUPAC tupac) { this.tupac = tupac; }

    public Formatos getFormato() { return formato; }
    public void setFormato(Formatos formato) { this.formato = formato; }

    public java.util.List<DocumentoTramite> getDocumentos() { return documentos; }
    public void setDocumentos(java.util.List<DocumentoTramite> documentos) { this.documentos = documentos; }

    public java.util.List<GrupoPresentacion> getGruposPresentacion() { return gruposPresentacion; }
    public void setGruposPresentacion(java.util.List<GrupoPresentacion> gruposPresentacion) { this.gruposPresentacion = gruposPresentacion; }

    public java.util.List<ObservacionSolicitud> getObservacionesSolicitudes() { return observacionesSolicitudes; }
    public void setObservacionesSolicitudes(java.util.List<ObservacionSolicitud> observacionesSolicitudes) { this.observacionesSolicitudes = observacionesSolicitudes; }
}
