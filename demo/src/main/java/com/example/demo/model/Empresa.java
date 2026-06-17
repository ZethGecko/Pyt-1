package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

@Entity
@Audited
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Long idEmpresa;

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "ruc", length = 11, nullable = false)
    private String ruc;

    @Column(name = "codigo", length = 50, nullable = false)
    private String codigo;

    @Column(name = "numero_de_resolucion", length = 100)
    private String numeroDeResolucion;

    @Column(name = "contacto_telefono", length = 20)
    private String contactoTelefono;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "direccion_legal", columnDefinition = "TEXT")
    private String direccionLegal;

    @Column(name = "estado_operativo", length = 20)
    private String estadoOperativo;

    @Column(name = "tipo_trayectoria", length = 20)
    private String tipoTrayectoria;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "inicio_vigencia", nullable = false)
    private LocalDate inicioVigencia;

    @Column(name = "fin_vigencia")
    private LocalDate finVigencia;

    @Column(name = "unidades_vehiculares")
    private Integer unidadesVehiculares;

    @Column(name = "unidades_habilitadas")
    private Integer unidadesHabilitadas;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Transient
    private Long gerenteId;

    @Transient
    private Long subtipoTransporteId;

    // Relación con Gerente (muchas empresas pueden tener un gerente? La FK está en empresa)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gerente")
    private Gerente gerente;

    // Relación con SubtipoTransporte
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtipo_transporte")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private SubtipoTransporte subtipoTransporte;

    // Relación con Vehiculo
    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Vehiculo> vehiculos;

    // Relación con Ruta
    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Ruta> rutas;

    // Getters y setters
    public Long getId() { return idEmpresa; }
    public void setId(Long id) { this.idEmpresa = id; }

    public Long getIdEmpresa() {
        return idEmpresa;
    }

    public void setIdEmpresa(Long idEmpresa) {
        this.idEmpresa = idEmpresa;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNumeroDeResolucion() {
        return numeroDeResolucion;
    }

    public void setNumeroDeResolucion(String numeroDeResolucion) {
        this.numeroDeResolucion = numeroDeResolucion;
    }

    public String getContactoTelefono() {
        return contactoTelefono;
    }

    public void setContactoTelefono(String contactoTelefono) {
        this.contactoTelefono = contactoTelefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDireccionLegal() {
        return direccionLegal;
    }

    public void setDireccionLegal(String direccionLegal) {
        this.direccionLegal = direccionLegal;
    }

    public String getEstadoOperativo() {
        return estadoOperativo;
    }

    public void setEstadoOperativo(String estadoOperativo) {
        this.estadoOperativo = estadoOperativo;
    }

    public String getTipoTrayectoria() {
        return tipoTrayectoria;
    }

    public void setTipoTrayectoria(String tipoTrayectoria) {
        this.tipoTrayectoria = tipoTrayectoria;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDate getInicioVigencia() {
        return inicioVigencia;
    }

    public void setInicioVigencia(LocalDate inicioVigencia) {
        this.inicioVigencia = inicioVigencia;
    }

    public LocalDate getFinVigencia() {
        return finVigencia;
    }

    public void setFinVigencia(LocalDate finVigencia) {
        this.finVigencia = finVigencia;
    }

    public Integer getUnidadesVehiculares() {
        return unidadesVehiculares;
    }

    public void setUnidadesVehiculares(Integer unidadesVehiculares) {
        this.unidadesVehiculares = unidadesVehiculares;
    }

    public Integer getUnidadesHabilitadas() {
        return unidadesHabilitadas;
    }

    public void setUnidadesHabilitadas(Integer unidadesHabilitadas) {
        this.unidadesHabilitadas = unidadesHabilitadas;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Gerente getGerente() {
        return gerente;
    }

    public void setGerente(Gerente gerente) {
        this.gerente = gerente;
    }

    @JsonProperty("gerenteId")
    public Long getGerenteId() {
        return gerente != null ? gerente.getIdGerente() : gerenteId;
    }

    public void setGerenteId(Long gerenteId) {
        this.gerenteId = gerenteId;
    }

    public SubtipoTransporte getSubtipoTransporte() {
        return subtipoTransporte;
    }

    public void setSubtipoTransporte(SubtipoTransporte subtipoTransporte) {
        this.subtipoTransporte = subtipoTransporte;
    }

    @JsonProperty("subtipoTransporteId")
    public Long getSubtipoTransporteId() {
        return subtipoTransporte != null ? subtipoTransporte.getIdSubtipoTransporte() : subtipoTransporteId;
    }

    public void setSubtipoTransporteId(Long subtipoTransporteId) {
        this.subtipoTransporteId = subtipoTransporteId;
    }

    public List<Vehiculo> getVehiculos() {
        return vehiculos;
    }

    public void setVehiculos(List<Vehiculo> vehiculos) {
        this.vehiculos = vehiculos;
    }

    public List<Ruta> getRutas() {
        return rutas;
    }

    public void setRutas(List<Ruta> rutas) {
        this.rutas = rutas;
    }


}
