package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.PersonaNatural;
import com.example.demo.service.PersonaNaturalService;

import java.util.List;

@RestController
@RequestMapping("/api/personas-naturales")
public class PersonaNaturalController {

    private final PersonaNaturalService service;

    public PersonaNaturalController(PersonaNaturalService service) {
        this.service = service;
    }

    @GetMapping
    public List<PersonaNatural> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/buscar")
    public List<PersonaNatural> buscar(@RequestParam String termino) {
        return service.buscarCompleto(termino);
    }

    @GetMapping("/dni/{dni}")
    public PersonaNatural obtenerPorDni(@PathVariable Integer dni) {
        return service.buscarPorDni(dni).orElse(null);
    }

    @GetMapping("/email/{email}")
    public PersonaNatural obtenerPorEmail(@PathVariable String email) {
        return service.buscarPorEmail(email).orElse(null);
    }

    @GetMapping("/genero/{genero}/count")
    public long contarPorGenero(@PathVariable String genero) {
        return service.contarPorGenero(genero);
    }

    @GetMapping("/{id}")
    public PersonaNatural obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public PersonaNatural crear(@RequestBody PersonaNatural persona) {
        return service.guardar(persona);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public PersonaNatural actualizar(@PathVariable Long id, @RequestBody PersonaNatural persona) {
        return service.actualizar(id, persona);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @GetMapping("/grupo/{grupoId}/inscritas")
    public List<PersonaNatural> listarInscriptasEnGrupo(@PathVariable Long grupoId) {
        return service.buscarInscriptasEnGrupo(grupoId);
    }
}
