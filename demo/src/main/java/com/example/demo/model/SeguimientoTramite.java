package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seguimiento_tramite")
public class SeguimientoTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguimiento")
    private Long idSeguimiento;

    @Column(name = "tramite_id", nullable = false)
    private Long tramiteId;

    @Column(name = "etapa_actual_id")
    private Long etapaActualId;

    @Column(name = "usuario_responsable_id")
    private Long usuarioResponsableId;

    @Column(name = "departamento_responsable_id")
    private Long departamentoResponsableId;

    @Column(name = "fecha_inicio_etapa")
    private LocalDateTime fechaInicioEtapa;

    @Column(name = "fecha_fin_etapa")
    private LocalDateTime fechaFinEtapa;

    @Column(name = "estado_etapa", length = 20)
    private String estadoEtapa;

    @Column(name = "tiempo_transcurrido_horas")
    private Integer tiempoTranscurridoHoras;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tramite_id", insertable = false, updatable = false)
    private Tramite tramite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_responsable_id", insertable = false, updatable = false)
    private Users usuarioResponsable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_responsable_id", insertable = false, updatable = false)
    private Departamento departamentoResponsable;

    // Constructors
    public SeguimientoTramite() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getIdSeguimiento() { return idSeguimiento; }
    public void setIdSeguimiento(Long idSeguimiento) { this.idSeguimiento = idSeguimiento; }

    public Long getTramiteId() { return tramiteId; }
    public void setTramiteId(Long tramiteId) { this.tramiteId = tramiteId; }

    public Long getEtapaActualId() { return etapaActualId; }
    public void setEtapaActualId(Long etapaActualId) { this.etapaActualId = etapaActualId; }

    public Long getUsuarioResponsableId() { return usuarioResponsableId; }
    public void setUsuarioResponsableId(Long usuarioResponsableId) { this.usuarioResponsableId = usuarioResponsableId; }

    public Long getDepartamentoResponsableId() { return departamentoResponsableId; }
    public void setDepartamentoResponsableId(Long departamentoResponsableId) { this.departamentoResponsableId = departamentoResponsableId; }

    public LocalDateTime getFechaInicioEtapa() { return fechaInicioEtapa; }
    public void setFechaInicioEtapa(LocalDateTime fechaInicioEtapa) { this.fechaInicioEtapa = fechaInicioEtapa; }

    public LocalDateTime getFechaFinEtapa() { return fechaFinEtapa; }
    public void setFechaFinEtapa(LocalDateTime fechaFinEtapa) { this.fechaFinEtapa = fechaFinEtapa; }

    public String getEstadoEtapa() { return estadoEtapa; }
    public void setEstadoEtapa(String estadoEtapa) { this.estadoEtapa = estadoEtapa; }

    public Integer getTiempoTranscurridoHoras() { return tiempoTranscurridoHoras; }
    public void setTiempoTranscurridoHoras(Integer tiempoTranscurridoHoras) { this.tiempoTranscurridoHoras = tiempoTranscurridoHoras; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Tramite getTramite() { return tramite; }
    public void setTramite(Tramite tramite) { this.tramite = tramite; }

    public Users getUsuarioResponsable() { return usuarioResponsable; }
    public void setUsuarioResponsable(Users usuarioResponsable) { this.usuarioResponsable = usuarioResponsable; }

    public Departamento getDepartamentoResponsable() { return departamentoResponsable; }
    public void setDepartamentoResponsable(Departamento departamentoResponsable) { this.departamentoResponsable = departamentoResponsable; }
}