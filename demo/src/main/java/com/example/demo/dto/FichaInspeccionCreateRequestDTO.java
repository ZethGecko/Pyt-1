package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

 public class FichaInspeccionCreateRequestDTO {
     private Long inspeccionId;
     private Long vehiculoId;

     @JsonProperty("usuarioInspector")
     private Long usuarioInspectorId;

     private Boolean estado;
     private String resultado;
     private String observaciones;
     private List<ParametroInspeccionDTO> parametros;

     // Campos de título del formato
     private String tituloPrincipal;
     private String subtituloPrincipal;
     private String tituloSeccionDatosGenerales;
     private String tituloSeccionPlaca;
     private String tituloSeccionPlanLunca;
     private String tituloSeccionLaboratorio;

     public FichaInspeccionCreateRequestDTO() {}

    public Long getInspeccionId() { return inspeccionId; }
    public void setInspeccionId(Long inspeccionId) { this.inspeccionId = inspeccionId; }

    public Long getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Long vehiculoId) { this.vehiculoId = vehiculoId; }

    public Long getUsuarioInspectorId() { return usuarioInspectorId; }
    public void setUsuarioInspectorId(Long usuarioInspectorId) { this.usuarioInspectorId = usuarioInspectorId; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

     public List<ParametroInspeccionDTO> getParametros() { return parametros; }
     public void setParametros(List<ParametroInspeccionDTO> parametros) { this.parametros = parametros; }

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
 }
