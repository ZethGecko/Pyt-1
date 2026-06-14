package com.example.demo.controller;

import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.FichaInspeccionUpdateRequestDTO;
import com.example.demo.service.FichaInspeccionService;
import com.example.demo.service.InspeccionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fichas-inspeccion")
public class FichaInspeccionController {

    private final FichaInspeccionService fichaInspeccionService;
    private final InspeccionService inspeccionService;

    public FichaInspeccionController(FichaInspeccionService fichaInspeccionService,
                                     InspeccionService inspeccionService) {
        this.fichaInspeccionService = fichaInspeccionService;
        this.inspeccionService = inspeccionService;
    }

    @GetMapping
    public ResponseEntity<Page<FichaInspeccionResponseDTO>> listar(Pageable pageable) {
        Page<FichaInspeccionResponseDTO> page = fichaInspeccionService.listarTodas(pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * Lista todas las fichas de inspección asociadas a un trámite.
     * Recorre VehiculoApto → FichaInspeccion.
     */
    @GetMapping("/tramite/{tramiteId}")
    public List<FichaInspeccionResponseDTO> listarPorTramite(@PathVariable Long tramiteId) {
        return fichaInspeccionService.listarPorTramite(tramiteId);
    }

    /**
     * Lista las fichas de inspección asociadas a una inspección.
     */
    @GetMapping("/inspeccion/{inspeccionId}")
    public List<FichaInspeccionResponseDTO> listarPorInspeccion(@PathVariable Long inspeccionId) {
        return fichaInspeccionService.listarPorInspeccion(inspeccionId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FichaInspeccionResponseDTO> crear(@RequestBody FichaInspeccionCreateRequestDTO request) {
        // Para creación directa. Validar inspeccionId antes de delegar.
        if (request.getInspeccionId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (inspeccionService.buscarPorId(request.getInspeccionId()) == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        FichaInspeccionResponseDTO creado = fichaInspeccionService.guardar(request);
        return ResponseEntity.ok(creado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FichaInspeccionResponseDTO> obtener(@PathVariable Long id) {
        FichaInspeccionResponseDTO ficha = fichaInspeccionService.buscarPorId(id);
        return ficha != null ? ResponseEntity.ok(ficha) : ResponseEntity.notFound().build();
    }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasRole('SUPER_ADMIN')")
     public void eliminar(@PathVariable Long id) {
         fichaInspeccionService.eliminar(id);
     }

      @PutMapping("/{id}")
      @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
      public ResponseEntity<FichaInspeccionResponseDTO> actualizar(@PathVariable Long id,
                                                                     @RequestBody FichaInspeccionUpdateRequestDTO request) {
          FichaInspeccionResponseDTO actualizado = fichaInspeccionService.actualizar(id, request);
          return actualizado != null ? ResponseEntity.ok(actualizado) : ResponseEntity.notFound().build();
      }

      @PatchMapping("/{id}/resultado")
      @PreAuthorize("hasRole('SUPER_ADMIN')")
      public ResponseEntity<FichaInspeccionResponseDTO> actualizarResultado(@PathVariable Long id,
                                                                            @RequestBody Map<String, Object> request) {
          String resultado = request.get("resultado") != null ? request.get("resultado").toString().trim() : null;
          Boolean estado = request.get("estado") != null ? Boolean.valueOf(request.get("estado").toString()) : null;
          FichaInspeccionResponseDTO actualizado = fichaInspeccionService.actualizarResultado(id, resultado, estado);
          return actualizado != null ? ResponseEntity.ok(actualizado) : ResponseEntity.notFound().build();
      }

      /**
       * Lista las fichas aprobadas (APROBADO, estado=true) para una empresa.
       * Incluye datos completos del vehículo e inspección.
       */
      @GetMapping("/empresa/{empresaId}/aprobadas")
      public List<FichaInspeccionResponseDTO> listarAprobadasPorEmpresa(@PathVariable Long empresaId) {
          return fichaInspeccionService.listarAprobadasPorEmpresa(empresaId);
      }

      /**
       * Obtiene la ficha aprobada más reciente para un vehículo.
       * Devuelve null si el vehículo no tiene ficha aprobada.
       */
      @GetMapping("/vehiculo/{vehiculoId}/aprobada")
      public ResponseEntity<FichaInspeccionResponseDTO> obtenerAprobadaPorVehiculo(@PathVariable Long vehiculoId) {
          FichaInspeccionResponseDTO ficha = fichaInspeccionService.obtenerAprobadaPorVehiculo(vehiculoId);
          return ficha != null ? ResponseEntity.ok(ficha) : ResponseEntity.notFound().build();
      }
  }
