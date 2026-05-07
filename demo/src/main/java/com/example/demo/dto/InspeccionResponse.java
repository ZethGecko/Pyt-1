package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class InspeccionResponse {
    private Long idInspeccion;
    private String codigo;
    private LocalDate fechaProgramada;
    private String hora;
    private String lugar;
    private String estado;
    private String resultadoGeneral;
    private LocalDateTime fechaEjecucion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String observacionesGenerales;
    private String codigoGrupo;
    private List<InspeccionInstanciaResponse> instancias;
    // Empresa e inspector
    private Long empresaId;
    private String empresaNombre;
    private String empresaRuc;
    private String empresaDireccion;
    private String empresaTelefono;
    private String gerenteNombre;
    private Long inspectorId;
    private String inspectorNombre;

    public InspeccionResponse() {}

    public Long getIdInspeccion() { return idInspeccion; }
    public void setIdInspeccion(Long idInspeccion) { this.idInspeccion = idInspeccion; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getResultadoGeneral() { return resultadoGeneral; }
    public void setResultadoGeneral(String resultadoGeneral) { this.resultadoGeneral = resultadoGeneral; }

    public LocalDateTime getFechaEjecucion() { return fechaEjecucion; }
    public void setFechaEjecucion(LocalDateTime fechaEjecucion) { this.fechaEjecucion = fechaEjecucion; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getObservacionesGenerales() { return observacionesGenerales; }
    public void setObservacionesGenerales(String observacionesGenerales) { this.observacionesGenerales = observacionesGenerales; }

    public String getCodigoGrupo() { return codigoGrupo; }
    public void setCodigoGrupo(String codigoGrupo) { this.codigoGrupo = codigoGrupo; }

    public List<InspeccionInstanciaResponse> getInstancias() { return instancias; }
    public void setInstancias(List<InspeccionInstanciaResponse> instancias) { this.instancias = instancias; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

    public Long getInspectorId() { return inspectorId; }
    public void setInspectorId(Long inspectorId) { this.inspectorId = inspectorId; }

    public String getInspectorNombre() { return inspectorNombre; }
    public void setInspectorNombre(String inspectorNombre) { this.inspectorNombre = inspectorNombre; }

    public String getEmpresaRuc() { return empresaRuc; }
    public void setEmpresaRuc(String empresaRuc) { this.empresaRuc = empresaRuc; }

    public String getEmpresaDireccion() { return empresaDireccion; }
    public void setEmpresaDireccion(String empresaDireccion) { this.empresaDireccion = empresaDireccion; }

    public String getEmpresaTelefono() { return empresaTelefono; }
    public void setEmpresaTelefono(String empresaTelefono) { this.empresaTelefono = empresaTelefono; }

    public String getGerenteNombre() { return gerenteNombre; }
    public void setGerenteNombre(String gerenteNombre) { this.gerenteNombre = gerenteNombre; }
}
