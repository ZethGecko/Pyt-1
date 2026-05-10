package com.example.demo.dto;

  public class ParametroInspeccionResponseDTO {
      private Long idParametros;
      private String parametro;
      private String observacion;
      private Long requisitoTUPACId;
      private String seccion;

      public ParametroInspeccionResponseDTO() {}

      public Long getIdParametros() { return idParametros; }
      public void setIdParametros(Long idParametros) { this.idParametros = idParametros; }

     public String getParametro() { return parametro; }
     public void setParametro(String parametro) { this.parametro = parametro; }

     public String getObservacion() { return observacion; }
     public void setObservacion(String observacion) { this.observacion = observacion; }

     public Long getRequisitoTUPACId() { return requisitoTUPACId; }
     public void setRequisitoTUPACId(Long requisitoTUPACId) { this.requisitoTUPACId = requisitoTUPACId; }

     public String getSeccion() { return seccion; }
     public void setSeccion(String seccion) { this.seccion = seccion; }
 }
