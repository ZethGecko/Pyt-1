package com.example.demo.controller;

import com.example.demo.dto.InspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.ParametroInspeccionDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
import com.example.demo.model.Inspeccion;
import com.example.demo.service.InspeccionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspecciones")
public class InspeccionController {

    private final InspeccionService inspeccionService;

    public InspeccionController(InspeccionService inspeccionService) {
        this.inspeccionService = inspeccionService;
    }

    @GetMapping
    public List<Inspeccion> listar() {
        return inspeccionService.listarTodas();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public Inspeccion crear(@RequestBody Inspeccion inspeccion) {
        return inspeccionService.guardar(inspeccion);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        inspeccionService.eliminar(id);
    }

    @GetMapping("/{id}")
    public Inspeccion obtener(@PathVariable Long id) {
        return inspeccionService.buscarPorId(id);
    }

    /**
     * Crea una inspección (y sus fichas) a partir de un trámite aprobado.
     * Para cada vehículo seleccionado se genera una ficha con los parámetros
     * por defecto del tipo de trámite.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/desde-tramite")
    public Inspeccion crearDesdeTramite(@RequestBody InspeccionCreateRequestDTO request) {
        return inspeccionService.crearDesdeTramiteAprobado(request);
    }

    /**
     * Crea una ficha adicional para un vehículo en una inspección existente.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/{inspeccionId}/fichas")
    public FichaInspeccionResponseDTO crearFicha(@PathVariable Long inspeccionId,
                                                  @RequestBody FichaInspeccionCreateRequestDTO request) {
        return inspeccionService.crearFichaParaVehiculo(inspeccionId, request);
    }

    /**
     * Agrega un parámetro a una ficha de inspección.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/fichas/{fichaId}/parametros")
    public ParametroInspeccionResponseDTO agregarParametro(@PathVariable Long fichaId,
                                                            @RequestBody ParametroInspeccionDTO dto) {
        return inspeccionService.agregarParametro(fichaId, dto);
    }

    /**
     * Actualiza un parámetro de ficha.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/parametros/{paramId}")
    public ParametroInspeccionResponseDTO actualizarParametro(@PathVariable Integer paramId,
                                                               @RequestBody ParametroInspeccionDTO dto) {
        return inspeccionService.actualizarParametro(paramId, dto);
    }

    /**
     * Elimina un parámetro de ficha.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/parametros/{paramId}")
    public void eliminarParametro(@PathVariable Integer paramId) {
        inspeccionService.eliminarParametro(paramId);
    }

    /**
     * Lista las inspecciones asociadas a un trámite.
     */
    @GetMapping("/tramite/{tramiteId}")
    public List<Inspeccion> listarPorTramite(@PathVariable Long tramiteId) {
        return inspeccionService.listarPorTramite(tramiteId);
    }
}

