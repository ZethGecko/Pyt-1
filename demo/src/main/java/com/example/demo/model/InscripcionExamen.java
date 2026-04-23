package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inscripcion_examen")
public class InscripcionExamen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inscripcion")
    private Long idInscripcion;

    @Column(name = "grupo_presentacion_id", nullable = false)
    private Long grupoPresentacionId;

    @Column(name = "persona_id", nullable = false)
    private Long personaId;

    @Column(name = "tramite_id")
    private Long tramiteId;

    @Column(name = "fecha_inscripcion")
    private LocalDateTime fechaInscripcion;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "resultado", length = 50)
    private String resultado;

    @Column(name = "nota")
    private Double nota;

    @Column(name = "pagado", nullable = false)
    private Boolean pagado = false;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", insertable = false, updatable = false)
    private PersonaNatural persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tramite_id", insertable = false, updatable = false)
    private Tramite tramite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_presentacion_id", insertable = false, updatable = false)
    private GrupoPresentacion grupoPresentacion;

    // Getters y setters
    public Long getIdInscripcion() { return idInscripcion; }
    public void setIdInscripcion(Long idInscripcion) { this.idInscripcion = idInscripcion; }

    public Long getGrupoPresentacionId() { return grupoPresentacionId; }
    public void setGrupoPresentacionId(Long grupoPresentacionId) { this.grupoPresentacionId = grupoPresentacionId; }

    public Long getPersonaId() { return personaId; }
    public void setPersonaId(Long personaId) { this.personaId = personaId; }

    public Long getTramiteId() { return tramiteId; }
    public void setTramiteId(Long tramiteId) { this.tramiteId = tramiteId; }

    public LocalDateTime getFechaInscripcion() { return fechaInscripcion; }
    public void setFechaInscripcion(LocalDateTime fechaInscripcion) { this.fechaInscripcion = fechaInscripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public Double getNota() { return nota; }
    public void setNota(Double nota) { this.nota = nota; }

    public Boolean getPagado() { return pagado; }
    public void setPagado(Boolean pagado) { this.pagado = pagado; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public PersonaNatural getPersona() { return persona; }
    public void setPersona(PersonaNatural persona) { this.persona = persona; }

    public Tramite getTramite() { return tramite; }
    public void setTramite(Tramite tramite) { this.tramite = tramite; }

    public GrupoPresentacion getGrupoPresentacion() { return grupoPresentacion; }
    public void setGrupoPresentacion(GrupoPresentacion grupoPresentacion) { this.grupoPresentacion = grupoPresentacion; }
}
