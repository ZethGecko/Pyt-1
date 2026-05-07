package com.example.demo.dto;

import java.time.LocalDate;
import java.util.List;

public class InspeccionConInstanciasCreateRequest {
    private LocalDate fechaProgramada;
    private String hora;
    private String lugar;
    private String observacionesGenerales;
    private List<Long> instanciasTramiteIds;
    private String codigoGrupo;
    private Long usuarioInspectorId;

    public InspeccionConInstanciasCreateRequest() {}

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getObservacionesGenerales() { return observacionesGenerales; }
    public void setObservacionesGenerales(String observacionesGenerales) { this.observacionesGenerales = observacionesGenerales; }

    public List<Long> getInstanciasTramiteIds() { return instanciasTramiteIds; }
    public void setInstanciasTramiteIds(List<Long> instanciasTramiteIds) { this.instanciasTramiteIds = instanciasTramiteIds; }

    public String getCodigoGrupo() { return codigoGrupo; }
    public void setCodigoGrupo(String codigoGrupo) { this.codigoGrupo = codigoGrupo; }

    public Long getUsuarioInspectorId() { return usuarioInspectorId; }
    public void setUsuarioInspectorId(Long usuarioInspectorId) { this.usuarioInspectorId = usuarioInspectorId; }
}
