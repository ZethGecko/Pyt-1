package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "grupo_presentacion", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"requisito_examen_id", "fecha"}, name = "uk_grupo_requisito_fecha")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GrupoPresentacion {

    public enum EstadoGrupo {
        PROGRAMADO("programado"),
        EN_CURSO("en_curso"),
        COMPLETADO("completado"),
        CANCELADO("cancelado"),
        CERRADO("cerrado");

        private final String codigo;

        EstadoGrupo(String codigo) {
            this.codigo = codigo;
        }

        public String getCodigo() {
            return codigo;
        }

        public static EstadoGrupo fromCodigo(String codigo) {
            for (EstadoGrupo estado : values()) {
                if (estado.codigo.equalsIgnoreCase(codigo)) {
                    return estado;
                }
            }
            throw new IllegalArgumentException("Estado desconocido: " + codigo);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Grupo")
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 50)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisito_examen_id", nullable = false)
    @JsonIgnore
    private RequisitoTUPAC requisitoExamen;

    @Transient
    private Long requisitoExamenId;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio")
    private String horaInicio;

    @Column(name = "hora_fin")
    private String horaFin;

    @Column(name = "capacidad", nullable = false)
    private Integer capacidad = 20;

    @Column(name = "cupos_disponibles", nullable = false)
    private Integer cuposDisponibles = 20;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20, nullable = false)
    private EstadoGrupo estado = EstadoGrupo.PROGRAMADO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_creador_id", nullable = false)
    @JsonIgnore
    private Users usuarioCreador;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", updatable = false)
    @CreationTimestamp
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    @UpdateTimestamp
    private LocalDateTime fechaActualizacion;

    @Column(name = "creado_por")
    private String creadoPor;

    @Column(name = "actualizado_por")
    private String actualizadoPor;

    @JsonIgnore
    @OneToMany(mappedBy = "grupoPresentacion", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DocumentoTramite> documentosTramite = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuracion_examen_id")
    @JsonIgnore
    private ConfiguracionExamen configuracionExamen;

    @Version
    private Long version;

    @PrePersist
    @PreUpdate
    public void validarGrupo() {
        if (capacidad == null || capacidad <= 0) {
            throw new IllegalArgumentException("La capacidad debe ser un número positivo");
        }

        if (cuposDisponibles == null || cuposDisponibles < 0) {
            cuposDisponibles = capacidad;
        } else if (cuposDisponibles > capacidad) {
            cuposDisponibles = capacidad;
        }

        if (fecha != null && fecha.isBefore(LocalDate.now())) {
            if (estado == EstadoGrupo.PROGRAMADO) {
                estado = EstadoGrupo.COMPLETADO;
            }
        }

        if (cuposDisponibles != null && cuposDisponibles <= 0 && estado == EstadoGrupo.PROGRAMADO) {
            estado = EstadoGrupo.CERRADO;
        }
    }

    // Constructors
    public GrupoPresentacion() {
    }

    public GrupoPresentacion(String codigo, RequisitoTUPAC requisitoExamen, LocalDate fecha, Users usuarioCreador) {
        this.codigo = codigo;
        this.requisitoExamen = requisitoExamen;
        this.fecha = fecha;
        this.usuarioCreador = usuarioCreador;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public RequisitoTUPAC getRequisitoExamen() {
        return requisitoExamen;
    }

    public void setRequisitoExamen(RequisitoTUPAC requisitoExamen) {
        this.requisitoExamen = requisitoExamen;
    }

    public Long getRequisitoExamenId() {
        return requisitoExamen != null ? requisitoExamen.getId() : null;
    }

    public void setRequisitoExamenId(Long requisitoExamenId) {
        this.requisitoExamenId = requisitoExamenId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public Integer getCuposDisponibles() {
        return cuposDisponibles;
    }

    public void setCuposDisponibles(Integer cuposDisponibles) {
        this.cuposDisponibles = cuposDisponibles;
    }

    public EstadoGrupo getEstado() {
        return estado;
    }

    public void setEstado(EstadoGrupo estado) {
        this.estado = estado;
    }

    public Users getUsuarioCreador() {
        return usuarioCreador;
    }

    public void setUsuarioCreador(Users usuarioCreador) {
        this.usuarioCreador = usuarioCreador;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
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

    public String getCreadoPor() {
        return creadoPor;
    }

    public void setCreadoPor(String creadoPor) {
        this.creadoPor = creadoPor;
    }

    public String getActualizadoPor() {
        return actualizadoPor;
    }

    public void setActualizadoPor(String actualizadoPor) {
        this.actualizadoPor = actualizadoPor;
    }

    public List<DocumentoTramite> getDocumentosTramite() {
        return documentosTramite;
    }

    public void setDocumentosTramite(List<DocumentoTramite> documentosTramite) {
        this.documentosTramite = documentosTramite;
    }

    public ConfiguracionExamen getConfiguracionExamen() {
        return configuracionExamen;
    }

    public void setConfiguracionExamen(ConfiguracionExamen configuracionExamen) {
        this.configuracionExamen = configuracionExamen;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    // equals and hashCode based on id
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GrupoPresentacion)) return false;
        GrupoPresentacion that = (GrupoPresentacion) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // toString excluding lazy relationships
    @Override
    public String toString() {
        return "GrupoPresentacion{" +
                "id=" + id +
                ", codigo='" + codigo + '\'' +
                ", fecha=" + fecha +
                ", estado=" + estado +
                ", cuposDisponibles=" + cuposDisponibles +
                ", capacidad=" + capacidad +
                '}';
    }

    // Business methods (same as before)
    public boolean tieneCuposDisponibles() {
        return cuposDisponibles != null && cuposDisponibles > 0;
    }

    public boolean estaActivo() {
        return Boolean.TRUE.equals(activo) && estado != EstadoGrupo.CANCELADO;
    }

    public boolean puedeInscribir() {
        return estaActivo() &&
               tieneCuposDisponibles() &&
               estado == EstadoGrupo.PROGRAMADO &&
               (fecha == null || !fecha.isBefore(LocalDate.now()));
    }

    public boolean puedeCancelar() {
        return estado == EstadoGrupo.PROGRAMADO || estado == EstadoGrupo.EN_CURSO;
    }

    public boolean puedeIniciar() {
        return estado == EstadoGrupo.PROGRAMADO &&
               fecha != null &&
               (fecha.isEqual(LocalDate.now()) || fecha.isBefore(LocalDate.now()));
    }

    public boolean puedeCompletar() {
        return estado == EstadoGrupo.EN_CURSO;
    }

    public boolean esPasado() {
        return fecha != null && fecha.isBefore(LocalDate.now());
    }

    public boolean esProximo() {
        return fecha != null &&
               fecha.isAfter(LocalDate.now()) &&
               fecha.isBefore(LocalDate.now().plusDays(7));
    }

    public void reservarCupo() {
        if (!tieneCuposDisponibles()) {
            throw new IllegalStateException("No hay cupos disponibles en el grupo");
        }
        if (!puedeInscribir()) {
            throw new IllegalStateException("El grupo no permite inscripciones en su estado actual");
        }
        cuposDisponibles--;
        if (cuposDisponibles <= 0) {
            estado = EstadoGrupo.CERRADO;
        }
    }

    public void liberarCupo() {
        if (cuposDisponibles >= capacidad) {
            throw new IllegalStateException("No se pueden liberar más cupos de los disponibles");
        }
        cuposDisponibles++;
        if (estado == EstadoGrupo.CERRADO && cuposDisponibles > 0) {
            estado = EstadoGrupo.PROGRAMADO;
        }
    }

    public void iniciarGrupo() {
        if (!puedeIniciar()) {
            throw new IllegalStateException("El grupo no puede ser iniciado en su estado actual");
        }
        estado = EstadoGrupo.EN_CURSO;
    }

    public void completarGrupo() {
        if (!puedeCompletar()) {
            throw new IllegalStateException("El grupo no puede ser completado en su estado actual");
        }
        estado = EstadoGrupo.COMPLETADO;
    }

    public void cancelarGrupo(String motivo) {
        if (!puedeCancelar()) {
            throw new IllegalStateException("El grupo no puede ser cancelado en su estado actual");
        }
        estado = EstadoGrupo.CANCELADO;
        if (motivo != null && !motivo.isBlank()) {
            this.observaciones = (this.observaciones != null ? this.observaciones + "\n" : "") +
                               "CANCELADO: " + motivo + " - " + LocalDateTime.now();
        }
        if (cuposDisponibles != null && capacidad != null) {
            cuposDisponibles = capacidad;
        }
    }

    public void activar() {
        this.activo = true;
    }

    public void desactivar() {
        this.activo = false;
        this.estado = EstadoGrupo.CANCELADO;
    }

    public String getEstadoFormateado() {
        switch (estado) {
            case PROGRAMADO: return "Programado";
            case EN_CURSO: return "En Curso";
            case COMPLETADO: return "Completado";
            case CANCELADO: return "Cancelado";
            case CERRADO: return "Cerrado";
            default: return estado.toString();
        }
    }

    public String getColorEstado() {
        switch (estado) {
            case PROGRAMADO: return "info";
            case EN_CURSO: return "warning";
            case COMPLETADO: return "success";
            case CANCELADO: return "danger";
            case CERRADO: return "secondary";
            default: return "secondary";
        }
    }

    public String getIconoEstado() {
        switch (estado) {
            case PROGRAMADO: return "calendar";
            case EN_CURSO: return "clock";
            case COMPLETADO: return "check-circle";
            case CANCELADO: return "x-circle";
            case CERRADO: return "lock";
            default: return "users";
        }
    }

    public double getPorcentajeOcupacion() {
        if (capacidad == null || capacidad == 0) return 0.0;
        int ocupados = capacidad - cuposDisponibles;
        return (ocupados * 100.0) / capacidad;
    }

    public String getPorcentajeOcupacionFormateado() {
        return String.format("%.1f%%", getPorcentajeOcupacion());
    }

    public String getNombreCompleto() {
        return String.format("%s - %s - %s",
            codigo,
            requisitoExamen != null ? requisitoExamen.getDescripcion() : "Sin examen",
            fecha != null ? fecha.toString() : "Sin fecha"
        );
    }

    public String getInformacionGrupo() {
        StringBuilder info = new StringBuilder();
        info.append("Grupo: ").append(codigo).append("\n");
        info.append("Examen: ").append(requisitoExamen != null ? requisitoExamen.getDescripcion() : "N/A").append("\n");
        info.append("Fecha: ").append(fecha != null ? fecha.toString() : "N/A").append("\n");
        info.append("Capacidad: ").append(capacidad).append(" | Disponibles: ").append(cuposDisponibles).append("\n");
        info.append("Estado: ").append(getEstadoFormateado());
        return info.toString();
    }

    public Long getRequisitoId() {
        return requisitoExamen != null ? requisitoExamen.getId() : null;
    }

    public String getRequisitoNombre() {
        return requisitoExamen != null ? requisitoExamen.getDescripcion() : null;
    }

    public String getRequisitoCodigo() {
        return requisitoExamen != null ? requisitoExamen.getCodigo() : null;
    }
}
