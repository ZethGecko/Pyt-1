package com.example.demo.controller;

import com.example.demo.dto.FormatoResponseDTO;
import com.example.demo.model.Formatos;
import com.example.demo.service.FormatosService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/formatos")
public class FormatosController {

    private final FormatosService service;

    public FormatosController(FormatosService service) {
        this.service = service;
    }

    private FormatoResponseDTO toResponseDTO(Formatos f) {
        if (f == null) return null;
        return new FormatoResponseDTO(
            f.getIdFormato(),
            f.getArchivoRuta(),
            f.getDescripcion(),
            f.getFechaCreacion() != null ? f.getFechaCreacion().toString() : null
        );
    }

    @GetMapping
    public List<FormatoResponseDTO> listarTodos() {
        return service.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public FormatoResponseDTO obtener(@PathVariable Long id) {
        return toResponseDTO(service.buscarPorId(id).orElse(null));
    }

    @PostMapping
    public FormatoResponseDTO crear(@RequestBody Formatos formato) {
        Formatos guardado = service.crear(formato);
        return toResponseDTO(guardado);
    }

    @PutMapping("/{id}")
    public FormatoResponseDTO actualizar(@PathVariable Long id, @RequestBody Formatos formato) {
        Formatos actualizado = service.actualizar(id, formato);
        return toResponseDTO(actualizado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FormatoResponseDTO> upload(@RequestParam("archivo") MultipartFile archivo,
                                                    @RequestParam(value = "descripcion", required = false) String descripcion) {
        try {
            Formatos formato = service.upload(archivo, descripcion);
            return ResponseEntity.ok(toResponseDTO(formato));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        try {
            var resource = service.download(id);
            var formatoOpt = service.buscarPorId(id);
            String filename = formatoOpt.map(f -> f.getDescripcion()).orElse("file");
            String filePath = formatoOpt.map(f -> f.getArchivoRuta()).orElse(null);
            String contentType = "application/octet-stream";
            if (filePath != null) {
                try {
                    contentType = Files.probeContentType(Paths.get(filePath));
                    if (contentType == null) contentType = "application/octet-stream";
                } catch (IOException ignored) {}
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}