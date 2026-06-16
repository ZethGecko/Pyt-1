package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

  public class FichaInspeccionUpdateRequestDTO {
      @JsonProperty("usuarioInspector")
      private Long usuarioInspectorId;
      private Boolean estado;
      private String resultado;
      private String observaciones;
      private String firmaResponsable;
      private String fechaFirma;
      private List<ParametroInspeccionDTO> parametros;

      // Campos de título del formato (opcionales)
      private String tituloPrincipal;
      private String subtituloPrincipal;
      private String subtitulo2;
      private String subtitulo3;
      private String subtitulo4;
      private String tituloSeccionDatosGenerales;
      private String tituloSeccionPlaca;
      private String tituloSeccionUnidadVehicular;
      private String tituloSeccionPlanLunca;
      private String tituloSeccionLaboratorio;

     public FichaInspeccionUpdateRequestDTO() {}

    public Long getUsuarioInspectorId() {
        return usuarioInspectorId;
    }

    public void setUsuarioInspectorId(Long usuarioInspectorId) {
        this.usuarioInspectorId = usuarioInspectorId;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

     public List<ParametroInspeccionDTO> getParametros() {
         return parametros;
     }

     public void setParametros(List<ParametroInspeccionDTO> parametros) {
         this.parametros = parametros;
     }

     public String getTituloPrincipal() { return tituloPrincipal; }
     public void setTituloPrincipal(String tituloPrincipal) { this.tituloPrincipal = tituloPrincipal; }

     public String getSubtituloPrincipal() { return subtituloPrincipal; }
     public void setSubtituloPrincipal(String subtituloPrincipal) { this.subtituloPrincipal = subtituloPrincipal; }

     public String getSubtitulo2() { return subtitulo2; }
     public void setSubtitulo2(String subtitulo2) { this.subtitulo2 = subtitulo2; }

     public String getSubtitulo3() { return subtitulo3; }
     public void setSubtitulo3(String subtitulo3) { this.subtitulo3 = subtitulo3; }

     public String getSubtitulo4() { return subtitulo4; }
     public void setSubtitulo4(String subtitulo4) { this.subtitulo4 = subtitulo4; }

     public String getTituloSeccionDatosGenerales() { return tituloSeccionDatosGenerales; }
     public void setTituloSeccionDatosGenerales(String tituloSeccionDatosGenerales) { this.tituloSeccionDatosGenerales = tituloSeccionDatosGenerales; }

     public String getTituloSeccionPlaca() { return tituloSeccionPlaca; }
     public void setTituloSeccionPlaca(String tituloSeccionPlaca) { this.tituloSeccionPlaca = tituloSeccionPlaca; }

     public String getTituloSeccionUnidadVehicular() { return tituloSeccionUnidadVehicular; }
     public void setTituloSeccionUnidadVehicular(String tituloSeccionUnidadVehicular) { this.tituloSeccionUnidadVehicular = tituloSeccionUnidadVehicular; }

     public String getTituloSeccionPlanLunca() { return tituloSeccionPlanLunca; }
     public void setTituloSeccionPlanLunca(String tituloSeccionPlanLunca) { this.tituloSeccionPlanLunca = tituloSeccionPlanLunca; }

      public String getTituloSeccionLaboratorio() { return tituloSeccionLaboratorio; }
      public void setTituloSeccionLaboratorio(String tituloSeccionLaboratorio) { this.tituloSeccionLaboratorio = tituloSeccionLaboratorio; }

      public String getFirmaResponsable() { return firmaResponsable; }
      public void setFirmaResponsable(String firmaResponsable) { this.firmaResponsable = firmaResponsable; }

      public String getFechaFirma() { return fechaFirma; }
      public void setFechaFirma(String fechaFirma) { this.fechaFirma = fechaFirma; }
  }
