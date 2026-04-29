 package com.example.demo.controller;

 import com.example.demo.model.DocumentoTramite;
 import com.example.demo.model.InstanciaTramite;
 import com.example.demo.service.InstanciaTramiteService;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.http.ResponseEntity;
 import org.springframework.security.access.prepost.PreAuthorize;
 import org.springframework.web.bind.annotation.*;

 import java.util.List;
 import java.util.Map;
 import java.util.HashMap;

 @RestController
 @RequestMapping("/api/instancias-tramite")
 public class InstanciaTramiteController {

     @Autowired
     private InstanciaTramiteService instanciaService;

     @GetMapping("/tramite/{tramiteId}")
     public ResponseEntity<List<InstanciaTramite>> listarPorTramite(@PathVariable Long tramiteId) {
         List<InstanciaTramite> instancias = instanciaService.listarPorTramite(tramiteId);
         return ResponseEntity.ok(instancias);
     }

     @GetMapping
     @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
     public ResponseEntity<List<InstanciaTramite>> listarTodas() {
         // En una versión futura se puede agregar paginación
         return ResponseEntity.ok(instanciaService.listarTodas());
     }

     @GetMapping("/{id}")
     public ResponseEntity<InstanciaTramite> obtener(@PathVariable Long id) {
         return instanciaService.obtenerPorId(id)
                 .map(ResponseEntity::ok)
                 .orElse(ResponseEntity.notFound().build());
     }

     @PostMapping("/tramite/{tramiteId}")
     @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
     public ResponseEntity<InstanciaTramite> crear(@PathVariable Long tramiteId, @RequestBody InstanciaTramite instancia) {
         InstanciaTramite creada = instanciaService.crear(tramiteId, instancia);
         return ResponseEntity.ok(creada);
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
     public ResponseEntity<InstanciaTramite> actualizar(@PathVariable Long id, @RequestBody InstanciaTramite instancia) {
         InstanciaTramite actualizada = instanciaService.actualizar(id, instancia);
         if (actualizada != null) {
             return ResponseEntity.ok(actualizada);
         }
         return ResponseEntity.notFound().build();
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
     public ResponseEntity<Map<String, Boolean>> eliminar(@PathVariable Long id) {
         boolean eliminado = true;
         try {
             instanciaService.eliminar(id);
         } catch (Exception e) {
             eliminado = false;
         }
         Map<String, Boolean> resp = new HashMap<>();
         resp.put("eliminado", eliminado);
         return ResponseEntity.ok(resp);
     }

      @GetMapping("/{id}/documentos")
      public ResponseEntity<List<DocumentoTramite>> obtenerDocumentos(@PathVariable Long id) {
          List<DocumentoTramite> documentos = instanciaService.obtenerDocumentosDeInstancia(id);
          return ResponseEntity.ok(documentos);
      }
 }
