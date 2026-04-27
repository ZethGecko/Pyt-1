package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vehiculo")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vehiculo")
    private Long idVehiculo;

    @Column(name = "placa", length = 20, unique = true, nullable = false)
    private String placa;

    @Column(name = "numero_motor", length = 50, unique = true)
    private String numeroMotor;

    @Column(name = "numero_chasis", length = 50, unique = true)
    private String numeroChasis;

    @Column(name = "marca", length = 50)
    private String marca;

    @Column(name = "modelo", length = 50)
    private String modelo;

    @Column(name = "anio_fabricacion")
    private Integer anioFabricacion;

     @Column(name = "color", length = 30)
     private String color;

     @Column(name = "categoria", length = 10)
     private String categoria;

     @Column(name = "peso_neto")
     private Double pesoNeto;

     @Column(name = "estado_tecnico", length = 30)
     private String estadoTecnico;

     @Column(name = "capacidad_pasajeros")
     private Integer capacidadPasajeros;

     @Column(name = "capacidad_carga")
     private Double capacidadCarga; // en kg

     @Column(name = "fecha_habilitacion")
     private LocalDateTime fechaHabilitacion;

     @Column(name = "fecha_vencimiento_tuc")
     private LocalDateTime fechaVencimientoTUC;

     @Column(name = "estado", length = 20, nullable = false)
     private String estado = "DESHABILITADO";

     @Column(name = "observaciones", columnDefinition = "TEXT")
     private String observaciones;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtipo_transporte")
    @JsonIgnore
    private SubtipoTransporte subtipoTransporte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gerente_responsable")
    @JsonIgnore
    private Gerente gerenteResponsable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tuc_id")
    @JsonIgnore
    private TUC tuc;

     @OneToMany(mappedBy = "vehiculo", cascade = CascadeType.ALL)
     @JsonIgnore
     private List<Inspeccion> inspecciones;

     // Getters y setters
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

    public LocalDateTime getFechaHabilitacion() { return fechaHabilitacion; }
    public void setFechaHabilitacion(LocalDateTime fechaHabilitacion) { this.fechaHabilitacion = fechaHabilitacion; }

    public LocalDateTime getFechaVencimientoTUC() { return fechaVencimientoTUC; }
    public void setFechaVencimientoTUC(LocalDateTime fechaVencimientoTUC) { this.fechaVencimientoTUC = fechaVencimientoTUC; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public SubtipoTransporte getSubtipoTransporte() { return subtipoTransporte; }
    public void setSubtipoTransporte(SubtipoTransporte subtipoTransporte) { this.subtipoTransporte = subtipoTransporte; }

    public Gerente getGerenteResponsable() { return gerenteResponsable; }
    public void setGerenteResponsable(Gerente gerenteResponsable) { this.gerenteResponsable = gerenteResponsable; }

    public TUC getTuc() { return tuc; }
    public void setTuc(TUC tuc) { this.tuc = tuc; }

     public List<Inspeccion> getInspecciones() { return inspecciones; }
     public void setInspecciones(List<Inspeccion> inspecciones) { this.inspecciones = inspecciones; }
 }