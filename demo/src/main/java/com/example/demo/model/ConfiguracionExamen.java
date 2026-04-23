package com.example.demo.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "configuracion_examen")
public class ConfiguracionExamen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_examen", length = 50, unique = true, nullable = false)
    private String tipoExamen; // "licencia_conducir_a", "licencia_conducir_b", "certificacion_especial"

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre; // "Licencia de Conducir Tipo A", "Certificación Especial"

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "capacidad_grupo", nullable = false)
    private Integer capacidadGrupo = 12;

    @Column(name = "dias_disponibles", columnDefinition = "TEXT")
    private String diasDisponibles; // JSON: [1,2,3,4,5] para Lunes-Viernes

    @Column(name = "horarios_disponibles", columnDefinition = "TEXT")
    private String horariosDisponibles; // JSON: ["08:00", "10:00", "14:00"]

    @Column(name = "tiempo_validez_meses", nullable = false)
    private Integer tiempoValidezMeses = 3; // Certificado válido por 3 meses

    @Column(name = "requiere_examen_practico", nullable = false)
    private Boolean requiereExamenPractico = true;

    @Column(name = "requiere_examen_teorico", nullable = false)
    private Boolean requiereExamenTeorico = true;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "usuario_creador")
    private Long usuarioCreador;

    @Column(name = "usuario_actualizador")
    private Long usuarioActualizador;

    @OneToMany(mappedBy = "configuracionExamen", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrupoPresentacion> gruposPresentacion = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "requisito_tupac_id")
    private RequisitoTUPAC requisitoTUPAC;

    // Constructors
    public ConfiguracionExamen() {
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipoExamen() {
        return tipoExamen;
    }

    public void setTipoExamen(String tipoExamen) {
        this.tipoExamen = tipoExamen;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getCapacidadGrupo() {
        return capacidadGrupo;
    }

    public void setCapacidadGrupo(Integer capacidadGrupo) {
        this.capacidadGrupo = capacidadGrupo;
    }

    public String getDiasDisponibles() {
        return diasDisponibles;
    }

    public void setDiasDisponibles(String diasDisponibles) {
        this.diasDisponibles = diasDisponibles;
    }

    public String getHorariosDisponibles() {
        return horariosDisponibles;
    }

    public void setHorariosDisponibles(String horariosDisponibles) {
        this.horariosDisponibles = horariosDisponibles;
    }

    public Integer getTiempoValidezMeses() {
        return tiempoValidezMeses;
    }

    public void setTiempoValidezMeses(Integer tiempoValidezMeses) {
        this.tiempoValidezMeses = tiempoValidezMeses;
    }

    public Boolean getRequiereExamenPractico() {
        return requiereExamenPractico;
    }

    public void setRequiereExamenPractico(Boolean requiereExamenPractico) {
        this.requiereExamenPractico = requiereExamenPractico;
    }

    public Boolean getRequiereExamenTeorico() {
        return requiereExamenTeorico;
    }

    public void setRequiereExamenTeorico(Boolean requiereExamenTeorico) {
        this.requiereExamenTeorico = requiereExamenTeorico;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
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

    public Long getUsuarioCreador() {
        return usuarioCreador;
    }

    public void setUsuarioCreador(Long usuarioCreador) {
        this.usuarioCreador = usuarioCreador;
    }

    public Long getUsuarioActualizador() {
        return usuarioActualizador;
    }

    public void setUsuarioActualizador(Long usuarioActualizador) {
        this.usuarioActualizador = usuarioActualizador;
    }

    public List<GrupoPresentacion> getGruposPresentacion() {
        return gruposPresentacion;
    }

    public void setGruposPresentacion(List<GrupoPresentacion> gruposPresentacion) {
        this.gruposPresentacion = gruposPresentacion;
    }

    public RequisitoTUPAC getRequisitoTUPAC() {
        return requisitoTUPAC;
    }

    public void setRequisitoTUPAC(RequisitoTUPAC requisitoTUPAC) {
        this.requisitoTUPAC = requisitoTUPAC;
    }

    // Business methods
    public boolean isValido() {
        return activo != null && activo;
    }

    public String getDescripcionCompleta() {
        return nombre + " - " + tipoExamen +
               " (Capacidad: " + capacidadGrupo + " personas, ";
    }

    // equals and hashCode based on id
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ConfiguracionExamen)) return false;
        ConfiguracionExamen that = (ConfiguracionExamen) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
