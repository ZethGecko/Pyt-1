package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vehiculo_apto")
public class VehiculoApto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vehiculo_apto")
    private Long idVehiculoApto;

    // Relaciones principales
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tramite", nullable = false)
    private Tramite tramite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_aprobador")
    private Users usuarioAprobador;

    // Estado de la revisión documental
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_documental", length = 20, nullable = false)
    private EstadoDocumental estadoDocumental = EstadoDocumental.PENDIENTE;

    // Campos de resultado
    @Column(name = "motivo_rechazo", length = 500)
    private String motivoRechazo;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(name = "fecha_rechazo")
    private LocalDateTime fechaRechazo;

    // Control de instancias
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_instancia", length = 20)
    private EstadoInstancia estadoInstancia = EstadoInstancia.EN_REVISION;

    @Column(name = "numero_instancia")
    private Integer numeroInstancia = 1;

    @Column(name = "fecha_instancia_inicio")
    private LocalDateTime fechaInstanciaInicio = LocalDateTime.now();

    @Column(name = "fecha_instancia_fin")
    private LocalDateTime fechaInstanciaFin;

    // Auditoría
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "activo")
    private Boolean activo = true;

    // Relación con Inspección (opcional, para trazabilidad)
    @OneToOne(mappedBy = "vehiculoApto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FichaInspeccion fichaInspeccion;

    // Getters y Setters
    public Long getIdVehiculoApto() {
        return idVehiculoApto;
    }

    public void setIdVehiculoApto(Long idVehiculoApto) {
        this.idVehiculoApto = idVehiculoApto;
    }

    public Tramite getTramite() {
        return tramite;
    }

    public void setTramite(Tramite tramite) {
        this.tramite = tramite;
    }

    public Vehiculo getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(Vehiculo vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Users getUsuarioAprobador() {
        return usuarioAprobador;
    }

    public void setUsuarioAprobador(Users usuarioAprobador) {
        this.usuarioAprobador = usuarioAprobador;
    }

    public EstadoDocumental getEstadoDocumental() {
        return estadoDocumental;
    }

    public void setEstadoDocumental(EstadoDocumental estadoDocumental) {
        this.estadoDocumental = estadoDocumental;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDateTime fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }

    public LocalDateTime getFechaRechazo() {
        return fechaRechazo;
    }

    public void setFechaRechazo(LocalDateTime fechaRechazo) {
        this.fechaRechazo = fechaRechazo;
    }

    public EstadoInstancia getEstadoInstancia() {
        return estadoInstancia;
    }

    public void setEstadoInstancia(EstadoInstancia estadoInstancia) {
        this.estadoInstancia = estadoInstancia;
    }

    public Integer getNumeroInstancia() {
        return numeroInstancia;
    }

    public void setNumeroInstancia(Integer numeroInstancia) {
        this.numeroInstancia = numeroInstancia;
    }

    public LocalDateTime getFechaInstanciaInicio() {
        return fechaInstanciaInicio;
    }

    public void setFechaInstanciaInicio(LocalDateTime fechaInstanciaInicio) {
        this.fechaInstanciaInicio = fechaInstanciaInicio;
    }

    public LocalDateTime getFechaInstanciaFin() {
        return fechaInstanciaFin;
    }

    public void setFechaInstanciaFin(LocalDateTime fechaInstanciaFin) {
        this.fechaInstanciaFin = fechaInstanciaFin;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public FichaInspeccion getFichaInspeccion() {
        return fichaInspeccion;
    }

    public void setFichaInspeccion(FichaInspeccion fichaInspeccion) {
        this.fichaInspeccion = fichaInspeccion;
    }
}
