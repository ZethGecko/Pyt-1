package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gerente")
public class Gerente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gerente")
    private Long idGerente;

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "dni", nullable = false)
    private Integer dni;

    @Column(name = "telefono", length = 255)
    private String telefono;

    @Column(name = "partida_electronica", length = 100)
    private String partidaElectronica;

    @Column(name = "inicio_vigencia_podre", nullable = false)
    private LocalDate inicioVigenciaPodre;

    @Column(name = "fin_vigencia_podre")
    private LocalDate finVigenciaPodre;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "whatsapp", length = 255)
    private String whatsapp;

    // Constructors
    public Gerente() {
    }

    // Getters and setters
    public Long getId() { return idGerente; }
    public void setId(Long id) { this.idGerente = id; }

    public Long getIdGerente() {
        return idGerente;
    }

    public void setIdGerente(Long idGerente) {
        this.idGerente = idGerente;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getDni() {
        return dni;
    }

    public void setDni(Integer dni) {
        this.dni = dni;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getPartidaElectronica() {
        return partidaElectronica;
    }

    public void setPartidaElectronica(String partidaElectronica) {
        this.partidaElectronica = partidaElectronica;
    }

    public LocalDate getInicioVigenciaPodre() {
        return inicioVigenciaPodre;
    }

    public void setInicioVigenciaPodre(LocalDate inicioVigenciaPodre) {
        this.inicioVigenciaPodre = inicioVigenciaPodre;
    }

    public LocalDate getFinVigenciaPodre() {
        return finVigenciaPodre;
    }

    public void setFinVigenciaPodre(LocalDate finVigenciaPodre) {
        this.finVigenciaPodre = finVigenciaPodre;
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

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }
}
