package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.GrupoPresentacion;
import com.example.demo.model.InscripcionExamen;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.service.GrupoPresentacionService;
import com.example.demo.service.InscripcionExamenService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grupos-presentacion")
public class GrupoPresentacionController {

    private final GrupoPresentacionService grupoService;
    private final InscripcionExamenService inscripcionService;

    public GrupoPresentacionController(GrupoPresentacionService grupoService, InscripcionExamenService inscripcionService) {
        this.grupoService = grupoService;
        this.inscripcionService = inscripcionService;
    }

    @GetMapping
    public List<GrupoPresentacion> listarTodos() {
        return grupoService.listarTodos();
    }

    @GetMapping("/estado/{estado}")
    public List<GrupoPresentacion> listarPorEstado(@PathVariable GrupoPresentacion.EstadoGrupo estado) {
        return grupoService.listarPorEstado(estado);
    }

    @GetMapping("/proximos")
    public List<GrupoPresentacion> listarProximos() {
        return grupoService.listarProximosProgramados();
    }

    @GetMapping("/requisito/{requisitoId}")
    public List<GrupoPresentacion> listarPorRequisito(@PathVariable Long requisitoId) {
        return grupoService.listarPorRequisito(requisitoId);
    }

    @GetMapping("/fechas")
    public List<GrupoPresentacion> listarPorFechas(
            @RequestParam String inicio,
            @RequestParam String fin) {
        LocalDate fechaInicio = LocalDate.parse(inicio);
        LocalDate fechaFin = LocalDate.parse(fin);
        return grupoService.listarPorFechas(fechaInicio, fechaFin);
    }

    @GetMapping("/calendario")
    public List<GrupoPresentacion> listarCalendario(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer anio) {
        LocalDate now = LocalDate.now();
        int month = (mes != null) ? mes : now.getMonthValue();
        int year = (anio != null) ? anio : now.getYear();
        LocalDate inicio = LocalDate.of(year, month, 1);
        LocalDate fin = inicio.withDayOfMonth(inicio.lengthOfMonth());
        return grupoService.listarPorFechas(inicio, fin);
    }

    @GetMapping("/configuracion/{configId}/activos")
    public List<GrupoPresentacion> listarActivosPorConfiguracion(@PathVariable Long configId) {
        return grupoService.listarActivosPorConfiguracion(configId);
    }

    @GetMapping("/{id}")
    public GrupoPresentacion obtener(@PathVariable Long id) {
        return grupoService.buscarPorId(id).orElse(null);
    }

    @GetMapping("/{id}/cupos")
    public int getCuposDisponibles(@PathVariable Long id) {
        return grupoService.getCuposDisponibles(id);
    }

