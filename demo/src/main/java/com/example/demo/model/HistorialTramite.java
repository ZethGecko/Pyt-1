package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_tramite")
public class HistorialTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "tramite_id", nullable = false)
    private Long tramiteId;

    @Column(name = "usuario_accion_id")
    private Long usuarioAccionId;

    @Column(name = "usuario_responsable_id")
    private Long usuarioResponsableId;

    @Column(name = "departamento_origen_id")
    private Long departamentoOrigenId;

    @Column(name = "departamento_destino_id")
    private Long departamentoDestinoId;

    @Column(name = "fecha_accion")
    private LocalDateTime fechaAccion;

    @Column(name = "accion", length = 50)
    private String accion;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    // Relaciones ManyToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tramite_id", insertable = false, updatable = false)
    private Tramite tramite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_accion_id", insertable = false, updatable = false)
    private Users usuarioAccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_responsable_id", insertable = false, updatable = false)
    private Users usuarioResponsable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_origen_id", insertable = false, updatable = false)
    private Departamento departamentoOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_destino_id", insertable = false, updatable = false)
    private Departamento departamentoDestino;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTramiteId() { return tramiteId; }
    public void setTramiteId(Long tramiteId) { this.tramiteId = tramiteId; }

    public Long getUsuarioAccionId() { return usuarioAccionId; }
    public void setUsuarioAccionId(Long usuarioAccionId) { this.usuarioAccionId = usuarioAccionId; }

    public Long getUsuarioResponsableId() { return usuarioResponsableId; }
    public void setUsuarioResponsableId(Long usuarioResponsableId) { this.usuarioResponsableId = usuarioResponsableId; }

    public Long getDepartamentoOrigenId() { return departamentoOrigenId; }
    public void setDepartamentoOrigenId(Long departamentoOrigenId) { this.departamentoOrigenId = departamentoOrigenId; }

    public Long getDepartamentoDestinoId() { return departamentoDestinoId; }
    public void setDepartamentoDestinoId(Long departamentoDestinoId) { this.departamentoDestinoId = departamentoDestinoId; }

    public LocalDateTime getFechaAccion() { return fechaAccion; }
    public void setFechaAccion(LocalDateTime fechaAccion) { this.fechaAccion = fechaAccion; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Tramite getTramite() { return tramite; }
    public void setTramite(Tramite tramite) { this.tramite = tramite; }

    public Users getUsuarioAccion() { return usuarioAccion; }
    public void setUsuarioAccion(Users usuarioAccion) { this.usuarioAccion = usuarioAccion; }

    public Users getUsuarioResponsable() { return usuarioResponsable; }
    public void setUsuarioResponsable(Users usuarioResponsable) { this.usuarioResponsable = usuarioResponsable; }

    public Departamento getDepartamentoOrigen() { return departamentoOrigen; }
    public void setDepartamentoOrigen(Departamento departamentoOrigen) { this.departamentoOrigen = departamentoOrigen; }

    public Departamento getDepartamentoDestino() { return departamentoDestino; }
    public void setDepartamentoDestino(Departamento departamentoDestino) { this.departamentoDestino = departamentoDestino; }
}
