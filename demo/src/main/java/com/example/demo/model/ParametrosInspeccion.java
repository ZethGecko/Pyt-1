package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

 @Entity
 @Table(name = "parametros_inspeccion")
 public class ParametrosInspeccion {

     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Integer idParametros;

     private String parametro;

     private String observacion;

     @Column(name = "seccion", length = 50)
     private String seccion;

     // Relación con FichaInspeccion
     @ManyToOne
     @JoinColumn(name = "id_ficha_inspeccion", nullable = false)
     @JsonIgnore
     private FichaInspeccion fichaInspeccion;

     // Getters y setters
     public Integer getId() { return idParametros; }
     public void setId(Integer idParametros) { this.idParametros = idParametros; }

     public Integer getIdParametros() { return idParametros; }
     public void setIdParametros(Integer idParametros) { this.idParametros = idParametros; }

     public String getParametro() { return parametro; }
     public void setParametro(String parametro) { this.parametro = parametro; }

     public String getObservacion() { return observacion; }
     public void setObservacion(String observacion) { this.observacion = observacion; }

     public String getSeccion() { return seccion; }
     public void setSeccion(String seccion) { this.seccion = seccion; }

     public FichaInspeccion getFichaInspeccion() { return fichaInspeccion; }
     public void setFichaInspeccion(FichaInspeccion fichaInspeccion) { this.fichaInspeccion = fichaInspeccion; }
 }
