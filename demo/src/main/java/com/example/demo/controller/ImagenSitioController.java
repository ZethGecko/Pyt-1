package com.example.demo.controller;

import com.example.demo.dto.ImagenSitioResponse;
import com.example.demo.model.ImagenSitio;
import com.example.demo.service.ImagenSitioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/imagenes-sitio")
public class ImagenSitioController {
    
    @Autowired
    private ImagenSitioService imagenSitioService;
    
    private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImagen(
            @RequestParam("ubicacion") String ubicacion,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "descripcion", required = false) String descripcion) {
        
        try {
            ImagenSitio.UbicacionImagen ub = ImagenSitio.UbicacionImagen.valueOf(ubicacion);
            ImagenSitio imagen = imagenSitioService.uploadImagen(ub, archivo, descripcion);
            return ResponseEntity.ok(convertToResponse(imagen));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Ubicación no válida: " + ubicacion);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al subir archivo: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<ImagenSitioResponse>> listarTodas() {
        List<ImagenSitioResponse> imagenes = imagenSitioService.listarTodas().stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(imagenes);
    }
    
    @GetMapping("/{ubicacion}")
    public ResponseEntity<ImagenSitioResponse> obtenerPorUbicacion(@PathVariable String ubicacion) {
        try {
            ImagenSitio.UbicacionImagen ub = ImagenSitio.UbicacionImagen.valueOf(ubicacion);
            Optional<ImagenSitio> imagen = imagenSitioService.obtenerPorUbicacion(ub);
            return imagen.map(val -> ResponseEntity.ok(convertToResponse(val)))
                        .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> descargarImagen(@PathVariable Long id) throws IOException {
        Optional<ImagenSitio> imagenOpt = imagenSitioService.obtenerPorId(id);
        
        if (imagenOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ImagenSitio imagen = imagenOpt.get();
        File file = new File(imagen.getUrl());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        
        InputStream resourceStream = new FileInputStream(file);
        InputStreamResource resource = new InputStreamResource(resourceStream);
        
        String contentType = imagen.getTipoArchivo() != null ? imagen.getTipoArchivo() : "application/octet-stream";
        String filename = file.getName();
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
            .body(resource);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarImagen(@PathVariable Long id) {
        try {
            imagenSitioService.eliminarImagen(id);
            return ResponseEntity.ok("Imagen eliminada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    private ImagenSitioResponse convertToResponse(ImagenSitio imagen) {
        String urlArchivo = "/api/imagenes-sitio/" + imagen.getId() + "/download";
        return new ImagenSitioResponse(
            imagen.getId(),
            imagen.getUbicacion().name(),
            urlArchivo,
            imagen.getDescripcion(),
            imagen.getFechaSubida().format(formatter),
            imagen.getTipoArchivo(),
            imagen.getTamanoArchivo()
        );
    }
}
