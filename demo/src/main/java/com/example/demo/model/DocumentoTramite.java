package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documento_tramite")
public class DocumentoTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private Long idDocumento;

    @Column(name = "tramite_id", nullable = false)
    private Long tramiteId;

    @Column(name = "requisito_id", nullable = false)
    private Long requisitoId;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado; // PENDIENTE, PRESENTADO, EN_REVISION, APROBADO, REPROBADO, OBSERVADO

    @Column(name = "ruta_archivo", length = 500)
    private String rutaArchivo;

    @Column(name = "nombre_archivo", length = 255)
    private String nombreArchivo;

    @Column(name = "tipo_archivo", length = 255)
    private String tipoArchivo;

    @Column(name = "tamano_archivo")
    private Long tamanoArchivo;

    @Column(name = "version")
    private Long version;

    @Column(name = "fecha_presentacion")
    private java.time.LocalDateTime fechaPresentacion;

    @Column(name = "fecha_asignacion")
    private java.time.LocalDateTime fechaAsignacion;

    @Column(name = "fecha_revision")
    private java.time.LocalDateTime fechaRevision;

    @Column(name = "intentos_revision")
    private Integer intentosRevision;

    @Column(name = "certificado_numero", length = 200)
    private String certificadoNumero;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "historial_cambios", columnDefinition = "TEXT")
    private String historialCambios;

    @Column(name = "creado_por", length = 255)
    private String creadoPor;

    @Column(name = "actualizado_por", length = 255)
    private String actualizadoPor;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tramite_id", insertable = false, updatable = false)
    private Tramite tramite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisito_id", insertable = false, updatable = false)
    private RequisitoTUPAC requisito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_presentacion_id")
    private GrupoPresentacion grupoPresentacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_asignado_id")
    private Users usuarioAsignado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_revisa_id")
    private Users usuarioRevisa;

    // Getters y setters
    public Long getIdDocumento() { return idDocumento; }
    public void setIdDocumento(Long idDocumento) { this.idDocumento = idDocumento; }

    public Long getTramiteId() { return tramiteId; }
    public void setTramiteId(Long tramiteId) { this.tramiteId = tramiteId; }

    public Long getRequisitoId() { return requisitoId; }
    public void setRequisitoId(Long requisitoId) { this.requisitoId = requisitoId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public String getTipoArchivo() { return tipoArchivo; }
    public void setTipoArchivo(String tipoArchivo) { this.tipoArchivo = tipoArchivo; }

    public Long getTamanoArchivo() { return tamanoArchivo; }
    public void setTamanoArchivo(Long tamanoArchivo) { this.tamanoArchivo = tamanoArchivo; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public java.time.LocalDateTime getFechaPresentacion() { return fechaPresentacion; }
    public void setFechaPresentacion(java.time.LocalDateTime fechaPresentacion) { this.fechaPresentacion = fechaPresentacion; }

    public java.time.LocalDateTime getFechaAsignacion() { return fechaAsignacion; }
    public void setFechaAsignacion(java.time.LocalDateTime fechaAsignacion) { this.fechaAsignacion = fechaAsignacion; }

    public java.time.LocalDateTime getFechaRevision() { return fechaRevision; }
    public void setFechaRevision(java.time.LocalDateTime fechaRevision) { this.fechaRevision = fechaRevision; }

    public Integer getIntentosRevision() { return intentosRevision; }
    public void setIntentosRevision(Integer intentosRevision) { this.intentosRevision = intentosRevision; }

    public String getCertificadoNumero() { return certificadoNumero; }
    public void setCertificadoNumero(String certificadoNumero) { this.certificadoNumero = certificadoNumero; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getHistorialCambios() { return historialCambios; }
    public void setHistorialCambios(String historialCambios) { this.historialCambios = historialCambios; }

    public String getCreadoPor() { return creadoPor; }
    public void setCreadoPor(String creadoPor) { this.creadoPor = creadoPor; }

    public String getActualizadoPor() { return actualizadoPor; }
    public void setActualizadoPor(String actualizadoPor) { this.actualizadoPor = actualizadoPor; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Tramite getTramite() { return tramite; }
    public void setTramite(Tramite tramite) { this.tramite = tramite; }

    public RequisitoTUPAC getRequisito() { return requisito; }
    public void setRequisito(RequisitoTUPAC requisito) { this.requisito = requisito; }

    public GrupoPresentacion getGrupoPresentacion() { return grupoPresentacion; }
    public void setGrupoPresentacion(GrupoPresentacion grupoPresentacion) { this.grupoPresentacion = grupoPresentacion; }

    public Users getUsuarioAsignado() { return usuarioAsignado; }
    public void setUsuarioAsignado(Users usuarioAsignado) { this.usuarioAsignado = usuarioAsignado; }

    public Users getUsuarioRevisa() { return usuarioRevisa; }
    public void setUsuarioRevisa(Users usuarioRevisa) { this.usuarioRevisa = usuarioRevisa; }
}
