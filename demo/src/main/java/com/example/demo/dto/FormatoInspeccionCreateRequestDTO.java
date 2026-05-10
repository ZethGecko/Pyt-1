package com.example.demo.dto;

import java.util.List;

public class FormatoInspeccionCreateRequestDTO {
    private Long inspeccionId; // opcional, para asociar al crear
    private String nombre;
    private String descripcion;
    private String tituloPrincipal;
    private Integer tituloFontSize;
    private String subtituloPrincipal;
    private Integer subtituloFontSize;
    private String subtitulo2;
    private String subtitulo3;
    private String subtitulo4;
    private String tituloSeccionDatosGenerales;
    private String tituloSeccionPlaca;
    private String tituloSeccionPlanLunca;
    private String tituloSeccionLaboratorio;
    private List<CampoFormatoDTO> campos;

    public FormatoInspeccionCreateRequestDTO() {}

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getTituloPrincipal() {
        return tituloPrincipal;
    }

    public void setTituloPrincipal(String tituloPrincipal) {
        this.tituloPrincipal = tituloPrincipal;
    }

    public String getSubtituloPrincipal() {
        return subtituloPrincipal;
    }

    public void setSubtituloPrincipal(String subtituloPrincipal) {
        this.subtituloPrincipal = subtituloPrincipal;
    }

    public Integer getTituloFontSize() {
        return tituloFontSize;
    }

    public void setTituloFontSize(Integer tituloFontSize) {
        this.tituloFontSize = tituloFontSize;
    }

    public Integer getSubtituloFontSize() {
        return subtituloFontSize;
    }

    public void setSubtituloFontSize(Integer subtituloFontSize) {
        this.subtituloFontSize = subtituloFontSize;
    }

    public String getSubtitulo2() {
        return subtitulo2;
    }

    public void setSubtitulo2(String subtitulo2) {
        this.subtitulo2 = subtitulo2;
    }

    public String getSubtitulo3() {
        return subtitulo3;
    }

    public void setSubtitulo3(String subtitulo3) {
        this.subtitulo3 = subtitulo3;
    }

    public String getSubtitulo4() {
        return subtitulo4;
    }

    public void setSubtitulo4(String subtitulo4) {
        this.subtitulo4 = subtitulo4;
    }

    public String getTituloSeccionDatosGenerales() {
        return tituloSeccionDatosGenerales;
    }

    public void setTituloSeccionDatosGenerales(String tituloSeccionDatosGenerales) {
        this.tituloSeccionDatosGenerales = tituloSeccionDatosGenerales;
    }

    public String getTituloSeccionPlaca() {
        return tituloSeccionPlaca;
    }

    public void setTituloSeccionPlaca(String tituloSeccionPlaca) {
        this.tituloSeccionPlaca = tituloSeccionPlaca;
    }

    public String getTituloSeccionPlanLunca() {
        return tituloSeccionPlanLunca;
    }

    public void setTituloSeccionPlanLunca(String tituloSeccionPlanLunca) {
        this.tituloSeccionPlanLunca = tituloSeccionPlanLunca;
    }

    public String getTituloSeccionLaboratorio() {
        return tituloSeccionLaboratorio;
    }

    public void setTituloSeccionLaboratorio(String tituloSeccionLaboratorio) {
        this.tituloSeccionLaboratorio = tituloSeccionLaboratorio;
    }

    public List<CampoFormatoDTO> getCampos() {
        return campos;
    }

    public void setCampos(List<CampoFormatoDTO> campos) {
        this.campos = campos;
    }

    public Long getInspeccionId() {
        return inspeccionId;
    }

    public void setInspeccionId(Long inspeccionId) {
        this.inspeccionId = inspeccionId;
    }
}
