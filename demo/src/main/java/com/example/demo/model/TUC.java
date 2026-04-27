package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tuc")
public class TUC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tuc")
    private Long idTuc;

    @Column(name = "codigo", length = 50)
    private String codigo;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDateTime fechaVencimiento;

    @Column(name = "fecha_suspension")
    private LocalDateTime fechaSuspension;

    @Column(name = "duracion_meses", nullable = false)
    private Integer duracionMeses;

    @Column(name = "tipo", length = 30)
    private String tipo; // "12_MESES" o "HASTA_FIN_ANIO"

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // Relación con Empresa
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa")
    private Empresa empresa;

    // Relación con Expediente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente")
    private Expediente expediente;

    // Relación con FichaInspeccion (origen del TUC)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ficha_inspeccion_id")
    @JsonIgnore
    private FichaInspeccion fichaInspeccion;

    // Relación con Solicitud
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id")
    private Solicitud solicitud;

    // Relación con TUPAC
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tupac")
    private TUPAC tupac;

     // Relación con Vehiculo
     @JsonIgnore
     @OneToMany(mappedBy = "tuc", cascade = CascadeType.ALL)
     private List<Vehiculo> vehiculos;

     // Getters y setters
    public Long getIdTuc() { return idTuc; }
    public void setIdTuc(Long idTuc) { this.idTuc = idTuc; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }

    public LocalDateTime getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDateTime fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public LocalDateTime getFechaSuspension() { return fechaSuspension; }
    public void setFechaSuspension(LocalDateTime fechaSuspension) { this.fechaSuspension = fechaSuspension; }

    public Integer getDuracionMeses() { return duracionMeses; }
    public void setDuracionMeses(Integer duracionMeses) { this.duracionMeses = duracionMeses; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public Expediente getExpediente() { return expediente; }
    public void setExpediente(Expediente expediente) { this.expediente = expediente; }

    public FichaInspeccion getFichaInspeccion() { return fichaInspeccion; }
    public void setFichaInspeccion(FichaInspeccion fichaInspeccion) { this.fichaInspeccion = fichaInspeccion; }

    public Solicitud getSolicitud() { return solicitud; }
    public void setSolicitud(Solicitud solicitud) { this.solicitud = solicitud; }

    public TUPAC getTupac() { return tupac; }
    public void setTupac(TUPAC tupac) { this.tupac = tupac; }

     public List<Vehiculo> getVehiculos() { return vehiculos; }
     public void setVehiculos(List<Vehiculo> vehiculos) { this.vehiculos = vehiculos; }
 }
