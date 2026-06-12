package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

 import org.springframework.security.access.prepost.PreAuthorize;
 import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TramiteCreateRequest;
import com.example.demo.dto.TramiteListadoDTO;
import com.example.demo.dto.TramiteUpdateRequest;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import com.example.demo.service.TramiteService;

import jakarta.annotation.security.PermitAll;

@RestController
@RequestMapping("/api/tramites")
public class TramiteController {

    private final TramiteService service;
    private final UsersRepository usersRepo;

    public TramiteController(TramiteService service, UsersRepository usersRepo) {
        this.service = service;
        this.usersRepo = usersRepo;
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
      @PermitAll
      public Map<String, Object> obtenerSeguimientoCompletoPublico(@PathVariable String codigoRUT,
          @RequestParam(name = "instanciaId", required = false) Long instanciaId) {
          try {
              return service.obtenerSeguimientoCompleto(codigoRUT, instanciaId);
          } catch (IllegalArgumentException e) {
              Map<String, Object> error = new HashMap<>();
              error.put("error", e.getMessage());
              throw new org.springframework.web.server.ResponseStatusException(
                  org.springframework.http.HttpStatus.BAD_REQUEST, e.getMessage());
          }
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
     public void eliminar(@PathVariable Long id, @RequestParam(required = false) String motivo) {
         service.eliminar(id, motivo);
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
    public List<TramiteListadoDTO> listarPorDepartamento(@PathVariable Long departamentoId, Authentication authentication) {
        // Verificar si el usuario es ADMIN o SUPER_ADMIN
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        if (isAdmin) {
            // Admin ve todos los trámites del departamento
            return service.listarPorDepartamento(departamentoId);
        }
        
        // Usuario normal: solo trámites asignados a él en su departamento
        Long usuarioId = null;
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                String username = ((UserDetails) principal).getUsername();
                Users user = usersRepo.findByUsername(username);
                if (user != null) {
                    usuarioId = user.getIdUsuarios();
                }
            } else if (principal instanceof Users) {
                usuarioId = ((Users) principal).getIdUsuarios();
            }
        }
        
        return service.listarPorDepartamentoYUsuario(departamentoId, usuarioId);
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

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}/derivar")
    public Tramite derivar(@PathVariable Long id, @RequestParam Long departamentoId, @RequestParam(required = false) String motivo, @RequestParam(required = false) Long usuarioResponsableId) {
        return service.derivar(id, departamentoId, motivo, usuarioResponsableId);
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
    public Map<String, Object> obtenerDashboardTramites(Authentication authentication) {
        // Obtener ID del usuario autenticado
        Long usuarioId = null;
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                String username = ((UserDetails) principal).getUsername();
                Users user = usersRepo.findByUsername(username);
                if (user != null) {
                    usuarioId = user.getIdUsuarios();
                }
            } else if (principal instanceof Users) {
                usuarioId = ((Users) principal).getIdUsuarios();
            }
        }
        if (usuarioId == null) {
            throw new SecurityException("Usuario no autenticado");
        }
        Users user = usersRepo.findById(usuarioId).orElse(null);
        if (user == null || user.getDepartamento() == null) {
            throw new SecurityException("Usuario sin departamento asignado");
        }
        List<TramiteListadoDTO> tramites = service.listarPorDepartamento(user.getDepartamento().getIdDepartamento());
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", tramites);
        response.put("totalElements", tramites.size());
        response.put("totalPages", 1);
        response.put("size", tramites.size());
        response.put("number", 0);
        return response;
    }

    @GetMapping("/con-instancias")
    public List<TramiteListadoDTO> listarConInstancias() {
        return service.listarConInstancias();
    }
}
