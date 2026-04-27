package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.InscripcionExamenRegistroDTO;
import com.example.demo.model.InscripcionExamen;
import com.example.demo.service.InscripcionExamenService;

import java.util.List;

@RestController
@RequestMapping("/api/inscripcion-examen")
public class InscripcionExamenController {

    private final InscripcionExamenService service;

    public InscripcionExamenController(InscripcionExamenService service) {
        this.service = service;
    }

    @GetMapping
    public List<InscripcionExamen> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/grupo/{grupoId}")
    public List<InscripcionExamen> listarPorGrupo(@PathVariable Long grupoId) {
        return service.listarPorGrupo(grupoId);
    }

    @GetMapping("/persona/{personaId}")
    public List<InscripcionExamen> listarPorPersona(@PathVariable Long personaId) {
        return service.listarPorPersona(personaId);
    }

     @GetMapping("/estado/{estado}")
     public List<InscripcionExamen> listarPorEstado(@PathVariable String estado) {
         return service.listarPorEstado(estado);
     }

     @GetMapping("/buscar")
     public List<InscripcionExamen> buscar(@RequestParam(required = false) Long personaId,
                                            @RequestParam(required = false) Long grupoId,
                                            @RequestParam(required = false) String estado) {
         return service.buscar(personaId, grupoId, estado);
     }

     @GetMapping("/{id}")
     public InscripcionExamen obtener(@PathVariable Long id) {
         return service.buscarPorId(id).orElse(null);
     }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public InscripcionExamen inscribir(@RequestBody InscripcionExamenRegistroDTO request) {
        return service.inscribir(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public InscripcionExamen actualizar(@PathVariable Long id, @RequestBody InscripcionExamen inscripcion) {
        System.out.println("[InscripcionExamenController] PUT /api/inscripcion-examen/" + id);
        System.out.println("[InscripcionExamenController] Body recibido: estado=" + inscripcion.getEstado() +
                          ", pagado=" + inscripcion.getPagado() +
                          ", resultado=" + inscripcion.getResultado() +
                          ", observaciones=" + inscripcion.getObservaciones());
        return service.actualizar(id, inscripcion);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        System.out.println("[InscripcionExamenController] DELETE /api/inscripcion-examen/" + id);
        service.eliminar(id);
    }

    @PatchMapping("/{id}/resultado")
    public void marcarResultado(@PathVariable Long id,
                                @RequestParam String resultado,
                                @RequestParam(required = false) Double nota) {
        service.marcarResultado(id, resultado, nota);
    }

    @GetMapping("/persona/{personaId}/grupo/{grupoId}/existe")
    public boolean existeInscripcionActiva(@PathVariable Long personaId, @PathVariable Long grupoId) {
        return service.existeInscripcionActiva(personaId, grupoId);
    }
}
