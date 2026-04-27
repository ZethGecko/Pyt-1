package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RutaBusquedaResultadoDTO {
    private Long idRuta;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Double distanciaCalculada;
    private Integer tiempoEstimadoMinutos;
    private String estado;
    private String tipo;
    private Long empresaId;
    private String empresaNombre;
    private String empresaRuc;
    private List<PuntoCoordenadaDTO> puntosTramo;
    private String tipoResultado; // "OPTIMO" (con meeting point) o "FALLBACK" (tramo directo)
    private Double distanciaCobertura; // max(dOrigen_meet, dDestino_meet) en km, solo para OPTIMO

    public RutaBusquedaResultadoDTO() {}

    public RutaBusquedaResultadoDTO(Long idRuta, String codigo, String nombre, String descripcion,
                                    Double distanciaCalculada, Integer tiempoEstimadoMinutos, String estado,
                                    String tipo, Long empresaId, String empresaNombre, String empresaRuc,
                                    List<PuntoCoordenadaDTO> puntosTramo) {
        this.idRuta = idRuta;
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.distanciaCalculada = distanciaCalculada;
        this.tiempoEstimadoMinutos = tiempoEstimadoMinutos;
        this.estado = estado;
        this.tipo = tipo;
        this.empresaId = empresaId;
        this.empresaNombre = empresaNombre;
        this.empresaRuc = empresaRuc;
        this.puntosTramo = puntosTramo;
    }

    // Getters y setters
    public Long getIdRuta() { return idRuta; }
    public void setIdRuta(Long idRuta) { this.idRuta = idRuta; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getDistanciaCalculada() { return distanciaCalculada; }
    public void setDistanciaCalculada(Double distanciaCalculada) { this.distanciaCalculada = distanciaCalculada; }

    public Integer getTiempoEstimadoMinutos() { return tiempoEstimadoMinutos; }
    public void setTiempoEstimadoMinutos(Integer tiempoEstimadoMinutos) { this.tiempoEstimadoMinutos = tiempoEstimadoMinutos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

    public String getEmpresaRuc() { return empresaRuc; }
    public void setEmpresaRuc(String empresaRuc) { this.empresaRuc = empresaRuc; }

    public List<PuntoCoordenadaDTO> getPuntosTramo() { return puntosTramo; }
    public void setPuntosTramo(List<PuntoCoordenadaDTO> puntosTramo) { this.puntosTramo = puntosTramo; }

    public String getTipoResultado() { return tipoResultado; }
    public void setTipoResultado(String tipoResultado) { this.tipoResultado = tipoResultado; }

    public Double getDistanciaCobertura() { return distanciaCobertura; }
    public void setDistanciaCobertura(Double distanciaCobertura) { this.distanciaCobertura = distanciaCobertura; }
}
