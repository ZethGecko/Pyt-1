package com.example.demo.controller;

import com.example.demo.model.Empresa;
import com.example.demo.service.EmpresaService;
import com.example.demo.service.GerenteService;
import com.example.demo.service.PersonaNaturalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitantes")
public class SolicitanteController {

    private final EmpresaService empresaService;
    private final PersonaNaturalService personaNaturalService;
    private final GerenteService gerenteService;

    public SolicitanteController(EmpresaService empresaService,
                                PersonaNaturalService personaNaturalService,
                                GerenteService gerenteService) {
        this.empresaService = empresaService;
        this.personaNaturalService = personaNaturalService;
        this.gerenteService = gerenteService;
    }

    @GetMapping("/selector/activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<Map<String, Object>> obtenerSolicitantesActivos() {
        List<Map<String, Object>> solicitantes = new ArrayList<>();

        // Agregar empresas activas
        empresaService.listarTodas().stream()
                .filter(e -> "ACTIVO".equals(e.getEstadoOperativo()) || e.getEstadoOperativo() == null)
                .forEach(empresa -> {
            Map<String, Object> sol = new HashMap<>();
            sol.put("value", empresa.getIdEmpresa());
            sol.put("label", empresa.getNombre() + " (RUC: " + empresa.getRuc() + ")");
            sol.put("identificacion", empresa.getRuc());
            sol.put("nombre", empresa.getNombre());
            sol.put("tipo", "Empresa");
            sol.put("contacto", empresa.getEmail() != null ? empresa.getEmail() :
                          empresa.getContactoTelefono() != null ? empresa.getContactoTelefono() : "");
            solicitantes.add(sol);
        });

        // Agregar personas naturales activas
        personaNaturalService.listarTodos().forEach(persona -> {
            Map<String, Object> sol = new HashMap<>();
            sol.put("value", persona.getIdPersonaNatural());
            sol.put("label", persona.getNombres() + " " + persona.getApellidos() +
                           " (DNI: " + persona.getDni() + ")");
            sol.put("identificacion", String.valueOf(persona.getDni()));
            sol.put("nombre", persona.getNombres() + " " + persona.getApellidos());
            sol.put("tipo", "PersonaNatural");
            sol.put("contacto", persona.getEmail() != null ? persona.getEmail() :
                              persona.getTelefono() != null ? persona.getTelefono() : "");
            solicitantes.add(sol);
        });

        // Agregar gerentes
        gerenteService.listarTodos().forEach(gerente -> {
            Map<String, Object> sol = new HashMap<>();
            sol.put("value", gerente.getIdGerente());
            sol.put("label", gerente.getNombre() + " (DNI: " + gerente.getDni() + ")");
            sol.put("identificacion", String.valueOf(gerente.getDni()));
            sol.put("nombre", gerente.getNombre());
            sol.put("tipo", "Gerente");
            sol.put("contacto", gerente.getTelefono() != null ? gerente.getTelefono() :
                              gerente.getWhatsapp() != null ? gerente.getWhatsapp() : "");
            solicitantes.add(sol);
        });

        return solicitantes;
    }

    @GetMapping("/selector/buscar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<Map<String, Object>> buscarSolicitantes(@RequestParam String termino) {
        List<Map<String, Object>> solicitantes = new ArrayList<>();
        String terminoLower = termino.toLowerCase();

        // Buscar en empresas
        empresaService.listarTodas().stream()
                .filter(e -> e.getNombre().toLowerCase().contains(terminoLower) ||
                           e.getRuc().contains(termino))
                .forEach(empresa -> {
            Map<String, Object> sol = new HashMap<>();
            sol.put("value", empresa.getIdEmpresa());
            sol.put("label", empresa.getNombre() + " (RUC: " + empresa.getRuc() + ")");
            sol.put("identificacion", empresa.getRuc());
            sol.put("nombre", empresa.getNombre());
            sol.put("tipo", "Empresa");
            sol.put("contacto", empresa.getEmail());
            solicitantes.add(sol);
        });

        // Buscar en personas naturales
        personaNaturalService.listarTodos().stream()
                .filter(p -> (p.getNombres() + " " + p.getApellidos()).toLowerCase().contains(terminoLower) ||
                           String.valueOf(p.getDni()).contains(termino))
                .forEach(persona -> {
            Map<String, Object> sol = new HashMap<>();
            sol.put("value", persona.getIdPersonaNatural());
            sol.put("label", persona.getNombres() + " " + persona.getApellidos() +
                           " (DNI: " + persona.getDni() + ")");
            sol.put("identificacion", String.valueOf(persona.getDni()));
            sol.put("nombre", persona.getNombres() + " " + persona.getApellidos());
            sol.put("tipo", "PersonaNatural");
            sol.put("contacto", persona.getEmail());
            solicitantes.add(sol);
        });

        // Buscar en gerentes
        gerenteService.listarTodos().stream()
                .filter(g -> g.getNombre().toLowerCase().contains(terminoLower) ||
                           String.valueOf(g.getDni()).contains(termino))
                .forEach(gerente -> {
            Map<String, Object> sol = new HashMap<>();
            sol.put("value", gerente.getIdGerente());
            sol.put("label", gerente.getNombre() + " (DNI: " + gerente.getDni() + ")");
            sol.put("identificacion", String.valueOf(gerente.getDni()));
            sol.put("nombre", gerente.getNombre());
            sol.put("tipo", "Gerente");
            sol.put("contacto", gerente.getTelefono());
            solicitantes.add(sol);
        });

        return solicitantes;
    }

    @PostMapping("/persona/{personaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> crearSolicitanteParaPersona(
            @PathVariable Long personaId,
            @RequestBody Map<String, Object> datosContacto) {

        // Verificar que la persona existe
        return personaNaturalService.buscarPorId(personaId)
                .map(persona -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Solicitante creado exitosamente para persona natural");
                    response.put("personaId", personaId);
                    response.put("tipo", "PersonaNatural");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/empresa/{empresaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> crearSolicitanteParaEmpresa(
            @PathVariable Integer empresaId,
            @RequestBody Map<String, Object> datosContacto) {

        // Verificar que la empresa existe
        Empresa empresa = empresaService.buscarPorId(empresaId);
        if (empresa != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Solicitante creado exitosamente para empresa");
            response.put("empresaId", empresaId);
            response.put("tipo", "Empresa");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}