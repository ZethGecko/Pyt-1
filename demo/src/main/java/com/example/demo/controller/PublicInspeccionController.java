package com.example.demo.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.InspeccionPublicaDTO;
import com.example.demo.dto.VehiculoDTO;
import com.example.demo.service.InspeccionService;

@RestController
@RequestMapping("/api/publico")
public class PublicInspeccionController {

    private final InspeccionService inspeccionService;

    public PublicInspeccionController(InspeccionService inspeccionService) {
        this.inspeccionService = inspeccionService;
    }

    @GetMapping("/inspecciones")
    public List<InspeccionPublicaDTO> listarInspecciones(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) String empresa,
            @RequestParam(required = false, defaultValue = "50") int limite) {

        LocalDate desde = null;
        LocalDate hasta = null;

        if (fechaDesde != null && !fechaDesde.trim().isEmpty()) {
            desde = LocalDate.parse(fechaDesde);
        }
        if (fechaHasta != null && !fechaHasta.trim().isEmpty()) {
            hasta = LocalDate.parse(fechaHasta);
        }

        String empresaNombre = (empresa != null && !empresa.trim().isEmpty()) ? empresa.trim() : null;

        return inspeccionService.listarInspeccionesPublicas(desde, hasta, empresaNombre, limite);
    }

    @GetMapping("/inspecciones/{inspeccionId}/vehiculos")
    public List<VehiculoDTO> listarVehiculosInspeccion(@PathVariable Long inspeccionId) {
        return inspeccionService.obtenerVehiculosPorInspeccion(inspeccionId);
    }
}
