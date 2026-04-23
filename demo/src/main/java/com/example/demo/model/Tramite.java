package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tramite", uniqueConstraints = @UniqueConstraint(columnNames = "codigo_rut", name = "uk_tramite_codigo_rut"))
public class Tramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tramite")
    private Long idTramite;

    @Column(name = "codigo_rut", length = 50, nullable = false, unique = true)
    private String codigoRut;

    @Column(name = "estado", length = 30, nullable = false)
    private String estado;

    @Column(name = "tipo_solicitante", length = 20)
    private String tipoSolicitante;

    @Column(name = "prioridad", length = 20)
    private String prioridad;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_limite")
    private LocalDateTime fechaLimite;

    @Column(name = "fecha_finalizacion")
    private LocalDateTime fechaFinalizacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "usuario_actualizador", length = 255)
    private String usuarioActualizador;

    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_tramite", nullable = false)
    private TipoTramite tipoTramite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente")
    @JsonIgnore
    private Expediente expediente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa")
    @JsonIgnore
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gerente")
    @JsonIgnore
    private Gerente gerente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_natural")
    @JsonIgnore
    private PersonaNatural personaNatural;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_registra", nullable = false)
    @JsonIgnore
    private Users usuarioRegistra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_responsable_id")
    @JsonIgnore
    private Users usuarioResponsableId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_actual")
    @JsonIgnore
    private Departamento departamentoActual;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id")
    @JsonIgnore
    private Solicitud solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tramite_origen")
    @JsonIgnore
    private Tramite tramiteOrigen;

    @OneToMany(mappedBy = "tramite", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DocumentoTramite> documentos;

    @OneToMany(mappedBy = "tramite", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<HistorialTramite> historialTramites;

    @OneToMany(mappedBy = "tramite", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Notificacion> notificaciones;

    @OneToMany(mappedBy = "tramite", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ObservacionSolicitud> observacionesSolicitudes;

    // Campo transitorio para facilitar al frontend
    @Transient
    private Long tipoTramiteId;
    
    @PostLoad
    public void postLoad() {
        if (this.tipoTramite != null) {
            this.tipoTramiteId = this.tipoTramite.getIdTipoTramite();
        }
    }

    // Getters y setters
    public Long getIdTramite() { return idTramite; }
    public void setIdTramite(Long idTramite) { this.idTramite = idTramite; }
    
    public Long getTipoTramiteId() { return tipoTramiteId; }
    public void setTipoTramiteId(Long tipoTramiteId) { this.tipoTramiteId = tipoTramiteId; }

    public String getCodigoRut() { return codigoRut; }
    public void setCodigoRut(String codigoRut) { this.codigoRut = codigoRut; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTipoSolicitante() { return tipoSolicitante; }
    public void setTipoSolicitante(String tipoSolicitante) { this.tipoSolicitante = tipoSolicitante; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDateTime getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDateTime fechaLimite) { this.fechaLimite = fechaLimite; }

    public LocalDateTime getFechaFinalizacion() { return fechaFinalizacion; }
    public void setFechaFinalizacion(LocalDateTime fechaFinalizacion) { this.fechaFinalizacion = fechaFinalizacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getUsuarioActualizador() { return usuarioActualizador; }
    public void setUsuarioActualizador(String usuarioActualizador) { this.usuarioActualizador = usuarioActualizador; }

    public TipoTramite getTipoTramite() { return tipoTramite; }
    public void setTipoTramite(TipoTramite tipoTramite) { this.tipoTramite = tipoTramite; }

    public Expediente getExpediente() { return expediente; }
    public void setExpediente(Expediente expediente) { this.expediente = expediente; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public Gerente getGerente() { return gerente; }
    public void setGerente(Gerente gerente) { this.gerente = gerente; }

    public PersonaNatural getPersonaNatural() { return personaNatural; }
    public void setPersonaNatural(PersonaNatural personaNatural) { this.personaNatural = personaNatural; }

    public Users getUsuarioRegistra() { return usuarioRegistra; }
    public void setUsuarioRegistra(Users usuarioRegistra) { this.usuarioRegistra = usuarioRegistra; }

    public Users getUsuarioResponsableId() { return usuarioResponsableId; }
    public void setUsuarioResponsableId(Users usuarioResponsableId) { this.usuarioResponsableId = usuarioResponsableId; }

    public Departamento getDepartamentoActual() { return departamentoActual; }
    public void setDepartamentoActual(Departamento departamentoActual) { this.departamentoActual = departamentoActual; }

    public Solicitud getSolicitud() { return solicitud; }
    public void setSolicitud(Solicitud solicitud) { this.solicitud = solicitud; }

    public Tramite getTramiteOrigen() { return tramiteOrigen; }
    public void setTramiteOrigen(Tramite tramiteOrigen) { this.tramiteOrigen = tramiteOrigen; }

    public List<DocumentoTramite> getDocumentos() { return documentos; }
    public void setDocumentos(List<DocumentoTramite> documentos) { this.documentos = documentos; }

    public List<HistorialTramite> getHistorialTramites() { return historialTramites; }
    public void setHistorialTramites(List<HistorialTramite> historialTramites) { this.historialTramites = historialTramites; }

    public List<Notificacion> getNotificaciones() { return notificaciones; }
    public void setNotificaciones(List<Notificacion> notificaciones) { this.notificaciones = notificaciones; }

    public List<ObservacionSolicitud> getObservacionesSolicitudes() { return observacionesSolicitudes; }
    public void setObservacionesSolicitudes(List<ObservacionSolicitud> observacionesSolicitudes) { this.observacionesSolicitudes = observacionesSolicitudes; }
}
