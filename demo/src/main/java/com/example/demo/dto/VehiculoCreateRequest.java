package com.example.demo.dto;

public class VehiculoCreateRequest {
    private String placa;
    private String numeroMotor;
    private String numeroChasis;
    private String marca;
    private String modelo;
    private Integer fechaFabricacion;
    private String color;
    private String categoria;
    private Double pesoNeto;
    private String estadoTecnico;
    private Integer capacidadPasajeros;
    private Double capacidadCarga;
    private String estado;
    private String observaciones;

    // IDs de relaciones
    private Long empresaId;
    private Long subtipoTransporteId;

    public VehiculoCreateRequest() {}

    // Getters y setters
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getNumeroMotor() { return numeroMotor; }
    public void setNumeroMotor(String numeroMotor) { this.numeroMotor = numeroMotor; }

    public String getNumeroChasis() { return numeroChasis; }
    public void setNumeroChasis(String numeroChasis) { this.numeroChasis = numeroChasis; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public Integer getFechaFabricacion() { return fechaFabricacion; }
    public void setFechaFabricacion(Integer fechaFabricacion) { this.fechaFabricacion = fechaFabricacion; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Double getPesoNeto() { return pesoNeto; }
    public void setPesoNeto(Double pesoNeto) { this.pesoNeto = pesoNeto; }

    public String getEstadoTecnico() { return estadoTecnico; }
    public void setEstadoTecnico(String estadoTecnico) { this.estadoTecnico = estadoTecnico; }

    public Integer getCapacidadPasajeros() { return capacidadPasajeros; }
    public void setCapacidadPasajeros(Integer capacidadPasajeros) { this.capacidadPasajeros = capacidadPasajeros; }

    public Double getCapacidadCarga() { return capacidadCarga; }
    public void setCapacidadCarga(Double capacidadCarga) { this.capacidadCarga = capacidadCarga; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public Long getSubtipoTransporteId() { return subtipoTransporteId; }
    public void setSubtipoTransporteId(Long subtipoTransporteId) { this.subtipoTransporteId = subtipoTransporteId; }
}