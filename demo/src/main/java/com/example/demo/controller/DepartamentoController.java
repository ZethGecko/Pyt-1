package com.example.demo.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.DepartamentoCreateRequest;
import com.example.demo.dto.DepartamentoResponseDTO;
import com.example.demo.dto.DepartamentoUpdateRequest;
import com.example.demo.dto.RolResponseDTO;
import com.example.demo.dto.UsuarioResumenDTO;
import com.example.demo.model.Departamento;
import com.example.demo.service.DepartamentoService;
import com.example.demo.service.UsersService;

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@RestController
@RequestMapping("/api/departamentos")
public class DepartamentoController {

    private final DepartamentoService departamentoService;
    private final UsersService usersService;
    private static final Logger logger = LoggerFactory.getLogger(DepartamentoController.class);

    public DepartamentoController(DepartamentoService departamentoService, UsersService usersService) {
        this.departamentoService = departamentoService;
        this.usersService = usersService;
    }

    private DepartamentoResponseDTO toResponseDTO(Departamento d) {
        if (d == null) return null;
        return new DepartamentoResponseDTO(
            d.getIdDepartamento(),
            d.getNombre(),
            d.getDescripcion(),
            d.getActivo(),
            d.getFechaCreacion(),
            null, // responsableId
            null  // responsableNombre
        );
    }

    @GetMapping
    public List<DepartamentoResponseDTO> listarTodos() {
        logger.info("GET /api/departamentos called");
        return departamentoService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/activos")
    public List<DepartamentoResponseDTO> listarActivos() {
        return departamentoService.listarActivos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/tramites/count")
    public long countTramites(@PathVariable Long id) {
        return departamentoService.countTramitesByDepartamento(id);
    }

    @GetMapping("/{id}")
    public DepartamentoResponseDTO obtener(@PathVariable Long id) {
        return toResponseDTO(departamentoService.buscarPorId(id).orElse(null));
    }

    @PostMapping
    public DepartamentoResponseDTO crear(@RequestBody DepartamentoCreateRequest req) {
        Departamento depto = new Departamento();
        depto.setNombre(req.getNombre());
        depto.setDescripcion(req.getDescripcion());
        depto.setActivo(true);
        depto.setFechaCreacion(java.time.LocalDateTime.now());
        Departamento guardado = departamentoService.crear(depto);
        return toResponseDTO(guardado);
    }

    @PutMapping("/{id}")
    public DepartamentoResponseDTO actualizar(@PathVariable Long id, @RequestBody DepartamentoUpdateRequest req) {
        Optional<Departamento> deptoOpt = departamentoService.buscarPorId(id);
        if (deptoOpt.isEmpty()) return null;
        Departamento depto = deptoOpt.get();
        if (req.getNombre() != null) depto.setNombre(req.getNombre());
        if (req.getDescripcion() != null) depto.setDescripcion(req.getDescripcion());
        if (req.getActivo() != null) depto.setActivo(req.getActivo());
        Departamento actualizado = departamentoService.crear(depto);
        return toResponseDTO(actualizado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        departamentoService.eliminar(id);
    }

    @PostMapping("/{id}/activar")
    public void activar(@PathVariable Long id) {
        Optional<Departamento> deptoOpt = departamentoService.buscarPorId(id);
        deptoOpt.ifPresent(depto -> {
            depto.setActivo(true);
            departamentoService.crear(depto);
        });
    }

    @PostMapping("/{id}/desactivar")
    public void desactivar(@PathVariable Long id) {
        Optional<Departamento> deptoOpt = departamentoService.buscarPorId(id);
        deptoOpt.ifPresent(depto -> {
            depto.setActivo(false);
            departamentoService.crear(depto);
        });
    }

    @GetMapping("/{id}/usuarios")
    public List<UsuarioResumenDTO> obtenerUsuarios(@PathVariable Long id) {
        // Return all users with assignment status for this department
        return usersService.listarTodos().stream()
                .map(user -> {
                    boolean asignado = user.getDepartamento() != null && user.getDepartamento().getIdDepartamento().equals(id);
                    RolResponseDTO rolDTO = new RolResponseDTO(
                        user.getRole().getId(),
                        user.getRole().getName(),
                        user.getRole().getDescription(),
                        user.getRole().getHierarchyLevel(),
                        user.getRole().getEnabled(),
                        user.getRole().getCanManageUsers()
                    );
                    UsuarioResumenDTO dto = new UsuarioResumenDTO(
                        user.getIdUsuarios(),
                        user.getUsername(),
                        user.getEmail(),
                        rolDTO,
                        user.getActive(),
                        asignado
                    );
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/asignar-usuario/{usuarioId}")
    public DepartamentoResponseDTO asignarUsuario(@PathVariable Long id, @PathVariable Long usuarioId) {
        usersService.asignarDepartamento(usuarioId, id);
        return toResponseDTO(departamentoService.buscarPorId(id).orElse(null));
    }

    @DeleteMapping("/{id}/desasignar-usuario/{usuarioId}")
    public DepartamentoResponseDTO desasignarUsuario(@PathVariable Long id, @PathVariable Long usuarioId) {
        usersService.desasignarDepartamento(usuarioId);
        return toResponseDTO(departamentoService.buscarPorId(id).orElse(null));
    }
}
