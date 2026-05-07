package com.example.demo.dto;

import java.util.List;

public class CrearInspeccionEnBloqueRequest {
    private List<Long> instanciasTramiteIds;
    private String hora;
    private String observacionesGenerales;
    private Long usuarioInspectorId;
    private String codigoGrupo;

    public CrearInspeccionEnBloqueRequest() {}

    public List<Long> getInstanciasTramiteIds() {
        return instanciasTramiteIds;
    }

    public void setInstanciasTramiteIds(List<Long> instanciasTramiteIds) {
        this.instanciasTramiteIds = instanciasTramiteIds;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getObservacionesGenerales() {
        return observacionesGenerales;
    }

    public void setObservacionesGenerales(String observacionesGenerales) {
        this.observacionesGenerales = observacionesGenerales;
    }

    public Long getUsuarioInspectorId() {
        return usuarioInspectorId;
    }

    public void setUsuarioInspectorId(Long usuarioInspectorId) {
        this.usuarioInspectorId = usuarioInspectorId;
    }

    public String getCodigoGrupo() {
        return codigoGrupo;
    }

    public void setCodigoGrupo(String codigoGrupo) {
        this.codigoGrupo = codigoGrupo;
    }
}