    @GetMapping("/{id}/porcentaje-ocupacion")
    public double getPorcentajeOcupacion(@PathVariable Long id) {
        return grupoService.getPorcentajeOcupacion(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public GrupoPresentacion crear(@RequestBody Map<String, Object> request) {
        GrupoPresentacion grupo = new GrupoPresentacion();
        if (request.get("codigo") != null) grupo.setCodigo((String) request.get("codigo"));
        if (request.get("fecha") != null) grupo.setFecha(java.time.LocalDate.parse((String) request.get("fecha")));
        if (request.get("horaInicio") != null) grupo.setHoraInicio((String) request.get("horaInicio"));
        if (request.get("horaFin") != null) grupo.setHoraFin((String) request.get("horaFin"));
        if (request.get("capacidad") != null) grupo.setCapacidad(((Number) request.get("capacidad")).intValue());
        if (request.get("observaciones") != null) grupo.setObservaciones((String) request.get("observaciones"));

        // Handle requisitoExamen
        if (request.get("requisitoExamen") instanceof Map) {
            Map<String, Object> reqMap = (Map<String, Object>) request.get("requisitoExamen");
            if (reqMap.get("id") != null) {
                Long reqId = ((Number) reqMap.get("id")).longValue();
                // Fetch the RequisitoTUPAC from database
                // For now, create a proxy object
                RequisitoTUPAC requisito = new RequisitoTUPAC();
                requisito.setId(reqId);
                grupo.setRequisitoExamen(requisito);
            }
        }

        return grupoService.crear(grupo);
    }

    @PutMapping("/{id}")
    public GrupoPresentacion actualizar(@PathVariable Long id, @RequestBody GrupoPresentacion grupo) {
        return grupoService.actualizar(id, grupo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        grupoService.eliminar(id);
    }

    @PostMapping("/{id}/reservar-cupo")
    public void reservarCupo(@PathVariable Long id) {
        grupoService.reservarCupo(id);
    }

    @PostMapping("/{id}/liberar-cupo")
    public void liberarCupo(@PathVariable Long id) {
        grupoService.liberarCupo(id);
    }

    @PostMapping("/{id}/iniciar")
    public void iniciarGrupo(@PathVariable Long id) {
        grupoService.iniciarGrupo(id);
    }

    @PostMapping("/{id}/completar")
    public void completarGrupo(@PathVariable Long id) {
        grupoService.completarGrupo(id);
    }

    @PostMapping("/{id}/cancelar")
    public void cancelarGrupo(@PathVariable Long id, @RequestParam(required = false) String motivo) {
        grupoService.cancelarGrupo(id, motivo);
    }

    @GetMapping("/{id}/estadisticas")
    public GrupoPresentacion estadisticas(@PathVariable Long id) {
        return grupoService.buscarPorId(id).orElse(null);
    }

    // ========== CANDIDATOS (INSCRIPCIONES) ==========
    
    @GetMapping("/{grupoId}/candidatos")
    public List<InscripcionExamen> listarCandidatos(@PathVariable Long grupoId) {
        return inscripcionService.listarPorGrupo(grupoId);
    }

    @PostMapping("/{grupoId}/candidatos")
    public InscripcionExamen asignarCandidato(@PathVariable Long grupoId, @RequestBody InscripcionExamen inscripcion) {
        inscripcion.setGrupoPresentacionId(grupoId);
        return inscripcionService.inscribir(inscripcion);
    }

    @DeleteMapping("/{grupoId}/candidatos/{candidatoId}")
    public void removerCandidato(@PathVariable Long grupoId, @PathVariable Long candidatoId) {
        // Verify candidato belongs to group first
        InscripcionExamen inscripcion = inscripcionService.buscarPorId(candidatoId)
                .orElseThrow(() -> new IllegalArgumentException("Inscripción no encontrada"));
        if (!inscripcion.getGrupoPresentacionId().equals(grupoId)) {
            throw new IllegalArgumentException("El candidato no pertenece a este grupo");
        }
        inscripcionService.eliminar(candidatoId);
    }

    @PutMapping("/{grupoId}/candidatos/{candidatoId}/resultado")
    public InscripcionExamen registrarResultado(@PathVariable Long grupoId, 
                                                  @PathVariable Long candidatoId,
                                                  @RequestBody Map<String, Object> resultado) {
        InscripcionExamen inscripcion = inscripcionService.buscarPorId(candidatoId)
                .orElseThrow(() -> new IllegalArgumentException("Inscripción no encontrada"));
        if (!inscripcion.getGrupoPresentacionId().equals(grupoId)) {
            throw new IllegalArgumentException("El candidato no pertenece a este grupo");
        }
        // Extract fields from resultado map
        String resultadoStr = (String) resultado.get("resultado");
        Double nota = resultado.get("nota") instanceof Number ? ((Number) resultado.get("nota")).doubleValue() : null;
        String observaciones = (String) resultado.get("observaciones");
        
        if (resultadoStr != null) {
            inscripcion.setResultado(resultadoStr);
        }
        if (nota != null) {
            inscripcion.setNota(nota);
        }
        if (observaciones != null) {
            inscripcion.setObservaciones(observaciones);
        }
        return inscripcionService.actualizar(candidatoId, inscripcion);
    }

    @GetMapping("/{grupoId}/candidatos/count")
    public long contarCandidatos(@PathVariable Long grupoId) {
        return grupoService.countInscripcionesActivas(grupoId);
    }
}