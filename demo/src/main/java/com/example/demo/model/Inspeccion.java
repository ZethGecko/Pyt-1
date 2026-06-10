package com.example.demo.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "inspeccion")
public class Inspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inspeccion")
    private Long idInspeccion;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Column(name = "hora", nullable = false)
    private String hora;

    @Column(name = "lugar", length = 200, nullable = false)
    private String lugar;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "resultado_general", length = 20)
    private String resultadoGeneral;

    @Column(name = "fecha_ejecucion")
    private LocalDateTime fechaEjecucion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    // Relación con Empresa (opcional, directamente en inspección)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @JsonIgnore
    private Empresa empresa;

    // Relación con Tramite (opcional, para vincular inspección con trámite de origen)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tramite_id")
    @JsonIgnore
    private Tramite tramite;

    // Relación con Usuario (inspector)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_inspector", nullable = true)
    @JsonIgnore
    private Users usuarioInspector;

    // Relación con Vehiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id")
    @JsonIgnore
    private Vehiculo vehiculo;

    // Relación con FormatoInspeccion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formato_inspeccion_id")
    @JsonIgnore
    private FormatoInspeccion formatoInspeccion;

    // Relación con FichaInspeccion
    @OneToMany(mappedBy = "inspeccionEntity", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<FichaInspeccion> fichasInspeccion;

    // Relación uno-a-muchos con InspeccionInstancia
    @OneToMany(mappedBy = "inspeccion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<InspeccionInstancia> instancias = new ArrayList<>();

    // Campo para agrupar inspecciones
    @Column(name = "codigo_grupo", length = 50)
    private String codigoGrupo;

    // Relación jerárquica (inspección padre/hija)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspeccion_padre_id")
    @JsonIgnore
    private Inspeccion inspeccionPadre;

    @OneToMany(mappedBy = "inspeccionPadre", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Inspeccion> inspeccionesHijas = new ArrayList<>();

    // Constructores
    public Inspeccion() {
    }

    // Getters y setters
    public Long getIdInspeccion() { return idInspeccion; }
    public void setIdInspeccion(Long idInspeccion) { this.idInspeccion = idInspeccion; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getResultadoGeneral() { return resultadoGeneral; }
    public void setResultadoGeneral(String resultadoGeneral) { this.resultadoGeneral = resultadoGeneral; }

    public LocalDateTime getFechaEjecucion() { return fechaEjecucion; }
    public void setFechaEjecucion(LocalDateTime fechaEjecucion) { this.fechaEjecucion = fechaEjecucion; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getObservacionesGenerales() { return observacionesGenerales; }
    public void setObservacionesGenerales(String observacionesGenerales) { this.observacionesGenerales = observacionesGenerales; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public Tramite getTramite() { return tramite; }
    public void setTramite(Tramite tramite) { this.tramite = tramite; }

    public Users getUsuarioInspector() { return usuarioInspector; }
    public void setUsuarioInspector(Users usuarioInspector) { this.usuarioInspector = usuarioInspector; }

    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }

    public FormatoInspeccion getFormatoInspeccion() { return formatoInspeccion; }
    public void setFormatoInspeccion(FormatoInspeccion formatoInspeccion) { this.formatoInspeccion = formatoInspeccion; }

    public List<FichaInspeccion> getFichasInspeccion() { return fichasInspeccion; }
    public void setFichasInspeccion(List<FichaInspeccion> fichasInspeccion) { this.fichasInspeccion = fichasInspeccion; }

    public List<InspeccionInstancia> getInstancias() { return instancias; }
    public void setInstancias(List<InspeccionInstancia> instancias) { this.instancias = instancias; }

    public void addInstancia(InspeccionInstancia ii) {
        ii.setInspeccion(this);
        this.instancias.add(ii);
    }

    public void removeInstancia(InspeccionInstancia ii) {
        ii.setInspeccion(null);
        this.instancias.remove(ii);
    }

    public String getCodigoGrupo() { return codigoGrupo; }
    public void setCodigoGrupo(String codigoGrupo) { this.codigoGrupo = codigoGrupo; }

    public Inspeccion getInspeccionPadre() { return inspeccionPadre; }
    public void setInspeccionPadre(Inspeccion inspeccionPadre) { this.inspeccionPadre = inspeccionPadre; }

    public List<Inspeccion> getInspeccionesHijas() { return inspeccionesHijas; }
    public void setInspeccionesHijas(List<Inspeccion> inspeccionesHijas) { this.inspeccionesHijas = inspeccionesHijas; }

    // Getters planos para empresa (a través del trámite o directa)
    public Long getEmpresaId() {
        if (empresa != null) {
            return empresa.getIdEmpresa();
        }
        if (tramite != null && tramite.getEmpresa() != null) {
            return tramite.getEmpresa().getIdEmpresa();
        }
        return null;
    }

    public String getEmpresaNombre() {
        if (empresa != null) {
            return empresa.getNombre();
        }
        if (tramite != null && tramite.getEmpresa() != null) {
            return tramite.getEmpresa().getNombre();
        }
        return null;
    }

    public String getEmpresaRuc() {
        if (empresa != null) {
            return empresa.getRuc();
        }
        if (tramite != null && tramite.getEmpresa() != null) {
            return tramite.getEmpresa().getRuc();
        }
        return null;
    }

    // Getters planos para datos de la instancia (para frontend) - compatibilidad
    // Devuelve datos de la primera instancia asociada (si existe)
    public Long getInstanciaTramiteId() {
        if (instancias != null && !instancias.isEmpty()) {
            InstanciaTramite it = instancias.get(0).getInstanciaTramite();
            return it != null ? it.getIdInstancia() : null;
        }
        return null;
    }

    public String getInstanciaIdentificador() {
        if (instancias != null && !instancias.isEmpty()) {
            InstanciaTramite it = instancias.get(0).getInstanciaTramite();
            return it != null ? it.getIdentificador() : null;
        }
        return null;
    }

    // Getter transiente para compatibilidad JSON (objeto instanciaTramite)
    @Transient
    public InstanciaTramite getInstanciaTramite() {
        if (instancias != null && !instancias.isEmpty()) {
            return instancias.get(0).getInstanciaTramite();
        }
        return null;
    }

    // Setter de compatibilidad: permite asignar una instancia directa (crea InspeccionInstancia)
    public void setInstanciaTramite(InstanciaTramite instanciaTramite) {
        if (instanciaTramite != null) {
            InspeccionInstancia ii = new InspeccionInstancia();
            ii.setInstanciaTramite(instanciaTramite);
            ii.setEstadoInstancia("PENDIENTE");
            this.addInstancia(ii);
        }
    }

    // Lifecycle: auto-set de fechas
    @PrePersist
    public void prePersist() {
        if (codigo == null || codigo.trim().isEmpty()) {
            this.codigo = generateCode();
        }
        if (fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (fechaActualizacion == null) {
            this.fechaActualizacion = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    private String generateCode() {
        int year = LocalDate.now().getYear();
        int num = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "INS-" + year + "-" + num;
    }
}
