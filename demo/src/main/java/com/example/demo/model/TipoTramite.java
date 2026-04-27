package com.example.demo.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@Table(name = "tipo_tramite")
public class TipoTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_tramite")
    private Long idTipoTramite;

    @Column(name = "codigo", length = 20, nullable = false, unique = true)
    private String codigo;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "dias_descargo")
    private Integer diasDescargo;

    @Column(name = "estado", length = 20)
    private String estado = "ACTIVO";

    @Column(name = "requisitos_ids")
    private String requisitosIds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tupac")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TUPAC tupac;

    @OneToMany(mappedBy = "tipoTramite", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Tramite> tramites;

    @OneToMany(mappedBy = "tipoTramite", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Expediente> expedientes;

    // Getters y setters
    public Long getIdTipoTramite() { return idTipoTramite; }
    public void setIdTipoTramite(Long idTipoTramite) { this.idTipoTramite = idTipoTramite; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getDiasDescargo() { return diasDescargo; }
    public void setDiasDescargo(Integer diasDescargo) { this.diasDescargo = diasDescargo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getRequisitosIds() { return requisitosIds; }
    public void setRequisitosIds(String requisitosIds) { this.requisitosIds = requisitosIds; }

    public TUPAC getTupac() { return tupac; }
    public void setTupac(TUPAC tupac) { this.tupac = tupac; }

    public List<Tramite> getTramites() { return tramites; }
    public void setTramites(List<Tramite> tramites) { this.tramites = tramites; }

    public List<Expediente> getExpedientes() { return expedientes; }
    public void setExpedientes(List<Expediente> expedientes) { this.expedientes = expedientes; }
}
