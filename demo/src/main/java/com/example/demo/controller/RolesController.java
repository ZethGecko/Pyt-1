package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.Roles;
import com.example.demo.service.RolesService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/roles")
public class RolesController {

    private final RolesService service;

    public RolesController(RolesService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<java.util.Map<String, Object>> listarTodos() {
        List<Roles> roles = service.listarTodos();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "roles", roles
        ));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Roles> buscarPorNombre(@PathVariable String name) {
        return service.buscarPorNombre(name)
                .map(role -> ResponseEntity.ok(role))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Roles> obtener(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(role -> ResponseEntity.ok(role))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Roles> crear(@RequestBody Roles rol) {
        Roles saved = service.crear(rol);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Roles> actualizar(@PathVariable Long id, @RequestBody Roles rol) {
        Roles updated = service.actualizar(id, rol);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> eliminar(@PathVariable Long id) {
        boolean eliminado = service.eliminar(id);
        if (eliminado) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Rol eliminado"
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Roles> toggleEstado(@PathVariable Long id, @RequestParam boolean enabled) {
        Roles rol = service.toggleEstado(id, enabled);
        if (rol != null) {
            return ResponseEntity.ok(rol);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{roleId}/tablas/{tableName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Roles> updateTablePermissions(@PathVariable Long roleId, @PathVariable String tableName, @RequestBody Map<String, Object> permissions) {
        Roles role = service.buscarPorId(roleId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));
        Map<String, Object> tablePerms = role.getTablePermissions();
        if (tablePerms == null) {
            tablePerms = new HashMap<>();
        }
        tablePerms.put(tableName, permissions);
        role.setTablePermissions(tablePerms);
        Roles updated = service.actualizar(roleId, role);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado después de actualizar");
        }
    }

    @PostMapping("/{targetRoleId}/copiar-permisos/{sourceRoleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Roles> copyPermissions(@PathVariable Long targetRoleId, @PathVariable Long sourceRoleId) {
        Roles source = service.buscarPorId(sourceRoleId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol origen no encontrado"));
        Roles target = service.buscarPorId(targetRoleId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol destino no encontrado"));
        Map<String, Object> sourcePerms = source.getTablePermissions();
        if (sourcePerms != null) {
            target.setTablePermissions(new HashMap<>(sourcePerms));
        } else {
            target.setTablePermissions(new HashMap<>());
        }
        Roles updated = service.actualizar(targetRoleId, target);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol destino no encontrado después de actualizar");
        }
    }
}
