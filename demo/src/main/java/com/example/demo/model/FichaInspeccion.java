package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ficha_inspeccion")
public class FichaInspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ficha_inspeccion")
    private Long idFichaInspeccion;

    @Column(name = "solicitud", nullable = false)
    private Long solicitud;

    @Column(name = "inspeccion", nullable = false)
    private Long inspeccion;

    @Column(name = "usuario_inspector", nullable = false)
    private Long usuarioInspector;

    @Column(name = "vehiculo", nullable = false)
    private Long vehiculo;

    @Column(name = "estado")
    private Boolean estado;

    @Column(name = "resultado", length = 20)
    private String resultado;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_inspeccion")
    private LocalDateTime fechaInspeccion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Relación con Inspeccion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspeccion", insertable = false, updatable = false)
    private Inspeccion inspeccionEntity;

    // Relación con Solicitud
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud", insertable = false, updatable = false)
    private Solicitud solicitudEntity;

    // Relación con Usuario (inspector)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_inspector", insertable = false, updatable = false)
    private Users usuarioInspectorEntity;

    // Relación con Vehiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo", insertable = false, updatable = false)
    private Vehiculo vehiculoEntity;

    // Relación con ParametrosInspeccion
    @OneToMany(mappedBy = "fichaInspeccion", cascade = CascadeType.ALL)
    private List<ParametrosInspeccion> parametros;

    // Relación con ObservacionesInspeccion
    @OneToMany(mappedBy = "fichaInspeccion", cascade = CascadeType.ALL)
    private List<ObservacionesInspeccion> observacionesInspeccion;

    // Relación con ElementoCanvas
    @OneToMany(mappedBy = "fichaInspeccion", cascade = CascadeType.ALL)
    private List<ElementoCanvas> elementosCanvas;

    // Relación con EvaluacionParametro
    @OneToMany(mappedBy = "fichaInspeccion", cascade = CascadeType.ALL)
    private List<EvaluacionParametro> evaluaciones;

    // Getters y setters
    public Long getIdFichaInspeccion() { return idFichaInspeccion; }
    public void setIdFichaInspeccion(Long idFichaInspeccion) { this.idFichaInspeccion = idFichaInspeccion; }

    public Long getSolicitud() { return solicitud; }
    public void setSolicitud(Long solicitud) { this.solicitud = solicitud; }

    public Long getInspeccion() { return inspeccion; }
    public void setInspeccion(Long inspeccion) { this.inspeccion = inspeccion; }

    public Long getUsuarioInspector() { return usuarioInspector; }
    public void setUsuarioInspector(Long usuarioInspector) { this.usuarioInspector = usuarioInspector; }

    public Long getVehiculo() { return vehiculo; }
    public void setVehiculo(Long vehiculo) { this.vehiculo = vehiculo; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaInspeccion() { return fechaInspeccion; }
    public void setFechaInspeccion(LocalDateTime fechaInspeccion) { this.fechaInspeccion = fechaInspeccion; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Inspeccion getInspeccionEntity() { return inspeccionEntity; }
    public void setInspeccionEntity(Inspeccion inspeccionEntity) { this.inspeccionEntity = inspeccionEntity; }

    public Solicitud getSolicitudEntity() { return solicitudEntity; }
    public void setSolicitudEntity(Solicitud solicitudEntity) { this.solicitudEntity = solicitudEntity; }

    public Users getUsuarioInspectorEntity() { return usuarioInspectorEntity; }
    public void setUsuarioInspectorEntity(Users usuarioInspectorEntity) { this.usuarioInspectorEntity = usuarioInspectorEntity; }

    public Vehiculo getVehiculoEntity() { return vehiculoEntity; }
    public void setVehiculoEntity(Vehiculo vehiculoEntity) { this.vehiculoEntity = vehiculoEntity; }

    public List<ParametrosInspeccion> getParametros() { return parametros; }
    public void setParametros(List<ParametrosInspeccion> parametros) { this.parametros = parametros; }

    public List<ObservacionesInspeccion> getObservacionesInspeccion() { return observacionesInspeccion; }
    public void setObservacionesInspeccion(List<ObservacionesInspeccion> observacionesInspeccion) { 
        this.observacionesInspeccion = observacionesInspeccion; 
    }

    public List<ElementoCanvas> getElementosCanvas() { return elementosCanvas; }
    public void setElementosCanvas(List<ElementoCanvas> elementosCanvas) { this.elementosCanvas = elementosCanvas; }

    public List<EvaluacionParametro> getEvaluaciones() { return evaluaciones; }
    public void setEvaluaciones(List<EvaluacionParametro> evaluaciones) { this.evaluaciones = evaluaciones; }
}
