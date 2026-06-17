package com.example.demo.dto;

import java.util.List;

public class VehiculoHabilitacionTucRequestDTO {
    private Long idVehiculo;
    private String placa;
    private String marca;
    private String modelo;
    private Integer anioFabricacion;
    private String color;
    private String categoria;
    private Long subtipoTransporteId;
    private Double pesoNeto;
    private String observaciones;
    private String evidenciaNombre;
    private String evidenciaTipo;
    private String evidenciaBase64;
    private List<String> evidenciaNombres;
    private List<String> evidenciaTipos;
    private List<String> evidenciaBase64s;

    public Long getIdVehiculo() { return idVehiculo; }
    public void setIdVehiculo(Long idVehiculo) { this.idVehiculo = idVehiculo; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public Integer getAnioFabricacion() { return anioFabricacion; }
    public void setAnioFabricacion(Integer anioFabricacion) { this.anioFabricacion = anioFabricacion; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Long getSubtipoTransporteId() { return subtipoTransporteId; }
    public void setSubtipoTransporteId(Long subtipoTransporteId) { this.subtipoTransporteId = subtipoTransporteId; }

    public Double getPesoNeto() { return pesoNeto; }
    public void setPesoNeto(Double pesoNeto) { this.pesoNeto = pesoNeto; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getEvidenciaNombre() { return evidenciaNombre; }
    public void setEvidenciaNombre(String evidenciaNombre) { this.evidenciaNombre = evidenciaNombre; }

    public String getEvidenciaTipo() { return evidenciaTipo; }
    public void setEvidenciaTipo(String evidenciaTipo) { this.evidenciaTipo = evidenciaTipo; }

    public String getEvidenciaBase64() { return evidenciaBase64; }
    public void setEvidenciaBase64(String evidenciaBase64) { this.evidenciaBase64 = evidenciaBase64; }

    public List<String> getEvidenciaNombres() { return evidenciaNombres; }
    public void setEvidenciaNombres(List<String> evidenciaNombres) { this.evidenciaNombres = evidenciaNombres; }

    public List<String> getEvidenciaTipos() { return evidenciaTipos; }
    public void setEvidenciaTipos(List<String> evidenciaTipos) { this.evidenciaTipos = evidenciaTipos; }

    public List<String> getEvidenciaBase64s() { return evidenciaBase64s; }
    public void setEvidenciaBase64s(List<String> evidenciaBase64s) { this.evidenciaBase64s = evidenciaBase64s; }
}
