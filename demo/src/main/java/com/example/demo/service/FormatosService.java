package com.example.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.config.StoragePathResolver;
import com.example.demo.model.Formatos;
import com.example.demo.repository.FormatosRepository;

import jakarta.annotation.PostConstruct;

@Service
public class FormatosService {

    private final FormatosRepository repo;
    private final StoragePathResolver storagePathResolver;

    @Value("${app.formatos.dir:uploads/formatos}")
    private String formatosDir;

    public FormatosService(FormatosRepository repo, StoragePathResolver storagePathResolver) {
        this.repo = repo;
        this.storagePathResolver = storagePathResolver;
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(getUploadDirectory());
    }

    private Path getUploadDirectory() throws IOException {
        Path dir = storagePathResolver.resolve(formatosDir);
        Files.createDirectories(dir);
        return dir;
    }

    public List<Formatos> listarTodos() {
        return repo.findAll();
    }

    public Optional<Formatos> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public Formatos crear(Formatos formato) {
        if (formato.getFechaCreacion() == null) {
            formato.setFechaCreacion(LocalDateTime.now());
        }
        return repo.save(formato);
    }

    public Formatos actualizar(Long id, Formatos datos) {
        return repo.findById(id).map(formato -> {
            if (datos.getArchivoRuta() != null) formato.setArchivoRuta(datos.getArchivoRuta());
            if (datos.getDescripcion() != null) formato.setDescripcion(datos.getDescripcion());
            return repo.save(formato);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public Formatos upload(MultipartFile file, String descripcion) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = sanitizedExtension(originalFilename);
        if (extension == null || extension.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo debe tener una extensión válida");
        }

        Path targetDir = getUploadDirectory();
        Path targetDirCanonical = targetDir.toRealPath();
        String safeFilename = UUID.randomUUID() + "." + extension;
        Path destination = targetDirCanonical.resolve(safeFilename).toAbsolutePath().normalize();
        if (!destination.startsWith(targetDirCanonical)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ruta de archivo no válida");
        }

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        Formatos formato = new Formatos();
        formato.setArchivoRuta(destination.toString());
        // Si descripcion es nula o vacía, usar el nombre original del archivo
        formato.setDescripcion((descripcion != null && !descripcion.trim().isEmpty()) ? descripcion : originalFilename);
        formato.setFechaCreacion(LocalDateTime.now());
        return repo.save(formato);
    }

    private String sanitizedExtension(String originalFilename) {
        if (originalFilename == null) {
            return null;
        }

        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == originalFilename.length() - 1) {
            return null;
        }

        String extension = originalFilename.substring(dotIndex + 1).trim().toLowerCase(Locale.ROOT);
        StringBuilder sanitized = new StringBuilder();
        for (int i = 0; i < extension.length(); i++) {
            char c = extension.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                sanitized.append(c);
            }
        }

        return sanitized.length() == 0 ? null : sanitized.toString();
    }

    public Resource download(Long id) throws IOException {
        Formatos formato = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formato no encontrado"));
        Path filePath = Paths.get(formato.getArchivoRuta());
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo no encontrado en disco");
        }
        Path uploadDirCanonical = getUploadDirectory().toRealPath().normalize();
        Path filePathCanonical = filePath.toRealPath().normalize();
        if (!filePathCanonical.startsWith(uploadDirCanonical)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ruta de archivo no válida");
        }
        return new FileSystemResource(filePath);
    }
}