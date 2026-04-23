package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuarios")
    private Long idUsuarios;

    @Column(name = "username", nullable = false, unique = true, length = 255)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    @JsonIgnore
    private String password;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "token_version")
    private Integer tokenVersion = 0;

     @ManyToOne(fetch = FetchType.EAGER)
     @JoinColumn(name = "role_id", nullable = false)
     private Roles role;

     @ManyToOne(fetch = FetchType.EAGER)
     @JoinColumn(name = "departamento_id")
     private Departamento departamento;

    @OneToMany(mappedBy = "usuarioRegistra", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Tramite> tramitesRegistrados;

    @OneToMany(mappedBy = "usuarioResponsableId", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Tramite> tramitesResponsables;

    @OneToMany(mappedBy = "usuarioCreador", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<GrupoPresentacion> gruposPresentacion;

    @OneToMany(mappedBy = "usuarioReceptor", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Expediente> expedientes;

    @OneToMany(mappedBy = "usuarioInspector", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Inspeccion> inspecciones;

    @OneToMany(mappedBy = "usuarioObservador", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ObservacionSolicitud> observacionesSolicitudes;

    @OneToMany(mappedBy = "usuarioSubsana", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ObservacionSolicitud> observacionesSubsanadas;

    @OneToMany(mappedBy = "usuarioAprobado", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Solicitud> solicitudesAprobadas;

    @OneToMany(mappedBy = "usuarioRechaza", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Solicitud> solicitudesRechazadas;

    @OneToMany(mappedBy = "usuarioRemitente", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Notificacion> notificacionesEnviadas;

    @OneToMany(mappedBy = "usuarioDestinatario", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Notificacion> notificacionesRecibidas;

    @OneToMany(mappedBy = "usuarioActualizador", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Publicacion> publicacionesActualizadas;

    @OneToMany(mappedBy = "usuarioCreador", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Publicacion> publicacionesCreadas;

    // Constructors
    public Users() {
    }

    // Getters and setters
    public Long getIdUsuarios() {
        return idUsuarios;
    }

    public void setIdUsuarios(Long idUsuarios) {
        this.idUsuarios = idUsuarios;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Roles getRole() {
        return role;
    }

    public void setRole(Roles role) {
        this.role = role;
    }

    public Departamento getDepartamento() {
        return departamento;
    }

    public void setDepartamento(Departamento departamento) {
        this.departamento = departamento;
    }

    public List<Tramite> getTramitesRegistrados() {
        return tramitesRegistrados;
    }

    public void setTramitesRegistrados(List<Tramite> tramitesRegistrados) {
        this.tramitesRegistrados = tramitesRegistrados;
    }

    public List<Tramite> getTramitesResponsables() {
        return tramitesResponsables;
    }

    public void setTramitesResponsables(List<Tramite> tramitesResponsables) {
        this.tramitesResponsables = tramitesResponsables;
    }

    public List<GrupoPresentacion> getGruposPresentacion() {
        return gruposPresentacion;
    }

    public void setGruposPresentacion(List<GrupoPresentacion> gruposPresentacion) {
        this.gruposPresentacion = gruposPresentacion;
    }

    public List<Expediente> getExpedientes() {
        return expedientes;
    }

    public void setExpedientes(List<Expediente> expedientes) {
        this.expedientes = expedientes;
    }

    public List<Inspeccion> getInspecciones() {
        return inspecciones;
    }

    public void setInspecciones(List<Inspeccion> inspecciones) {
        this.inspecciones = inspecciones;
    }

    public List<ObservacionSolicitud> getObservacionesSolicitudes() {
        return observacionesSolicitudes;
    }

    public void setObservacionesSolicitudes(List<ObservacionSolicitud> observacionesSolicitudes) {
        this.observacionesSolicitudes = observacionesSolicitudes;
    }

    public List<ObservacionSolicitud> getObservacionesSubsanadas() {
        return observacionesSubsanadas;
    }

    public void setObservacionesSubsanadas(List<ObservacionSolicitud> observacionesSubsanadas) {
        this.observacionesSubsanadas = observacionesSubsanadas;
    }

    public List<Solicitud> getSolicitudesAprobadas() {
        return solicitudesAprobadas;
    }

    public void setSolicitudesAprobadas(List<Solicitud> solicitudesAprobadas) {
        this.solicitudesAprobadas = solicitudesAprobadas;
    }

    public List<Solicitud> getSolicitudesRechazadas() {
        return solicitudesRechazadas;
    }

    public void setSolicitudesRechazadas(List<Solicitud> solicitudesRechazadas) {
        this.solicitudesRechazadas = solicitudesRechazadas;
    }

    public List<Notificacion> getNotificacionesEnviadas() {
        return notificacionesEnviadas;
    }

    public void setNotificacionesEnviadas(List<Notificacion> notificacionesEnviadas) {
        this.notificacionesEnviadas = notificacionesEnviadas;
    }

    public List<Notificacion> getNotificacionesRecibidas() {
        return notificacionesRecibidas;
    }

    public void setNotificacionesRecibidas(List<Notificacion> notificacionesRecibidas) {
        this.notificacionesRecibidas = notificacionesRecibidas;
    }

    public List<Publicacion> getPublicacionesActualizadas() {
        return publicacionesActualizadas;
    }

    public void setPublicacionesActualizadas(List<Publicacion> publicacionesActualizadas) {
        this.publicacionesActualizadas = publicacionesActualizadas;
    }

    public List<Publicacion> getPublicacionesCreadas() {
        return publicacionesCreadas;
    }

    public void setPublicacionesCreadas(List<Publicacion> publicacionesCreadas) {
        this.publicacionesCreadas = publicacionesCreadas;
    }

    public Integer getTokenVersion() {
        return tokenVersion;
    }

    public void setTokenVersion(Integer tokenVersion) {
        this.tokenVersion = tokenVersion;
    }

    // equals and hashCode based on idUsuarios
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Users)) return false;
        Users users = (Users) o;
        return Objects.equals(idUsuarios, users.idUsuarios);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idUsuarios);
    }
}
