package com.example.demo.dto;

import java.util.List;

public class BloqueInspeccionDTO {
    private Long idTramite;
    private String empresaNombre;
    private String estado;
    private Long totalInstancias;
    private Long count; // alias para totalInspecciones (por compatibilidad)
    private List<InspeccionResponse> inspecciones;

    public BloqueInspeccionDTO() {}

    public BloqueInspeccionDTO(Long idTramite, String empresaNombre, String estado, Long totalInstancias, List<InspeccionResponse> inspecciones) {
        this.idTramite = idTramite;
        this.empresaNombre = empresaNombre;
        this.estado = estado;
        this.totalInstancias = totalInstancias;
        this.inspecciones = inspecciones;
        this.count = (long) inspecciones.size();
    }

    public Long getIdTramite() {
        return idTramite;
    }

    public void setIdTramite(Long idTramite) {
        this.idTramite = idTramite;
    }

    public String getEmpresaNombre() {
        return empresaNombre;
    }

    public void setEmpresaNombre(String empresaNombre) {
        this.empresaNombre = empresaNombre;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getTotalInstancias() {
        return totalInstancias;
    }

    public void setTotalInstancias(Long totalInstancias) {
        this.totalInstancias = totalInstancias;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public List<InspeccionResponse> getInspecciones() {
        return inspecciones;
    }

    public void setInspecciones(List<InspeccionResponse> inspecciones) {
        this.inspecciones = inspecciones;
    }
}
