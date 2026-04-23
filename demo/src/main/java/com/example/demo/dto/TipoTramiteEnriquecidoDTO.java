package com.example.demo.dto;

import java.util.List;

public class TipoTramiteEnriquecidoDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private Integer diasDescargo;
    private Long tupacId;
    private String tupacCodigo;
    private String tupacDescripcion;
    private String tupacEstado;
    private Integer totalTramites;
    private Integer tramitesPendientes;
    private Integer tramitesRechazados;
    private Integer totalEtapas;
    private Integer totalRequisitos;
    private List<Long> requisitosIds;

    public TipoTramiteEnriquecidoDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getDiasDescargo() {
        return diasDescargo;
    }

    public void setDiasDescargo(Integer diasDescargo) {
        this.diasDescargo = diasDescargo;
    }

    public Long getTupacId() {
        return tupacId;
    }

    public void setTupacId(Long tupacId) {
        this.tupacId = tupacId;
    }

    public String getTupacCodigo() {
        return tupacCodigo;
    }

    public void setTupacCodigo(String tupacCodigo) {
        this.tupacCodigo = tupacCodigo;
    }

    public String getTupacDescripcion() {
        return tupacDescripcion;
    }

    public void setTupacDescripcion(String tupacDescripcion) {
        this.tupacDescripcion = tupacDescripcion;
    }

    public String getTupacEstado() {
        return tupacEstado;
    }

    public void setTupacEstado(String tupacEstado) {
        this.tupacEstado = tupacEstado;
    }

    public Integer getTotalTramites() {
        return totalTramites;
    }

    public void setTotalTramites(Integer totalTramites) {
        this.totalTramites = totalTramites;
    }

    public Integer getTramitesPendientes() {
        return tramitesPendientes;
    }

    public void setTramitesPendientes(Integer tramitesPendientes) {
        this.tramitesPendientes = tramitesPendientes;
    }

    public Integer getTramitesRechazados() {
        return tramitesRechazados;
    }

    public void setTramitesRechazados(Integer tramitesRechazados) {
        this.tramitesRechazados = tramitesRechazados;
    }

    public Integer getTotalEtapas() {
        return totalEtapas;
    }

    public void setTotalEtapas(Integer totalEtapas) {
        this.totalEtapas = totalEtapas;
    }

    public Integer getTotalRequisitos() {
        return totalRequisitos;
    }

    public void setTotalRequisitos(Integer totalRequisitos) {
        this.totalRequisitos = totalRequisitos;
    }

    public List<Long> getRequisitosIds() {
        return requisitosIds;
    }

    public void setRequisitosIds(List<Long> requisitosIds) {
        this.requisitosIds = requisitosIds;
    }
}