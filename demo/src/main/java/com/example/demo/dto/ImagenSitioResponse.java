package com.example.demo.dto;

public class ImagenSitioResponse {
    private Long id;
    private String ubicacion;
    private String url;
    private String descripcion;
    private String fechaSubida;
    private String tipoArchivo;
    private Long tamanoArchivo;
    
    public ImagenSitioResponse() {}
    
    public ImagenSitioResponse(Long id, String ubicacion, String url, String descripcion, 
                               String fechaSubida, String tipoArchivo, Long tamanoArchivo) {
        this.id = id;
        this.ubicacion = ubicacion;
        this.url = url;
        this.descripcion = descripcion;
        this.fechaSubida = fechaSubida;
        this.tipoArchivo = tipoArchivo;
        this.tamanoArchivo = tamanoArchivo;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(String fechaSubida) { this.fechaSubida = fechaSubida; }
    
    public String getTipoArchivo() { return tipoArchivo; }
    public void setTipoArchivo(String tipoArchivo) { this.tipoArchivo = tipoArchivo; }
    
    public Long getTamanoArchivo() { return tamanoArchivo; }
    public void setTamanoArchivo(Long tamanoArchivo) { this.tamanoArchivo = tamanoArchivo; }
}
