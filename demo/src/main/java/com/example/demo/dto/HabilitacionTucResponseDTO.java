package com.example.demo.dto;

import java.util.List;

public class HabilitacionTucResponseDTO {
    private InspeccionParaHabilitarTucDTO inspeccion;
    private List<TUCDTO> tucs;
    private Integer totalHabilitados;

    public InspeccionParaHabilitarTucDTO getInspeccion() { return inspeccion; }
    public void setInspeccion(InspeccionParaHabilitarTucDTO inspeccion) { this.inspeccion = inspeccion; }

    public List<TUCDTO> getTucs() { return tucs; }
    public void setTucs(List<TUCDTO> tucs) { this.tucs = tucs; }

    public Integer getTotalHabilitados() { return totalHabilitados; }
    public void setTotalHabilitados(Integer totalHabilitados) { this.totalHabilitados = totalHabilitados; }
}
