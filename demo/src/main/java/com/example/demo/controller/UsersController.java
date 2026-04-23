package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.dto.CreateUserRequest;
import com.example.demo.dto.UpdateUserRequest;
import com.example.demo.model.Roles;
import com.example.demo.model.Users;
import com.example.demo.service.RolesService;
import com.example.demo.service.UsersService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    private final UsersService service;
    private final RolesService rolesService;

    public UsersController(UsersService service, RolesService rolesService) {
        this.service = service;
        this.rolesService = rolesService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listarTodos() {
        List<Users> users = service.listarTodos();
        return ResponseEntity.ok(service.convertirAResponse(users));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<Map<String, Object>> buscarPorUsername(@PathVariable String username) {
        Optional<Users> user = service.buscarPorUsername(username);
        return user.map(u -> ResponseEntity.ok(service.convertirAResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Map<String, Object>> buscarPorEmail(@PathVariable String email) {
        Optional<Users> user = service.buscarPorEmail(email);
        return user.map(u -> ResponseEntity.ok(service.convertirAResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtener(@PathVariable Long id) {
        Optional<Users> user = service.buscarPorId(id);
        return user.map(u -> ResponseEntity.ok(service.convertirAResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> crear(@RequestBody CreateUserRequest request) {
        // Convertir request a entity
        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        // Buscar y asignar rol
        if (request.getRoleId() != null) {
            Roles role = rolesService.buscarPorId(request.getRoleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));
            user.setRole(role);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rol es requerido");
        }

        Users created = service.crear(user);
        return ResponseEntity.ok(service.convertirAResponse(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        Optional<Users> existing = service.buscarPorId(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Users userToUpdate = existing.get();

        if (request.getUsername() != null) userToUpdate.setUsername(request.getUsername());
        if (request.getEmail() != null) userToUpdate.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            userToUpdate.setPassword(request.getPassword());
        }
        if (request.getActive() != null) userToUpdate.setActive(request.getActive());

        if (request.getRoleId() != null) {
            Roles role = rolesService.buscarPorId(request.getRoleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));
            userToUpdate.setRole(role);
        }

        Users updated = service.actualizar(id, userToUpdate);
        return ResponseEntity.ok(service.convertirAResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        Optional<Users> user = service.buscarPorId(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.eliminar(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Usuario eliminado exitosamente"
        ));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable Long id) {
        Optional<Users> user = service.buscarPorId(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Users current = user.get();
        Users toggled = current.getActive() ? service.desactivar(id) : service.activar(id);
        return ResponseEntity.ok(service.convertirAResponse(toggled));
    }

    @PatchMapping("/{id}/role/{roleId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> changeUserRole(@PathVariable Long id, @PathVariable Long roleId) {
        Optional<Users> user = service.buscarPorId(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Roles> roleOpt = rolesService.buscarPorId(roleId);
        if (roleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Users current = user.get();
        current.setRole(roleOpt.get());
        Users updated = service.actualizar(id, current);
        return ResponseEntity.ok(service.convertirAResponse(updated));
    }
}
