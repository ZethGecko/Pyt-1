package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Roles;
import com.example.demo.repository.RolesRepository;

@Service
public class RolesService {

    @Autowired
    private RolesRepository repo;

    public List<Roles> listarTodos() {
        return repo.findAll();
    }

    public Optional<Roles> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public Optional<Roles> buscarPorNombre(String name) {
        return repo.findByName(name);
    }

    public Roles crear(Roles rol) {
        if (rol.getCreatedAt() == null) {
            rol.setCreatedAt(LocalDateTime.now());
        }
        if (rol.getEnabled() == null) {
            rol.setEnabled(true);
        }
        if (rol.getIsSystem() == null) {
            rol.setIsSystem(false);
        }
        if (rol.getTablePermissions() == null) {
            rol.setTablePermissions(new java.util.HashMap<>());
        }
        return repo.save(rol);
    }

    public Roles actualizar(Long id, Roles datos) {
        return repo.findById(id).map(rol -> {
            if (datos.getName() != null && !datos.getName().equals(rol.getName())) {
                if (repo.findByName(datos.getName()).isPresent()) {
                    throw new IllegalArgumentException("El nombre del rol ya está en uso");
                }
                rol.setName(datos.getName());
            }
            if (datos.getDescription() != null) rol.setDescription(datos.getDescription());
            if (datos.getHierarchyLevel() != null) rol.setHierarchyLevel(datos.getHierarchyLevel());
            if (datos.getEnabled() != null) rol.setEnabled(datos.getEnabled());
            if (datos.getIsSystem() != null && !datos.getIsSystem().equals(rol.getIsSystem())) {
                throw new IllegalStateException("No se puede cambiar el flag isSystem de un rol");
            }
            if (datos.getCanViewAllData() != null) rol.setCanViewAllData(datos.getCanViewAllData());
            if (datos.getCanManageAllData() != null) rol.setCanManageAllData(datos.getCanManageAllData());
            if (datos.getCanEditOwnData() != null) rol.setCanEditOwnData(datos.getCanEditOwnData());
            if (datos.getCanCreateData() != null) rol.setCanCreateData(datos.getCanCreateData());
            if (datos.getCanDeleteData() != null) rol.setCanDeleteData(datos.getCanDeleteData());
            if (datos.getCanManageUsers() != null) rol.setCanManageUsers(datos.getCanManageUsers());
            if (datos.getTablePermissions() != null) rol.setTablePermissions(datos.getTablePermissions());
            return repo.save(rol);
        }).orElse(null);
    }

    public boolean eliminar(Long id) {
        return repo.findById(id).map(rol -> {
            if (rol.getIsSystem()) {
                throw new IllegalStateException("No se puede eliminar un rol del sistema");
            }
            repo.delete(rol);
            return true;
        }).orElse(false);
    }

    public Roles toggleEstado(Long id, boolean enabled) {
        return repo.findById(id).map(rol -> {
            rol.setEnabled(enabled);
            return repo.save(rol);
        }).orElse(null);
    }
}
