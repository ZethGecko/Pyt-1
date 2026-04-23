package com.example.demo.dto;

import java.time.LocalDateTime;

public class VehiculoResponseDTO {
    private Long idVehiculo;
    private String placa;
    private String numeroMotor;
    private String numeroChasis;
    private String marca;
    private String modelo;
    private Integer anioFabricacion;
    private String color;
    private Integer capacidadPasajeros;
    private Double capacidadCarga;
    private String estado;
    private String observaciones;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;

    // Información de relaciones
    private Long empresaId;
    private String empresaNombre;
    private String empresaRuc;
    private Long subtipoTransporteId;
    private String subtipoTransporteNombre;
    private Long gerenteResponsableId;
    private String gerenteResponsableNombre;

    // Nuevos campos requeridos por el frontend
    private Long tipoTransporteId;
    private String tipoTransporteNombre;
    private Long categoriaTransporteId;
    private String categoriaTransporteNombre;
    private Boolean activo;
    private String estadoTecnico;
    private LocalDateTime fechaHabilitacion;
    private LocalDateTime fechaVencimientoTUC;
    private Integer totalTucs;
    private Integer inspeccionesCount;
    private Double pesoNeto;

    public VehiculoResponseDTO() {}

    public VehiculoResponseDTO(Long idVehiculo, String placa, String numeroMotor, String numeroChasis,
                              String marca, String modelo, Integer anioFabricacion, String color,
                              Integer capacidadPasajeros, Double capacidadCarga, String estado,
                              String observaciones, LocalDateTime fechaRegistro, LocalDateTime fechaActualizacion,
                              Long empresaId, String empresaNombre, String empresaRuc,
                              Long subtipoTransporteId, String subtipoTransporteNombre,
                              Long gerenteResponsableId, String gerenteResponsableNombre) {
        this.idVehiculo = idVehiculo;
        this.placa = placa;
        this.numeroMotor = numeroMotor;
        this.numeroChasis = numeroChasis;
        this.marca = marca;
        this.modelo = modelo;
        this.anioFabricacion = anioFabricacion;
        this.color = color;
        this.capacidadPasajeros = capacidadPasajeros;
        this.capacidadCarga = capacidadCarga;
        this.estado = estado;
        this.observaciones = observaciones;
        this.fechaRegistro = fechaRegistro;
        this.fechaActualizacion = fechaActualizacion;
        this.empresaId = empresaId;
        this.empresaNombre = empresaNombre;
        this.empresaRuc = empresaRuc;
        this.subtipoTransporteId = subtipoTransporteId;
        this.subtipoTransporteNombre = subtipoTransporteNombre;
        this.gerenteResponsableId = gerenteResponsableId;
        this.gerenteResponsableNombre = gerenteResponsableNombre;
    }

    // Getters y setters existentes
    public Long getIdVehiculo() { return idVehiculo; }
    public void setIdVehiculo(Long idVehiculo) { this.idVehiculo = idVehiculo; }

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

    public Integer getAnioFabricacion() { return anioFabricacion; }
    public void setAnioFabricacion(Integer anioFabricacion) { this.anioFabricacion = anioFabricacion; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getCapacidadPasajeros() { return capacidadPasajeros; }
    public void setCapacidadPasajeros(Integer capacidadPasajeros) { this.capacidadPasajeros = capacidadPasajeros; }

    public Double getCapacidadCarga() { return capacidadCarga; }
    public void setCapacidadCarga(Double capacidadCarga) { this.capacidadCarga = capacidadCarga; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

    public String getEmpresaRuc() { return empresaRuc; }
    public void setEmpresaRuc(String empresaRuc) { this.empresaRuc = empresaRuc; }

    public Long getSubtipoTransporteId() { return subtipoTransporteId; }
    public void setSubtipoTransporteId(Long subtipoTransporteId) { this.subtipoTransporteId = subtipoTransporteId; }

    public String getSubtipoTransporteNombre() { return subtipoTransporteNombre; }
    public void setSubtipoTransporteNombre(String subtipoTransporteNombre) { this.subtipoTransporteNombre = subtipoTransporteNombre; }

    public Long getGerenteResponsableId() { return gerenteResponsableId; }
    public void setGerenteResponsableId(Long gerenteResponsableId) { this.gerenteResponsableId = gerenteResponsableId; }

    public String getGerenteResponsableNombre() { return gerenteResponsableNombre; }
    public void setGerenteResponsableNombre(String gerenteResponsableNombre) { this.gerenteResponsableNombre = gerenteResponsableNombre; }

    // Nuevos getters y setters
    public Long getTipoTransporteId() { return tipoTransporteId; }
    public void setTipoTransporteId(Long tipoTransporteId) { this.tipoTransporteId = tipoTransporteId; }

    public String getTipoTransporteNombre() { return tipoTransporteNombre; }
    public void setTipoTransporteNombre(String tipoTransporteNombre) { this.tipoTransporteNombre = tipoTransporteNombre; }

    public Long getCategoriaTransporteId() { return categoriaTransporteId; }
    public void setCategoriaTransporteId(Long categoriaTransporteId) { this.categoriaTransporteId = categoriaTransporteId; }

    public String getCategoriaTransporteNombre() { return categoriaTransporteNombre; }
    public void setCategoriaTransporteNombre(String categoriaTransporteNombre) { this.categoriaTransporteNombre = categoriaTransporteNombre; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getEstadoTecnico() { return estadoTecnico; }
    public void setEstadoTecnico(String estadoTecnico) { this.estadoTecnico = estadoTecnico; }

    public LocalDateTime getFechaHabilitacion() { return fechaHabilitacion; }
    public void setFechaHabilitacion(LocalDateTime fechaHabilitacion) { this.fechaHabilitacion = fechaHabilitacion; }

    public LocalDateTime getFechaVencimientoTUC() { return fechaVencimientoTUC; }
    public void setFechaVencimientoTUC(LocalDateTime fechaVencimientoTUC) { this.fechaVencimientoTUC = fechaVencimientoTUC; }

    public Integer getTotalTucs() { return totalTucs; }
    public void setTotalTucs(Integer totalTucs) { this.totalTucs = totalTucs; }

    public Integer getInspeccionesCount() { return inspeccionesCount; }
    public void setInspeccionesCount(Integer inspeccionesCount) { this.inspeccionesCount = inspeccionesCount; }

    public Double getPesoNeto() { return pesoNeto; }
    public void setPesoNeto(Double pesoNeto) { this.pesoNeto = pesoNeto; }
}