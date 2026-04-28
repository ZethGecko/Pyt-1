package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tupac")
public class TUPAC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTupac;

    @Column(name = "fecha_vigencia")
    private LocalDateTime fechaVigencia;

    @Column(nullable = false, length = 20)
    private String estado;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(length = 200)
    private String descripcion;

    // Relación con TUC (un TUPAC puede tener varios TUC)
    @JsonIgnore
    @OneToMany(mappedBy = "tupac", cascade = CascadeType.ALL)
    private List<TUC> tucs;

    // Relación con Requisito_TUPAC
    @JsonIgnore
    @OneToMany(mappedBy = "tupac", cascade = CascadeType.ALL)
    private List<RequisitoTUPAC> requisitos;

    // Relación con TipoSolicitud deshabilitada por problema de columna
    // @ManyToOne
    // @JoinColumn(name = "id_tiposolicitud", nullable = false)
    // private TipoSolicitud tipoSolicitud;

     // Getters y setters
     @JsonProperty("id")
     public Long getId() { return idTupac; }
     
     @JsonProperty("id")
     public void setId(Long id) { this.idTupac = id; }
     
     public Long getIdTupac() { return idTupac; }
     public void setIdTupac(Long idTupac) { this.idTupac = idTupac; }

    public LocalDateTime getFechaVigencia() { return fechaVigencia; }
    public void setFechaVigencia(LocalDateTime fechaVigencia) { this.fechaVigencia = fechaVigencia; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public List<TUC> getTucs() { return tucs; }
    public void setTucs(List<TUC> tucs) { this.tucs = tucs; }

    public List<RequisitoTUPAC> getRequisitos() { return requisitos; }
    public void setRequisitos(List<RequisitoTUPAC> requisitos) { this.requisitos = requisitos; }

    // Getter/Setter deshabilitados para tipoSolicitud
    // public TipoSolicitud getTipoSolicitud() { return null; }
    // public void setTipoSolicitud(TipoSolicitud tipoSolicitud) {}
}
