package com.example.demo.dto;

import com.example.demo.model.EstadoDocumental;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

 public class FichaInspeccionResponseDTO {
     private Long idFichaInspeccion;
     private Long vehiculoId;
     private Long inspeccionId;
     private Long instanciaTramiteId;
     private Long vehiculoAptoId; // ID del registro de revisión documental
     private String vehiculoPlaca;
     private String vehiculoMarca;
     private String vehiculoModelo;
     private Boolean estado;
     private String resultado;
     private String observaciones;
     private LocalDateTime fechaInspeccion;
     private List<ParametroInspeccionResponseDTO> parametros;
     private String empresaNombre;
     private EstadoDocumental estadoDocumental;
     // Títulos del certificado
     private String tituloPrincipal;
     private String subtituloPrincipal;
     private String tituloSeccionDatosGenerales;
     private String tituloSeccionPlaca;
     private String tituloSeccionPlanLunca;
      private String tituloSeccionLaboratorio;
      private String firmaResponsable;
      private String fechaFirma;

      public FichaInspeccionResponseDTO() {}

     public Long getIdFichaInspeccion() { return idFichaInspeccion; }
     public void setIdFichaInspeccion(Long idFichaInspeccion) { this.idFichaInspeccion = idFichaInspeccion; }

    public Long getInspeccionId() { return inspeccionId; }
    public void setInspeccionId(Long inspeccionId) { this.inspeccionId = inspeccionId; }

    public Long getInstanciaTramiteId() { return instanciaTramiteId; }
    public void setInstanciaTramiteId(Long instanciaTramiteId) { this.instanciaTramiteId = instanciaTramiteId; }

    @JsonProperty("id")
    public Long getId() {
        return idFichaInspeccion;
    }

    public Long getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Long vehiculoId) { this.vehiculoId = vehiculoId; }

    public Long getVehiculoAptoId() { return vehiculoAptoId; }
    public void setVehiculoAptoId(Long vehiculoAptoId) { this.vehiculoAptoId = vehiculoAptoId; }

    public String getVehiculoPlaca() { return vehiculoPlaca; }
    public void setVehiculoPlaca(String vehiculoPlaca) { this.vehiculoPlaca = vehiculoPlaca; }

    public String getVehiculoMarca() { return vehiculoMarca; }
    public void setVehiculoMarca(String vehiculoMarca) { this.vehiculoMarca = vehiculoMarca; }

    public String getVehiculoModelo() { return vehiculoModelo; }
    public void setVehiculoModelo(String vehiculoModelo) { this.vehiculoModelo = vehiculoModelo; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getFechaInspeccion() { return fechaInspeccion; }
    public void setFechaInspeccion(LocalDateTime fechaInspeccion) { this.fechaInspeccion = fechaInspeccion; }

    public List<ParametroInspeccionResponseDTO> getParametros() { return parametros; }
    public void setParametros(List<ParametroInspeccionResponseDTO> parametros) { this.parametros = parametros; }

    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }

     public EstadoDocumental getEstadoDocumental() { return estadoDocumental; }
     public void setEstadoDocumental(EstadoDocumental estadoDocumental) { this.estadoDocumental = estadoDocumental; }

     public String getTituloPrincipal() { return tituloPrincipal; }
     public void setTituloPrincipal(String tituloPrincipal) { this.tituloPrincipal = tituloPrincipal; }

     public String getSubtituloPrincipal() { return subtituloPrincipal; }
     public void setSubtituloPrincipal(String subtituloPrincipal) { this.subtituloPrincipal = subtituloPrincipal; }

     public String getTituloSeccionDatosGenerales() { return tituloSeccionDatosGenerales; }
     public void setTituloSeccionDatosGenerales(String tituloSeccionDatosGenerales) { this.tituloSeccionDatosGenerales = tituloSeccionDatosGenerales; }

     public String getTituloSeccionPlaca() { return tituloSeccionPlaca; }
     public void setTituloSeccionPlaca(String tituloSeccionPlaca) { this.tituloSeccionPlaca = tituloSeccionPlaca; }

     public String getTituloSeccionPlanLunca() { return tituloSeccionPlanLunca; }
     public void setTituloSeccionPlanLunca(String tituloSeccionPlanLunca) { this.tituloSeccionPlanLunca = tituloSeccionPlanLunca; }

      public String getTituloSeccionLaboratorio() { return tituloSeccionLaboratorio; }
      public void setTituloSeccionLaboratorio(String tituloSeccionLaboratorio) { this.tituloSeccionLaboratorio = tituloSeccionLaboratorio; }

      public String getFirmaResponsable() { return firmaResponsable; }
      public void setFirmaResponsable(String firmaResponsable) { this.firmaResponsable = firmaResponsable; }

      public String getFechaFirma() { return fechaFirma; }
      public void setFechaFirma(String fechaFirma) { this.fechaFirma = fechaFirma; }
  }
