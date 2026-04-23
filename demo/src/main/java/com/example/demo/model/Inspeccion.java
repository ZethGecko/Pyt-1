package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inspeccion")
public class Inspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inspeccion")
    private Long idInspeccion;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Column(name = "hora", nullable = false)
    private String hora;

    @Column(name = "lugar", length = 200, nullable = false)
    private String lugar;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "resultado_general", length = 20)
    private String resultadoGeneral;

    @Column(name = "fecha_ejecucion")
    private LocalDateTime fechaEjecucion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    // Relación con Empresa
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa", nullable = false)
    private Empresa empresa;

    // Relación con Expediente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente", nullable = false)
    @JsonIgnore
    private Expediente expediente;

    // Relación con Usuario (inspector)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_inspector", nullable = false)
    @JsonIgnore
    private Users usuarioInspector;

    // Relación con Vehiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id")
    @JsonIgnore
    private Vehiculo vehiculo;

    // Relación con FichaInspeccion
    @OneToMany(mappedBy = "inspeccion", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<FichaInspeccion> fichasInspeccion;

    // Getters y setters
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

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public Expediente getExpediente() { return expediente; }
    public void setExpediente(Expediente expediente) { this.expediente = expediente; }

    public Users getUsuarioInspector() { return usuarioInspector; }
    public void setUsuarioInspector(Users usuarioInspector) { this.usuarioInspector = usuarioInspector; }

    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }

    public List<FichaInspeccion> getFichasInspeccion() { return fichasInspeccion; }
    public void setFichasInspeccion(List<FichaInspeccion> fichasInspeccion) { this.fichasInspeccion = fichasInspeccion; }
}
