package com.example.demo.model;

import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "campo_formato")
@Audited
public class CampoFormato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_campo_formato")
    private Long idCampoFormato;

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "seccion", length = 50, nullable = false)
    private String seccion;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "tipo_evaluacion", length = 20)
    private String tipoEvaluacion = "TEXTO";

    @Column(name = "obligatorio", nullable = false)
    private Boolean obligatorio = false;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    // Relación con FormatoInspeccion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_formato_inspeccion", nullable = false)
    @JsonIgnore
    private FormatoInspeccion formatoInspeccion;

    // Relación con valores de fichas (un campo puede tener muchos valores en diferentes fichas)
    @OneToMany(mappedBy = "campoFormato", cascade = CascadeType.ALL)
    @JsonIgnore
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private java.util.List<ValorCampo> valores;

    // Constructores
    public CampoFormato() {}

    public CampoFormato(String nombre, String seccion, Integer orden) {
        this.nombre = nombre;
        this.seccion = seccion;
        this.orden = orden;
        this.tipoEvaluacion = "TEXTO";
        this.obligatorio = false;
        this.activo = true;
    }

    // Getters y setters
    public Long getIdCampoFormato() {
        return idCampoFormato;
    }

    public void setIdCampoFormato(Long idCampoFormato) {
        this.idCampoFormato = idCampoFormato;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getSeccion() {
        return seccion;
    }

    public void setSeccion(String seccion) {
        this.seccion = seccion;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public String getTipoEvaluacion() {
        return tipoEvaluacion;
    }

    public void setTipoEvaluacion(String tipoEvaluacion) {
        this.tipoEvaluacion = tipoEvaluacion;
    }

    public Boolean getObligatorio() {
        return obligatorio;
    }

    public void setObligatorio(Boolean obligatorio) {
        this.obligatorio = obligatorio;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public FormatoInspeccion getFormatoInspeccion() {
        return formatoInspeccion;
    }

    public void setFormatoInspeccion(FormatoInspeccion formatoInspeccion) {
        this.formatoInspeccion = formatoInspeccion;
    }

    public java.util.List<ValorCampo> getValores() {
        return valores;
    }

    public void setValores(java.util.List<ValorCampo> valores) {
        this.valores = valores;
    }
}
