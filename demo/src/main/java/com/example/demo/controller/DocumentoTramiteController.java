package com.example.demo.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.core.io.InputStreamResource;

import com.example.demo.model.DocumentoTramite;
import com.example.demo.service.DocumentoTramiteService;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/documentos-tramite")
public class DocumentoTramiteController {

    private final DocumentoTramiteService service;

    public DocumentoTramiteController(DocumentoTramiteService service) {
        this.service = service;
    }

    @GetMapping
    public List<DocumentoTramite> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public DocumentoTramite obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

     @GetMapping("/tramite/{tramiteId}/projected")
     public List<java.util.Map<String, Object>> getProyeccionesPorTramite(@PathVariable Long tramiteId) {
         return service.getProyeccionesPorTramite(tramiteId);
     }

     @GetMapping("/tramite/{tramiteId}")
     public List<DocumentoTramite> listarPorTramite(@PathVariable Long tramiteId) {
        return service.listarPorTramite(tramiteId);
    }

    @GetMapping("/requisito/{requisitoId}")
    public List<DocumentoTramite> listarPorRequisito(@PathVariable Long requisitoId) {
        return service.listarPorRequisito(requisitoId);
    }

    @GetMapping("/estado/{estado}")
    public List<DocumentoTramite> listarPorEstado(@PathVariable String estado) {
        return service.listarPorEstado(estado);
    }

    @GetMapping("/estado/{estado}/count")
    public long countByEstado(@PathVariable String estado) {
        return service.countByEstado(estado);
    }

    @GetMapping("/usuario/{usuarioId}/pendientes")
    public List<DocumentoTramite> listarPendientesPorUsuario(@PathVariable Long usuarioId) {
        return service.listarPendientesPorUsuario(usuarioId);
    }

    @GetMapping("/mis-documentos")
    public List<DocumentoTramite> getMisDocumentos() {
        return service.getMisDocumentos();
    }

    @PostMapping
    public DocumentoTramite presentar(@RequestBody DocumentoTramite doc) {
        return service.presentarDocumento(doc);
    }

    @PostMapping("/{id}/presentar")
    public ResponseEntity<DocumentoTramite> presentarArchivo(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo) throws IOException {
        DocumentoTramite doc = service.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento no encontrado"));
        
        if (archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo no puede estar vacío");
        }
        
        String uploadDir = "uploads/";
        File uploadPath = new File(uploadDir);
        if (!uploadPath.exists()) {
            uploadPath.mkdirs();
        }
        
        String filename = System.currentTimeMillis() + "_" + archivo.getOriginalFilename();
        File destination = new File(uploadPath, filename);
        archivo.transferTo(destination);
        
        doc.setRutaArchivo(destination.getAbsolutePath());
        doc.setNombreArchivo(archivo.getOriginalFilename());
        doc.setTipoArchivo(archivo.getContentType());
        doc.setTamanoArchivo(archivo.getSize());
        doc.setFechaPresentacion(java.time.LocalDateTime.now());
        doc.setFechaActualizacion(java.time.LocalDateTime.now());
        doc.setVersion((doc.getVersion() != null ? doc.getVersion() : 0) + 1);
        doc.setEstado("PRESENTADO");
        
        DocumentoTramite guardado = service.guardar(doc);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}/asignar")
    public DocumentoTramite asignar(@PathVariable Long id, @RequestParam Long usuarioId) {
        return service.asignarParaRevision(id, usuarioId);
    }

    @PutMapping("/{id}/aprobar")
    public DocumentoTramite aprobar(@PathVariable Long id,
                                    @RequestParam Long usuarioId,
                                    @RequestParam(required = false) String observaciones) {
        return service.aprobarDocumento(id, usuarioId, observaciones);
    }

    @PutMapping("/{id}/rechazar")
    public DocumentoTramite rechazar(@PathVariable Long id,
                                     @RequestParam Long usuarioId,
                                     @RequestParam String observaciones,
                                     @RequestParam(required = false) String motivo) {
        return service.rechazarDocumento(id, usuarioId, observaciones, motivo);
    }

    @PutMapping("/{id}/observar")
    public DocumentoTramite observar(@PathVariable Long id,
                                     @RequestParam Long usuarioId,
                                     @RequestParam String observaciones) {
        return service.observarDocumento(id, usuarioId, observaciones);
    }

    @PutMapping("/{id}/re-presentar")
    public DocumentoTramite rePresentar(@PathVariable Long id,
                                        @RequestBody DocumentoTramite datos) {
        return service.rePresentarDocumento(id, datos.getRutaArchivo(), datos.getNombreArchivo(),
                                           datos.getTipoArchivo(), datos.getTamanoArchivo());
    }

    @PatchMapping("/{id}/certificado")
    public DocumentoTramite generarCertificado(@PathVariable Long id, @RequestParam String numeroCertificado) {
        return service.generarCertificado(id, numeroCertificado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable Long id) throws IOException {
        DocumentoTramite doc = service.getDocumentoConArchivo(id);
        
        if (doc.getRutaArchivo() == null || doc.getNombreArchivo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Documento no tiene archivo adjunto");
        }
        
        File file = new File(doc.getRutaArchivo());
        if (!file.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo físico no encontrado");
        }
        
        InputStream resourceStream = new FileInputStream(file);
        InputStreamResource resource = new InputStreamResource(resourceStream);
        
        String contentType = doc.getTipoArchivo() != null ? doc.getTipoArchivo() : "application/octet-stream";
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getNombreArchivo() + "\"")
                .body(resource);
    }
}