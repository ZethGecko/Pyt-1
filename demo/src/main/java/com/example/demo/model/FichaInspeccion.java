package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

@Entity
@Audited
@Table(name = "ficha_inspeccion")
public class FichaInspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ficha_inspeccion")
    private Long idFichaInspeccion;

    @Column(name = "inspeccion")
    private Long inspeccion;

    @Column(name = "usuario_inspector", nullable = true)
    private Long usuarioInspector;

    @Column(name = "vehiculo")
    private Long vehiculo;

    @Column(name = "instancia_tramite_id")
    private Long instanciaTramiteId;

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

    @Column(name = "firma_responsable", length = 200)
    private String firmaResponsable;

    @Column(name = "fecha_firma", length = 20)
    private String fechaFirma;

    @Column(name = "solicitud")
    private Long solicitud;

    // Relación con FormatoInspeccion (qué formato usa esta ficha)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_formato_inspeccion", nullable = false)
    @JsonIgnore
    private FormatoInspeccion formatoInspeccion;

    // Relación con Inspeccion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspeccion", insertable = false, updatable = false)
    @JsonIgnore
    private Inspeccion inspeccionEntity;

    // Relación con Solicitud
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud", insertable = false, updatable = false)
    @JsonIgnore
    private Solicitud solicitudEntity;

    // Relación con Usuario (inspector)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_inspector", insertable = false, updatable = false)
    @JsonIgnore
    private Users usuarioInspectorEntity;

    // Relación con Vehiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo", insertable = false, updatable = false)
    @JsonIgnore
    private Vehiculo vehiculoEntity;

    // Relación con VehiculoApto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo_apto")
    @JsonIgnore
    private VehiculoApto vehiculoApto;

    // Relación con ValorCampo (valores de los campos de esta ficha)
    @OneToMany(mappedBy = "fichaInspeccion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private List<ValorCampo> valores;

    // Lifecycle callbacks
    @PrePersist
    public void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (fechaActualizacion == null) {
            fechaActualizacion = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    // Getters y setters
    public Long getIdFichaInspeccion() {
        return idFichaInspeccion;
    }

    public void setIdFichaInspeccion(Long idFichaInspeccion) {
        this.idFichaInspeccion = idFichaInspeccion;
    }

    public Long getInspeccion() {
        return inspeccion;
    }

    public void setInspeccion(Long inspeccion) {
        this.inspeccion = inspeccion;
    }

    public Long getUsuarioInspector() {
        return usuarioInspector;
    }

    public void setUsuarioInspector(Long usuarioInspector) {
        this.usuarioInspector = usuarioInspector;
    }

    public Long getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(Long vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Long getInstanciaTramiteId() {
        return instanciaTramiteId;
    }

    public void setInstanciaTramiteId(Long instanciaTramiteId) {
        this.instanciaTramiteId = instanciaTramiteId;
    }

    public Long getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Long solicitud) {
        this.solicitud = solicitud;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaInspeccion() {
        return fechaInspeccion;
    }

    public void setFechaInspeccion(LocalDateTime fechaInspeccion) {
        this.fechaInspeccion = fechaInspeccion;
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

    public String getFirmaResponsable() {
        return firmaResponsable;
    }

    public void setFirmaResponsable(String firmaResponsable) {
        this.firmaResponsable = firmaResponsable;
    }

    public String getFechaFirma() {
        return fechaFirma;
    }

    public void setFechaFirma(String fechaFirma) {
        this.fechaFirma = fechaFirma;
    }

    public FormatoInspeccion getFormatoInspeccion() {
        return formatoInspeccion;
    }

    public void setFormatoInspeccion(FormatoInspeccion formatoInspeccion) {
        this.formatoInspeccion = formatoInspeccion;
    }

    public Inspeccion getInspeccionEntity() {
        return inspeccionEntity;
    }

    public void setInspeccionEntity(Inspeccion inspeccionEntity) {
        this.inspeccionEntity = inspeccionEntity;
    }

    public Solicitud getSolicitudEntity() {
        return solicitudEntity;
    }

    public void setSolicitudEntity(Solicitud solicitudEntity) {
        this.solicitudEntity = solicitudEntity;
    }

    public Users getUsuarioInspectorEntity() {
        return usuarioInspectorEntity;
    }

    public void setUsuarioInspectorEntity(Users usuarioInspectorEntity) {
        this.usuarioInspectorEntity = usuarioInspectorEntity;
    }

    public Vehiculo getVehiculoEntity() {
        return vehiculoEntity;
    }

    public void setVehiculoEntity(Vehiculo vehiculoEntity) {
        this.vehiculoEntity = vehiculoEntity;
    }

    public VehiculoApto getVehiculoApto() {
        return vehiculoApto;
    }

    public void setVehiculoApto(VehiculoApto vehiculoApto) {
        this.vehiculoApto = vehiculoApto;
    }

    public List<ValorCampo> getValores() {
        return valores;
    }

    public void setValores(List<ValorCampo> valores) {
        this.valores = valores;
    }
}
