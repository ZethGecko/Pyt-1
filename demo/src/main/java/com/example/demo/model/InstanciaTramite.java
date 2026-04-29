package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "instancia_tramite")
public class InstanciaTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_instancia")
    private Long idInstancia;

    @ManyToOne
    @JoinColumn(name = "tramite_id", nullable = false)
    private Tramite tramite;

    @Column(name = "identificador", length = 100, nullable = false)
    private String identificador;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "estado", length = 50, nullable = false)
    private String estado = "ACTIVO";

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "observaciones", length = 1000)
    private String observaciones;

    @OneToMany(mappedBy = "instanciaTramite", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<DocumentoTramite> documentos = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) this.estado = "ACTIVO";
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    // Getters y setters
    public Long getIdInstancia() { return idInstancia; }
    public void setIdInstancia(Long idInstancia) { this.idInstancia = idInstancia; }

    public Tramite getTramite() { return tramite; }
    public void setTramite(Tramite tramite) { this.tramite = tramite; }

    public String getIdentificador() { return identificador; }
    public void setIdentificador(String identificador) { this.identificador = identificador; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<DocumentoTramite> getDocumentos() { return documentos; }
    public void setDocumentos(List<DocumentoTramite> documentos) { this.documentos = documentos; }

    @Transient
    @JsonProperty("tramiteId")
    public Long getTramiteId() {
        return tramite != null ? tramite.getIdTramite() : null;
    }

    public void addDocumento(DocumentoTramite doc) {
        doc.setInstanciaTramite(this);
        this.documentos.add(doc);
    }

    public void removeDocumento(DocumentoTramite doc) {
        doc.setInstanciaTramite(null);
        this.documentos.remove(doc);
    }
}
