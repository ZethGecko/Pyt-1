package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluacion_parametro")
public class EvaluacionParametro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluacion_parametro")
    private Long idEvaluacionParametro;

    @Column(name = "ficha_inspeccion", nullable = false)
    private Long fichaInspeccion;

    @Column(name = "parametro", nullable = false)
    private Long parametro;

    @Column(name = "cumplimiento", length = 20, nullable = false)
    private String cumplimiento; // CUMPLE, NO_CUMPLE, PARCIAL

    @Column(name = "fecha_evaluacion")
    private LocalDateTime fechaEvaluacion;

    @Column(name = "evidencia_foto", length = 500)
    private String evidenciaFoto;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "usuario_evaluador", length = 255)
    private String usuarioEvaluador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ficha_inspeccion", insertable = false, updatable = false)
    private FichaInspeccion fichaInspeccionEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parametro", insertable = false, updatable = false)
    private ParametrosInspeccion parametroEntity;

    // Getters y setters
    public Long getIdEvaluacionParametro() { return idEvaluacionParametro; }
    public void setIdEvaluacionParametro(Long idEvaluacionParametro) { this.idEvaluacionParametro = idEvaluacionParametro; }

    public Long getFichaInspeccion() { return fichaInspeccion; }
    public void setFichaInspeccion(Long fichaInspeccion) { this.fichaInspeccion = fichaInspeccion; }

    public Long getParametro() { return parametro; }
    public void setParametro(Long parametro) { this.parametro = parametro; }

    public String getCumplimiento() { return cumplimiento; }
    public void setCumplimiento(String cumplimiento) { this.cumplimiento = cumplimiento; }

    public LocalDateTime getFechaEvaluacion() { return fechaEvaluacion; }
    public void setFechaEvaluacion(LocalDateTime fechaEvaluacion) { this.fechaEvaluacion = fechaEvaluacion; }

    public String getEvidenciaFoto() { return evidenciaFoto; }
    public void setEvidenciaFoto(String evidenciaFoto) { this.evidenciaFoto = evidenciaFoto; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public String getUsuarioEvaluador() { return usuarioEvaluador; }
    public void setUsuarioEvaluador(String usuarioEvaluador) { this.usuarioEvaluador = usuarioEvaluador; }

    public FichaInspeccion getFichaInspeccionEntity() { return fichaInspeccionEntity; }
    public void setFichaInspeccionEntity(FichaInspeccion fichaInspeccionEntity) { this.fichaInspeccionEntity = fichaInspeccionEntity; }

    public ParametrosInspeccion getParametroEntity() { return parametroEntity; }
    public void setParametroEntity(ParametrosInspeccion parametroEntity) { this.parametroEntity = parametroEntity; }
}
