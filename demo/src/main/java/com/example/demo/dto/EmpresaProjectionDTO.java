package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmpresaProjectionDTO {
    private Long id;
    private String nombre;
    private String ruc;
    private String codigo;
    private String numeroDeResolucion;
    private String contactoTelefono;
    private String email;
    private String direccionLegal;
    private String estadoOperativo;
    private String tipoTrayectoria;
    private String observaciones;
    private LocalDate inicioVigencia;
    private LocalDate finVigencia;
    private Integer unidadesVehiculares;
    private Integer unidadesHabilitadas;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;
    private Boolean activo;
    private Long gerenteId;
    private String gerenteNombre;
    private Long subtipoTransporteId;
    private String subtipoTransporteNombre;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getRuc() { return ruc; }
    public void setRuc(String ruc) { this.ruc = ruc; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNumeroDeResolucion() { return numeroDeResolucion; }
    public void setNumeroDeResolucion(String numeroDeResolucion) { this.numeroDeResolucion = numeroDeResolucion; }

    public String getContactoTelefono() { return contactoTelefono; }
    public void setContactoTelefono(String contactoTelefono) { this.contactoTelefono = contactoTelefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDireccionLegal() { return direccionLegal; }
    public void setDireccionLegal(String direccionLegal) { this.direccionLegal = direccionLegal; }

    public String getEstadoOperativo() { return estadoOperativo; }
    public void setEstadoOperativo(String estadoOperativo) { this.estadoOperativo = estadoOperativo; }

    public String getTipoTrayectoria() { return tipoTrayectoria; }
    public void setTipoTrayectoria(String tipoTrayectoria) { this.tipoTrayectoria = tipoTrayectoria; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDate getInicioVigencia() { return inicioVigencia; }
    public void setInicioVigencia(LocalDate inicioVigencia) { this.inicioVigencia = inicioVigencia; }

    public LocalDate getFinVigencia() { return finVigencia; }
    public void setFinVigencia(LocalDate finVigencia) { this.finVigencia = finVigencia; }

    public Integer getUnidadesVehiculares() { return unidadesVehiculares; }
    public void setUnidadesVehiculares(Integer unidadesVehiculares) { this.unidadesVehiculares = unidadesVehiculares; }

    public Integer getUnidadesHabilitadas() { return unidadesHabilitadas; }
    public void setUnidadesHabilitadas(Integer unidadesHabilitadas) { this.unidadesHabilitadas = unidadesHabilitadas; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Long getGerenteId() { return gerenteId; }
    public void setGerenteId(Long gerenteId) { this.gerenteId = gerenteId; }

    public String getGerenteNombre() { return gerenteNombre; }
    public void setGerenteNombre(String gerenteNombre) { this.gerenteNombre = gerenteNombre; }

    public Long getSubtipoTransporteId() { return subtipoTransporteId; }
    public void setSubtipoTransporteId(Long subtipoTransporteId) { this.subtipoTransporteId = subtipoTransporteId; }

    public String getSubtipoTransporteNombre() { return subtipoTransporteNombre; }
    public void setSubtipoTransporteNombre(String subtipoTransporteNombre) { this.subtipoTransporteNombre = subtipoTransporteNombre; }

    public GerenteDTO getGerente() { return gerente; }
    public void setGerente(GerenteDTO gerente) { this.gerente = gerente; }

    public SubtipoTransporteDTO getSubtipoTransporte() { return subtipoTransporte; }
    public void setSubtipoTransporte(SubtipoTransporteDTO subtipoTransporte) { this.subtipoTransporte = subtipoTransporte; }

    public static class GerenteDTO {
        private Long id;
        private String nombre;
        private Integer dni;
        private String telefono;
        private String whatsapp;
        private String partidaElectronica;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public Integer getDni() { return dni; }
        public void setDni(Integer dni) { this.dni = dni; }
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        public String getWhatsapp() { return whatsapp; }
        public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
        public String getPartidaElectronica() { return partidaElectronica; }
        public void setPartidaElectronica(String partidaElectronica) { this.partidaElectronica = partidaElectronica; }
    }

    public static class SubtipoTransporteDTO {
        private Long id;
        private String nombre;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }

    private GerenteDTO gerente;
    private SubtipoTransporteDTO subtipoTransporte;
}
