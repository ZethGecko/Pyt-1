package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.DepartamentoResponseDTO;
import com.example.demo.dto.RolResponseDTO;
import com.example.demo.dto.UserProfile;
import com.example.demo.model.Departamento;
import com.example.demo.model.Roles;
import com.example.demo.model.Users;
import com.example.demo.repository.DepartamentoRepository;
import com.example.demo.repository.UsersRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UsersService {

    @Autowired
    private UsersRepository repo;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Users> listarTodos() {
        return repo.findAll();
    }

    public Optional<Users> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public Optional<Users> buscarPorUsername(String username) {
        return Optional.ofNullable(repo.findByUsername(username));
    }

    public Optional<Users> buscarPorEmail(String email) {
        return repo.findAll().stream()
                .filter(u -> u.getEmail() != null && u.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    public boolean existsByUsername(String username) {
        return repo.findByUsername(username) != null;
    }

    public boolean existsByEmail(String email) {
        return buscarPorEmail(email).isPresent();
    }

    public Users crear(Users user) {
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getActive() == null) {
            user.setActive(true);
        }
        return repo.save(user);
    }

    public Users actualizar(Long id, Users datos) {
        return repo.findById(id).map(user -> {
            if (datos.getUsername() != null && !datos.getUsername().equals(user.getUsername())) {
                if (existsByUsername(datos.getUsername())) {
                    throw new IllegalArgumentException("El nombre de usuario ya está en uso");
                }
                user.setUsername(datos.getUsername());
            }
            if (datos.getEmail() != null && !datos.getEmail().equalsIgnoreCase(user.getEmail())) {
                if (existsByEmail(datos.getEmail())) {
                    throw new IllegalArgumentException("El email ya está en uso");
                }
                user.setEmail(datos.getEmail());
            }
            if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(datos.getPassword()));
            }
            if (datos.getActive() != null) user.setActive(datos.getActive());
            
            // Si cambia el rol, incrementar tokenVersion
            if (datos.getRole() != null) {
                Roles oldRole = user.getRole();
                if (oldRole == null || !oldRole.getId().equals(datos.getRole().getId())) {
                    int current = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
                    user.setTokenVersion(current + 1);
                }
                user.setRole(datos.getRole());
            }
            
            if (datos.getDepartamento() != null) user.setDepartamento(datos.getDepartamento());
            return repo.save(user);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public Users activar(Long id) {
        return repo.findById(id).map(user -> {
            user.setActive(true);
            return repo.save(user);
        }).orElse(null);
    }

    public Users desactivar(Long id) {
        return repo.findById(id).map(user -> {
            user.setActive(false);
            return repo.save(user);
        }).orElse(null);
    }

    // Assign a department to a user (without modifying other fields)
    public void asignarDepartamento(Long userId, Long deptId) {
        repo.findById(userId).ifPresent(user -> {
            // We need to set a managed Departamento entity, not just an id
            // For simplicity, we'll load the departamento and set it
            Optional<Departamento> deptOpt = departamentoRepository.findById(deptId);
            deptOpt.ifPresent(user::setDepartamento);
            repo.save(user);
        });
    }

    // Remove user from department
    public void desasignarDepartamento(Long userId) {
        repo.findById(userId).ifPresent(user -> {
            user.setDepartamento(null);
            repo.save(user);
        });
    }

    public UserProfile convertirAProfile(Users user) {
        if (user == null) return null;

        UserProfile profile = new UserProfile();
        profile.setId(user.getIdUsuarios());
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setActive(user.getActive());
        profile.setLastLogin(user.getLastLogin() != null ? user.getLastLogin().toString() : null);
        profile.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        profile.setUpdatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null);

        // Mapear departamento a DTO plano (sin responsable para evitar lazy loading)
        Departamento depto = user.getDepartamento();
        if (depto != null) {
            DepartamentoResponseDTO deptoDto = new DepartamentoResponseDTO(
                depto.getIdDepartamento(),
                depto.getNombre(),
                depto.getDescripcion(),
                depto.getActivo(),
                depto.getFechaCreacion(),
                null, // responsableId
                null  // responsableNombre
            );
            profile.setDepartamento(deptoDto);
        }

        // Mapear rol a DTO plano
        Roles rol = user.getRole();
        if (rol != null) {
            RolResponseDTO rolDto = new RolResponseDTO(
                rol.getId(),
                rol.getName(),
                rol.getDescription(),
                rol.getHierarchyLevel(),
                rol.getEnabled(),
                rol.getCanManageUsers()
            );
            profile.setRole(rolDto);
        }

        return profile;
    }

    public Map<String, Object> convertirAResponse(List<Users> users) {
        List<UserProfile> profiles = users.stream()
                .map(this::convertirAProfile)
                .toList();
        return Map.of(
                "success", true,
                "users", profiles
        );
    }

    public Map<String, Object> convertirAResponse(Users user) {
        UserProfile profile = convertirAProfile(user);
        return Map.of(
                "success", true,
                "user", profile
        );
    }

    public void incrementarTokenVersion(Long userId) {
        repo.findById(userId).ifPresent(user -> {
            int current = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
            user.setTokenVersion(current + 1);
            repo.save(user);
        });
    }
}
