package com.example.demo.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.config.StoragePathResolver;
import com.example.demo.model.DocumentoTramite;
import com.example.demo.service.DocumentoTramiteService;

@RestController
@RequestMapping("/api/documentos-tramite")
public class DocumentoTramiteController {

    private final DocumentoTramiteService service;
    private final StoragePathResolver storagePathResolver;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public DocumentoTramiteController(DocumentoTramiteService service,
                                      StoragePathResolver storagePathResolver) {
        this.service = service;
        this.storagePathResolver = storagePathResolver;
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

      @GetMapping("/instancia/{instanciaId}/proyecciones")
      public List<java.util.Map<String, Object>> getProyeccionesPorInstancia(@PathVariable Long instanciaId) {
          return service.getProyeccionesPorInstancia(instanciaId);
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

      @PutMapping("/{id}")
      public DocumentoTramite actualizar(@PathVariable Long id, @RequestBody DocumentoTramite datos) {
          // Solo permitir actualizar ciertos campos: observaciones, estado, etc.
          DocumentoTramite existente = service.buscarPorId(id)
                  .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento no encontrado"));
          
          if (datos.getObservaciones() != null) {
              existente.setObservaciones(datos.getObservaciones());
          }
          if (datos.getEstado() != null) {
              existente.setEstado(datos.getEstado());
          }
          // Se pueden agregar más campos actualizables aquí
          
          return service.guardar(existente);
      }
     
     @PostMapping("/{id}/presentar")
    public ResponseEntity<DocumentoTramite> presentarArchivo(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo) throws IOException {
        DocumentoTramite doc = service.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento no encontrado"));
        
        if (archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo no puede estar vacío");
        }
        
        String filename = System.currentTimeMillis() + "_" + archivo.getOriginalFilename();
        Path destination = storagePathResolver.resolve(uploadDir).resolve(filename);
        Files.createDirectories(destination.getParent());
        archivo.transferTo(destination);
        
        doc.setRutaArchivo(destination.toString());
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
                                     @RequestParam(required = false) String observaciones,
                                     @RequestParam(required = false) Boolean actualizarEstado) {
         return service.aprobarDocumento(id, usuarioId, observaciones, actualizarEstado);
     }

     @PutMapping("/{id}/rechazar")
     public DocumentoTramite rechazar(@PathVariable Long id,
                                      @RequestParam Long usuarioId,
                                      @RequestParam String observaciones,
                                      @RequestParam(required = false) String motivo,
                                      @RequestParam(required = false) Boolean actualizarEstado) {
         return service.rechazarDocumento(id, usuarioId, observaciones, motivo, actualizarEstado);
     }

     @PutMapping("/{id}/reprobar")
     public DocumentoTramite reprobar(@PathVariable Long id,
                                       @RequestParam Long usuarioId,
                                       @RequestParam String motivo,
                                       @RequestParam(required = false) Boolean actualizarEstado) {
         return service.rechazarDocumento(id, usuarioId, null, motivo, actualizarEstado);
     }

     @PutMapping("/{id}/observar")
     public DocumentoTramite observar(@PathVariable Long id,
                                      @RequestParam Long usuarioId,
                                      @RequestParam String observaciones,
                                      @RequestParam(required = false) Boolean actualizarEstado) {
         return service.observarDocumento(id, usuarioId, observaciones, actualizarEstado);
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