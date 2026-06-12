package com.example.demo.service;

import com.example.demo.config.StoragePathResolver;
import com.example.demo.model.ImagenSitio;
import com.example.demo.repository.ImagenSitioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ImagenSitioService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final ImagenSitioRepository imagenSitioRepository;
    private final StoragePathResolver storagePathResolver;

    public ImagenSitioService(ImagenSitioRepository imagenSitioRepository,
                              StoragePathResolver storagePathResolver) {
        this.imagenSitioRepository = imagenSitioRepository;
        this.storagePathResolver = storagePathResolver;
    }
    
    private Path getUploadDirectory() {
        Path dir = storagePathResolver.resolve(uploadDir).resolve("site-images").normalize();
        try {
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
            return dir.toRealPath().normalize();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de subida", e);
        }
    }

    public Path validarArchivoPermitido(String filePath) throws IOException {
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("La ruta del archivo no puede estar vacía");
        }

        Path resolvedPath = storagePathResolver.resolve(filePath).normalize();
        if (!Files.exists(resolvedPath)) {
            throw new IllegalArgumentException("Archivo no encontrado");
        }

        Path uploadDirectory = getUploadDirectory().toRealPath().normalize();
        Path canonicalPath = resolvedPath.toRealPath().normalize();
        if (!canonicalPath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("La ruta del archivo no pertenece al directorio de subida permitido");
        }

        return canonicalPath;
    }

    private String sanitizedExtension(String originalFilename) {
        if (originalFilename == null) {
            return null;
        }

        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == originalFilename.length() - 1) {
            return null;
        }

        String extension = originalFilename.substring(dotIndex + 1).trim().toLowerCase(java.util.Locale.ROOT);
        StringBuilder sanitized = new StringBuilder();
        for (int i = 0; i < extension.length(); i++) {
            char c = extension.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                sanitized.append(c);
            }
        }

        return sanitized.length() == 0 ? null : sanitized.toString();
    }
    
    @Transactional
    public ImagenSitio uploadImagen(ImagenSitio.UbicacionImagen ubicacion, MultipartFile archivo, 
                                     String descripcion) throws IOException {
        // Validar archivo
        if (archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }
        
        // Verificar si ya existe una imagen para esta ubicación
        Optional<ImagenSitio> existente = imagenSitioRepository.findByUbicacion(ubicacion);
        
        // Generar nombre único
        String originalFilename = archivo.getOriginalFilename();
        String extension = sanitizedExtension(originalFilename);
        String filename = UUID.randomUUID() + (extension != null ? "." + extension : "");
        
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
        ImagenSitio saved = imagenSitioRepository.save(imagen);
        
        if (existente.isPresent()) {
            deleteFile(existente.get().getUrl());
            imagenSitioRepository.delete(existente.get());
        }
        
        return saved;
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
    
    @Transactional
    public ImagenSitio actualizarImagen(Long id, MultipartFile archivo, String descripcion) throws IOException {
        ImagenSitio imagen = imagenSitioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        String oldUrl = imagen.getUrl();
        
        // Subir nuevo archivo
        String originalFilename = archivo.getOriginalFilename();
        String extension = sanitizedExtension(originalFilename);
        String filename = UUID.randomUUID() + (extension != null ? "." + extension : "");
        
        Path destination = getUploadDirectory().resolve(filename);
        Files.copy(archivo.getInputStream(), destination, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        
        imagen.setUrl(destination.toString());
        imagen.setDescripcion(descripcion);
        imagen.setTipoArchivo(archivo.getContentType());
        imagen.setTamanoArchivo(archivo.getSize());
        imagen.setFechaSubida(LocalDateTime.now());
        
        ImagenSitio saved = imagenSitioRepository.save(imagen);
        
        deleteFile(oldUrl);
        
        return saved;
    }
    
    @Transactional
    public void eliminarImagen(Long id) {
        ImagenSitio imagen = imagenSitioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        
        deleteFile(imagen.getUrl());
        imagenSitioRepository.deleteById(id);
    }
    
    private void deleteFile(String filePath) {
        try {
            Path resolvedPath = storagePathResolver.resolve(filePath).normalize();
            if (!Files.exists(resolvedPath)) {
                return;
            }

            Path uploadDirectory = getUploadDirectory().toRealPath().normalize();
            Path canonicalPath = resolvedPath.toRealPath().normalize();
            if (!canonicalPath.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException("La ruta del archivo no pertenece al directorio de subida permitido");
            }

            if (Files.deleteIfExists(canonicalPath)) {
                System.out.println("Archivo eliminado: " + filePath);
            }
        } catch (IOException e) {
            System.err.println("Error eliminando archivo: " + e.getMessage());
        }
    }
    
    public String getUrlImagen(ImagenSitio.UbicacionImagen ubicacion) {
        Optional<ImagenSitio> imagen = imagenSitioRepository.findByUbicacion(ubicacion);
        return imagen.map(ImagenSitio::getUrl).orElse(null);
    }
}
