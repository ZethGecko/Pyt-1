package com.example.demo.controller;

import com.example.demo.dto.CampoFormatoDTO;
import com.example.demo.dto.FormatoInspeccionCreateRequestDTO;
import com.example.demo.dto.FormatoInspeccionResponseDTO;
import com.example.demo.service.FormatoInspeccionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formatos-inspeccion")
public class FormatoInspeccionController {

    private final FormatoInspeccionService service;

    public FormatoInspeccionController(FormatoInspeccionService service) {
        this.service = service;
    }

    @GetMapping
    public List<FormatoInspeccionResponseDTO> listarTodos() {
        return service.listarFormatos();
    }

    @GetMapping("/global")
    public ResponseEntity<FormatoInspeccionResponseDTO> obtenerGlobal() {
        FormatoInspeccionResponseDTO formato = service.obtenerFormatoGlobal();
        if (formato == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(formato);
    }

    @GetMapping("/{id}")
    public FormatoInspeccionResponseDTO obtener(@PathVariable Long id) {
        return service.obtenerFormato(id);
    }

    @GetMapping("/inspeccion/{inspeccionId}")
    public FormatoInspeccionResponseDTO obtenerPorInspeccion(@PathVariable Long inspeccionId) {
        return service.obtenerPorInspeccion(inspeccionId);
    }

    @PostMapping
    public ResponseEntity<FormatoInspeccionResponseDTO> crear(@RequestBody FormatoInspeccionCreateRequestDTO request) {
        System.out.println("[FormatoInspeccionController] POST /api/formatos-inspeccion - Request: " +
            "nombre=" + request.getNombre() + ", tituloPrincipal=" + request.getTituloPrincipal() +
            ", camposCount=" + (request.getCampos() != null ? request.getCampos().size() : 0));
        if (request.getCampos() != null) {
            request.getCampos().forEach(c ->
                System.out.println("  Campo: id=" + c.getId() + ", nombre=" + c.getNombre() + ", seccion=" + c.getSeccion())
            );
        }
        FormatoInspeccionResponseDTO creado;
        try {
            creado = service.crearFormato(request);
            System.out.println("[FormatoInspeccionController] Formato creado OK: id=" + creado.getId() +
                ", camposBackendCount=" + (creado.getCampos() != null ? creado.getCampos().size() : "null"));
            return new ResponseEntity<>(creado, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("[FormatoInspeccionController] ERROR creando formato: " + e.getMessage());
            throw e;
        }
    }

    @PutMapping("/{id}")
    public FormatoInspeccionResponseDTO actualizar(@PathVariable Long id,
                                                    @RequestBody FormatoInspeccionCreateRequestDTO request) {
        System.out.println("[FormatoInspeccionController] PUT /api/formatos-inspeccion/" + id +
            " - Request: tituloPrincipal=" + request.getTituloPrincipal() +
            ", camposCount=" + (request.getCampos() != null ? request.getCampos().size() : 0));
        if (request.getCampos() != null) {
            request.getCampos().forEach(c ->
                System.out.println("  Campo: id=" + c.getId() + ", nombre=" + c.getNombre() + ", seccion=" + c.getSeccion())
            );
        }
        try {
            FormatoInspeccionResponseDTO actualizado = service.actualizarFormato(id, request);
            System.out.println("[FormatoInspeccionController] Formato actualizado OK: id=" + actualizado.getId() +
                ", camposBackendCount=" + (actualizado.getCampos() != null ? actualizado.getCampos().size() : "null"));
            return actualizado;
        } catch (Exception e) {
            System.err.println("[FormatoInspeccionController] ERROR actualizando formato: " + e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            service.eliminarFormato(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    // Operaciones sobre campos
    @PostMapping("/{formatoId}/campos")
    public CampoFormatoDTO agregarCampo(@PathVariable Long formatoId,
                                         @RequestBody CampoFormatoDTO campoDTO) {
        return service.agregarCampo(formatoId, campoDTO);
    }

    @PutMapping("/campos/{campoId}")
    public CampoFormatoDTO actualizarCampo(@PathVariable Long campoId,
                                            @RequestBody CampoFormatoDTO campoDTO) {
        return service.actualizarCampo(campoId, campoDTO);
    }

    @DeleteMapping("/campos/{campoId}")
    public ResponseEntity<Void> eliminarCampo(@PathVariable Long campoId) {
        service.eliminarCampo(campoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{formatoId}/reordenar")
    public ResponseEntity<Void> reordenarCampos(@PathVariable Long formatoId,
                                                  @RequestBody List<Long> idsCamposEnOrden) {
        service.reordenarCampos(formatoId, idsCamposEnOrden);
        return ResponseEntity.ok().build();
    }
}
