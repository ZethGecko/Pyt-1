package com.example.demo.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.ImagenSitio;
import com.example.demo.repository.ImagenSitioRepository;

@Service
public class ImagenSitioService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    private final ImagenSitioRepository imagenSitioRepository;
    
    @Autowired
    public ImagenSitioService(ImagenSitioRepository imagenSitioRepository) {
        this.imagenSitioRepository = imagenSitioRepository;
    }
    
    private Path getUploadDirectory() {
        Path dir = Paths.get(uploadDir, "site-images");
        try {
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de subida", e);
        }
        return dir;
    }
    
    public ImagenSitio uploadImagen(ImagenSitio.UbicacionImagen ubicacion, MultipartFile archivo, 
                                     String descripcion) throws IOException {
        // Validar archivo
        if (archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }
        
        // Verificar si ya existe una imagen para esta ubicación
        Optional<ImagenSitio> existente = imagenSitioRepository.findByUbicacion(ubicacion);
        if (existente.isPresent()) {
            // Eliminar archivo antiguo
            deleteFile(existente.get().getUrl());
            imagenSitioRepository.delete(existente.get());
        }
        
        // Generar nombre único
        String originalFilename = archivo.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;
        
        // Guardar archivo físico
        Path destination = getUploadDirectory().resolve(filename);
        Files.copy(archivo.getInputStream(), destination, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        
        // Crear y guardar entidad
        ImagenSitio imagen = new ImagenSitio(
            ubicacion,
            destination.toString(),
            descripcion,
            archivo.getContentType(),
            archivo.getSize()
        );
        
        return imagenSitioRepository.save(imagen);
    }
    
    public List<ImagenSitio> listarTodas() {
        return imagenSitioRepository.findAll();
    }
    
    public Optional<ImagenSitio> obtenerPorUbicacion(ImagenSitio.UbicacionImagen ubicacion) {
        return imagenSitioRepository.findByUbicacion(ubicacion);
    }
    
    public Optional<ImagenSitio> obtenerPorId(Long id) {
        return imagenSitioRepository.findById(id);
    }
    
    public ImagenSitio actualizarImagen(Long id, MultipartFile archivo, String descripcion) throws IOException {
        ImagenSitio imagen = imagenSitioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        
        // Eliminar archivo antiguo
        deleteFile(imagen.getUrl());
        
        // Subir nuevo archivo
        String originalFilename = archivo.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : "";
        String filename = UUID.randomUUID() + extension;
        
        Path destination = getUploadDirectory().resolve(filename);
        Files.copy(archivo.getInputStream(), destination, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        
        imagen.setUrl(destination.toString());
        imagen.setDescripcion(descripcion);
        imagen.setTipoArchivo(archivo.getContentType());
        imagen.setTamanoArchivo(archivo.getSize());
        imagen.setFechaSubida(LocalDateTime.now());
        
        return imagenSitioRepository.save(imagen);
    }
    
    public void eliminarImagen(Long id) {
        ImagenSitio imagen = imagenSitioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        
        deleteFile(imagen.getUrl());
        imagenSitioRepository.deleteById(id);
    }
    
    private void deleteFile(String filePath) {
        try {
            File file = new File(filePath);
            if (file.exists() && file.delete()) {
                System.out.println("Archivo eliminado: " + filePath);
            }
        } catch (Exception e) {
            System.err.println("Error eliminando archivo: " + e.getMessage());
        }
    }
    
    public String getUrlImagen(ImagenSitio.UbicacionImagen ubicacion) {
        Optional<ImagenSitio> imagen = imagenSitioRepository.findByUbicacion(ubicacion);
        return imagen.map(ImagenSitio::getUrl).orElse(null);
    }
}
