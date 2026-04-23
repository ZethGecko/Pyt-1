package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.TramiteCreateRequest;
import com.example.demo.dto.TramiteListadoDTO;
import com.example.demo.dto.TramiteUpdateRequest;
import com.example.demo.model.Tramite;
import com.example.demo.service.TramiteService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tramites")
public class TramiteController {

    private final TramiteService service;

    public TramiteController(TramiteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Tramite> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/enriquecidos")
    public List<TramiteListadoDTO> listarEnriquecidos() {
        return service.listarTodosEnriquecidos();
    }

    @GetMapping("/buscar/enriquecidos")
    public List<TramiteListadoDTO> buscarEnriquecidos(@RequestParam("termino") String termino) {
        return service.buscarEnriquecidos(termino);
    }

    @GetMapping("/{id}")
    public Tramite obtener(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @GetMapping("/codigo/{codigoRut}")
    public Tramite buscarPorCodigoRUT(@PathVariable String codigoRut) {
        return service.buscarPorCodigoRUT(codigoRut).orElse(null);
    }

    @GetMapping("/publico/seguimiento/{codigoRUT}")
    public Map<String, Object> obtenerSeguimientoCompletoPublico(@PathVariable String codigoRUT) {
        return service.obtenerSeguimientoCompleto(codigoRUT);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Tramite> listarPorUsuario(@PathVariable Long usuarioId) {
        return service.buscarPorUsuarioRegistra(usuarioId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public Tramite crear(@RequestBody TramiteCreateRequest request) {
        return service.crearDesdeRequest(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public Tramite actualizar(@PathVariable Long id, @RequestBody TramiteUpdateRequest request) {
        return service.actualizarDesdeRequest(id, request);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @GetMapping("/{id}/enriquecido")
    public Tramite obtenerEnriquecido(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    @GetMapping("/filtrar/enriquecidos")
    public List<TramiteListadoDTO> filtrarEnriquecidos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) Long tipoTramiteId,
            @RequestParam(required = false) Long solicitanteId,
            @RequestParam(required = false) String search) {
        return service.filtrarEnriquecidos(estado, prioridad, tipoTramiteId, solicitanteId, search);
    }

    @GetMapping("/solicitante/{solicitanteId}/activos/enriquecidos")
    public List<TramiteListadoDTO> listarPorSolicitante(@PathVariable Long solicitanteId) {
        return service.listarPorSolicitante(solicitanteId);
    }

    @GetMapping("/usuario/{usuarioId}/registrados/enriquecidos")
    public List<TramiteListadoDTO> listarPorUsuarioRegistra(@PathVariable Long usuarioId) {
        return service.listarPorUsuarioRegistraEnriquecidos(usuarioId);
    }

    @GetMapping("/activos")
    public List<Tramite> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/atrasados")
    public List<Tramite> listarAtrasados() {
        return service.listarAtrasados();
    }

    @GetMapping("/departamento/{departamentoId}")
    public List<TramiteListadoDTO> listarPorDepartamento(@PathVariable Long departamentoId) {
        return service.listarPorDepartamento(departamentoId);
    }

    @GetMapping("/departamento/{departamentoId}/pendientes")
    public List<TramiteListadoDTO> listarPendientesPorDepartamento(@PathVariable Long departamentoId) {
        return service.listarPorDepartamento(departamentoId).stream()
                .filter(t -> "PENDIENTE".equals(t.getEstado()) || "EN_REVISION".equals(t.getEstado()))
                .toList();
    }

    @PutMapping("/{id}/cambiar-estado")
    public Tramite cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado, @RequestParam(required = false) String motivo) {
        return service.cambiarEstado(id, nuevoEstado, motivo);
    }

    @PutMapping("/{id}/derivar")
    public Tramite derivar(@PathVariable Long id, @RequestParam Long departamentoId, @RequestParam(required = false) String motivo) {
        return service.derivar(id, departamentoId, motivo);
    }

    @PutMapping("/{id}/aprobar")
    public Tramite aprobar(@PathVariable Long id, @RequestParam(required = false) String observaciones) {
        return service.aprobar(id, observaciones);
    }

    @PutMapping("/{id}/rechazar")
    public Tramite rechazar(@PathVariable Long id, @RequestParam String motivo) {
        return service.rechazar(id, motivo);
    }

    @PutMapping("/{id}/observar")
    public Tramite observar(@PathVariable Long id, @RequestParam String observaciones) {
        return service.observar(id, observaciones);
    }

    @PutMapping("/{id}/finalizar")
    public Tramite finalizar(@PathVariable Long id, @RequestParam(required = false) String observaciones) {
        return service.finalizar(id, observaciones);
    }

    @PutMapping("/{id}/cambiar-prioridad")
    public Tramite cambiarPrioridad(@PathVariable Long id, @RequestParam String nuevaPrioridad) {
        return service.cambiarPrioridad(id, nuevaPrioridad);
    }

    @PostMapping("/{id}/reingresar")
    public Tramite reingresar(@PathVariable Long id, @RequestParam String justificacion) {
        return service.reingresar(id, justificacion);
    }

    @PutMapping("/{id}/cancelar")
    public void cancelar(@PathVariable Long id, @RequestParam String motivo) {
        service.cancelar(id, motivo);
    }

    @GetMapping("/verificar/existe-codigo/{codigoRut}")
    public Map<String, Boolean> verificarExisteCodigo(@PathVariable String codigoRut) {
        boolean existe = service.buscarPorCodigoRUT(codigoRut).isPresent();
        Map<String, Boolean> response = new java.util.HashMap<>();
        response.put("existe", existe);
        return response;
    }

    @GetMapping("/codigo/{codigoRut}/tipo-tramite")
    public Map<String, Object> obtenerTipoTramitePorCodigo(@PathVariable String codigoRut) {
        Optional<Tramite> tramiteOpt = service.buscarPorCodigoRUT(codigoRut);
        Map<String, Object> response = new java.util.HashMap<>();
        if (tramiteOpt.isPresent()) {
            Tramite t = tramiteOpt.get();
            response.put("tipoTramiteId", t.getTipoTramite() != null ? t.getTipoTramite().getIdTipoTramite() : null);
            response.put("tipoTramiteDescripcion", t.getTipoTramite() != null ? t.getTipoTramite().getDescripcion() : null);
            response.put("tipoTramiteCodigo", t.getTipoTramite() != null ? t.getTipoTramite().getCodigo() : null);
        }
        return response;
    }

    @GetMapping("/dashboard/mis-tramites")
    public Map<String, Object> obtenerDashboardTramites(@RequestParam Long usuarioResponsableId) {
        List<TramiteListadoDTO> tramites = service.listarPorUsuarioResponsable(usuarioResponsableId);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", tramites);
        response.put("totalElements", tramites.size());
        response.put("totalPages", 1);
        response.put("size", tramites.size());
        response.put("number", 0);
        return response;
    }
}
