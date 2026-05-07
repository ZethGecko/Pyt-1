package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imagenes_sitio")
public class ImagenSitio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ubicacion", length = 50, nullable = false, unique = true)
    private UbicacionImagen ubicacion;
    
    @Column(name = "url", length = 500, nullable = false)
    private String url;
    
    @Column(name = "descripcion", length = 255)
    private String descripcion;
    
    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida;
    
    @Column(name = "tipo_archivo", length = 100)
    private String tipoArchivo;
    
    @Column(name = "tamano_archivo")
    private Long tamanoArchivo;
    
    public enum UbicacionImagen {
        // Navbar
        HEADER_LOGO_LEFT,          // Logo en la barra de navegación (izquierda)
        HEADER_LOGO_RIGHT,         // Logo en la barra de navegación (derecha - si aplica)
        
        // Hero Inicio
        HERO_BLUE_BOX,             // Imagen dentro del recuadro azul del hero
        HERO_TITLE_LEFT,           // Espacio blanco izquierdo del título "Sistema Integral"
        HERO_TITLE_RIGHT,          // Espacio blanco derecho del título "Gestión de Transporte"
        
        // Páginas públicas individuales (encabezados)
        PAGE_HEADER_SEGUIMIENTO,   // Icono/header de Seguimiento de Trámites
        PAGE_HEADER_PUBLICACIONES, // Icono/header de Publicaciones
        PAGE_HEADER_BUSQUEDA_RUTAS,// Icono/header de Búsqueda de Rutas
        PAGE_HEADER_TRAMITES,      // Icono/header de Trámites Públicos
        PAGE_HEADER_CONSULTA,      // Icono/header de Consulta de Trámites
        
        // Footer
        FOOTER_LOGO,               // Logo pequeño en pie de página
        FOOTER_BANNER              // Banner decorativo en footer
    }
    
    // Constructors
    public ImagenSitio() {}
    
    public ImagenSitio(UbicacionImagen ubicacion, String url, String descripcion, 
                      String tipoArchivo, Long tamanoArchivo) {
        this.ubicacion = ubicacion;
        this.url = url;
        this.descripcion = descripcion;
        this.tipoArchivo = tipoArchivo;
        this.tamanoArchivo = tamanoArchivo;
        this.fechaSubida = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public UbicacionImagen getUbicacion() { return ubicacion; }
    public void setUbicacion(UbicacionImagen ubicacion) { this.ubicacion = ubicacion; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }
    
    public String getTipoArchivo() { return tipoArchivo; }
    public void setTipoArchivo(String tipoArchivo) { this.tipoArchivo = tipoArchivo; }
    
    public Long getTamanoArchivo() { return tamanoArchivo; }
    public void setTamanoArchivo(Long tamanoArchivo) { this.tamanoArchivo = tamanoArchivo; }
}
