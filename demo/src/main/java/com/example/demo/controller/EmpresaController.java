package com.example.demo.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.EmpresaProjectionDTO;
import com.example.demo.model.Empresa;
import com.example.demo.service.EmpresaService;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @GetMapping
    public List<Empresa> listar() {
        return empresaService.listarTodas();
    }

    @GetMapping("/activas")
    public List<Empresa> listarActivas() {
        return empresaService.listarTodas().stream()
                .filter(Empresa::getActivo)
                .toList();
    }

    @GetMapping("/search/projected")
    public List<EmpresaProjectionDTO> buscarProyecciones(@RequestParam("termino") String termino) {
        return empresaService.buscarProyecciones(termino);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public Empresa crear(@RequestBody Empresa empresa) {
        return empresaService.guardar(empresa);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public Empresa actualizar(@PathVariable Long id, @RequestBody Empresa empresa) {
        empresa.setIdEmpresa(id);
        return empresaService.guardar(empresa);
    }

    @GetMapping("/{id}")
    public Empresa obtener(@PathVariable Long id) {
        return empresaService.buscarPorId(id.intValue());
    }

    @GetMapping("/{id}/projected")
    public EmpresaProjectionDTO obtenerProjection(@PathVariable Long id) {
        EmpresaProjectionDTO projection = empresaService.obtenerProjection(id.intValue());
        if (projection == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Empresa no encontrada");
        }
        return projection;
    }

    @GetMapping("/{id}/can-delete")
    public boolean puedeEliminar(@PathVariable Long id) {
        return empresaService.puedeEliminar(id.intValue());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}/activar")
    public Empresa activar(@PathVariable Long id) {
        return empresaService.activar(id.intValue());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}/desactivar")
    public Empresa desactivar(@PathVariable Long id) {
        return empresaService.desactivar(id.intValue());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        empresaService.eliminar(id.intValue());
    }
}
