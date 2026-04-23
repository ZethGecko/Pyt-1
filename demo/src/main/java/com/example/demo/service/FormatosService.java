package com.example.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.Formatos;
import com.example.demo.repository.FormatosRepository;

@Service
public class FormatosService {

    @Autowired
    private FormatosRepository repo;

    private final Path uploadDir = Paths.get("uploads", "formatos");

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(uploadDir);
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
        if (originalFilename == null) originalFilename = "file";
        String filename = UUID.randomUUID() + "_" + originalFilename;
        Path destination = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        Formatos formato = new Formatos();
        formato.setArchivoRuta(destination.toString());
        formato.setDescripcion(descripcion != null ? descripcion : originalFilename);
        formato.setFechaCreacion(LocalDateTime.now());
        return repo.save(formato);
    }

    public Resource download(Long id) throws IOException {
        Formatos formato = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formato no encontrado"));
        Path filePath = Paths.get(formato.getArchivoRuta());
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo no encontrado en disco");
        }
        return new FileSystemResource(filePath);
    }
}