package com.example.demo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.BusquedaRutaRequestDTO;
import com.example.demo.dto.PuntoRutaResponseDTO;
import com.example.demo.dto.RutaBusquedaResultadoDTO;
import com.example.demo.dto.RutaResponseDTO;
import com.example.demo.model.PuntoRuta;
import com.example.demo.model.Ruta;
import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import com.example.demo.service.RutaService;

@RestController
@RequestMapping("/api/rutas")
public class RutaController {

    private final RutaService rutaService;
    private final UsersRepository usersRepository;

    public RutaController(RutaService rutaService, UsersRepository usersRepository) {
        this.rutaService = rutaService;
        this.usersRepository = usersRepository;
    }

    @GetMapping
    public List<RutaResponseDTO> listarTodos() {
        return rutaService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/paginado")
    public Page<RutaResponseDTO> listarTodosPaginado(
            @PageableDefault(size = 15, sort = "fechaRegistro") Pageable pageable,
            @RequestParam(required = false) String q) {
        Page<Ruta> pageResult;
        if (q != null && !q.trim().isEmpty()) {
            pageResult = rutaService.buscarPaginado(q.trim(), pageable);
        } else {
            pageResult = rutaService.listarTodosPaginado(pageable);
        }
        return pageResult.map(this::toResponseDTO);
    }

    @GetMapping("/activos")
    public List<RutaResponseDTO> listarActivos() {
        return rutaService.listarActivos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RutaResponseDTO> obtener(@PathVariable Long id) {
        return rutaService.buscarPorIdConPuntosRuta(id)
                .map(ruta -> ResponseEntity.ok(toResponseDTO(ruta)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<RutaResponseDTO> obtenerPorCodigo(@PathVariable String codigo) {
        return rutaService.buscarPorCodigo(codigo)
                .map(ruta -> ResponseEntity.ok(toResponseDTO(ruta)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public List<RutaResponseDTO> buscar(@RequestParam String termino) {
        return rutaService.buscarPorTermino(termino).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/empresa/{empresaId}")
    public List<RutaResponseDTO> listarPorEmpresa(@PathVariable Long empresaId) {
        return rutaService.listarPorEmpresa(empresaId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/tipo/{tipo}")
    public List<RutaResponseDTO> listarPorTipo(@PathVariable String tipo) {
        return rutaService.listarPorTipo(tipo).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/gerente/{gerenteId}")
    public List<RutaResponseDTO> listarPorGerente(@PathVariable Long gerenteId) {
        return rutaService.listarPorGerente(gerenteId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public RutaResponseDTO crear(@RequestBody Ruta ruta) {
        // Obtener usuario autenticado y setearlo como registrador
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            Users currentUser = usersRepository.findByUsername(username);
            if (currentUser != null) {
                ruta.setUsuarioRegistra(currentUser);
            }
        }
        return toResponseDTO(rutaService.guardar(ruta));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/parse-kml")
    public ResponseEntity<List<RutaService.RoutePreview>> parseKml(@RequestParam("file") MultipartFile file) {
        try {
            String kmlContent = new String(file.getBytes());
            List<RutaService.RoutePreview> routes = rutaService.parseKmlToRoutes(kmlContent);
            return ResponseEntity.ok(routes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/upload-kml")
    public ResponseEntity<RutaResponseDTO> uploadKml(@RequestParam("file") MultipartFile file,
                                                      @RequestParam("routeIndex") int routeIndex,
                                                      @RequestParam("nombre") String nombre,
                                                      @RequestParam("descripcion") String descripcion,
                                                      @RequestParam(value = "empresaId", required = false) Long empresaId,
                                                      @RequestParam(value = "createPoints", defaultValue = "true") boolean createPoints) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = null;
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String username = ((UserDetails) authentication.getPrincipal()).getUsername();
                currentUser = usersRepository.findByUsername(username);
            }
            if (currentUser == null) {
                return ResponseEntity.status(401).build(); // Unauthorized
            }

            String kmlContent = new String(file.getBytes());
            Ruta ruta;
            if (createPoints) {
                ruta = rutaService.crearDesdeKml(kmlContent, routeIndex, nombre, descripcion, empresaId, currentUser);
            } else {
                ruta = rutaService.guardarDesdeKml(kmlContent, routeIndex, nombre, descripcion, empresaId, currentUser);
            }
            return ResponseEntity.ok(toResponseDTO(ruta));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RutaResponseDTO> actualizar(@PathVariable Long id, @RequestBody Ruta ruta) {
        ruta.setIdRuta(id);
        try {
            Ruta actualizado = rutaService.guardar(ruta);
            return ResponseEntity.ok(toResponseDTO(actualizado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            rutaService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== VALIDACIONES ==========

    @GetMapping("/validar/codigo/{codigo}")
    public Map<String, Boolean> validarCodigo(@PathVariable String codigo, @RequestParam(required = false) Long idExcluir) {
        boolean disponible = !rutaService.existePorCodigo(codigo, idExcluir != null ? idExcluir : -1L);
        return Map.of("disponible", disponible);
    }

    // ========== ESTADÍSTICAS ==========

    @GetMapping("/estadisticas/empresa/{empresaId}")
    public Map<String, Long> estadisticasPorEmpresa(@PathVariable Long empresaId) {
        Long total = rutaService.contarPorEmpresa(empresaId);
        return Map.of("totalRutas", total != null ? total : 0L);
    }

    @GetMapping("/conteos")
    public Map<String, Long> getConteos() {
        Map<String, Long> map = new HashMap<>();
        map.put("total", rutaService.countTotal());
        map.put("activos", rutaService.countActivos());
        map.put("asignadas", rutaService.countAsignadas());
        map.put("sinAsignar", rutaService.countSinAsignar());
        return map;
    }

    // Endpoint temporal para debug
    @GetMapping("/debug/rutas-con-puntos")
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public Map<String, Object> debugRutasConPuntos() {
        List<Ruta> rutas = rutaService.listarActivos();
        Map<String, Object> debug = new HashMap<>();
        List<Map<String, Object>> rutasInfo = new ArrayList<>();
        for (Ruta r : rutas) {
            Map<String, Object> ri = new HashMap<>();
            ri.put("id", r.getIdRuta());
            ri.put("codigo", r.getCodigo());
            ri.put("nombre", r.getNombre());
            ri.put("estado", r.getEstado());
            List<PuntoRuta> puntos = r.getPuntosRuta();
            ri.put("numPuntos", puntos != null ? puntos.size() : 0);
            if (puntos != null) {
                List<Map<String, Object>> pts = new ArrayList<>();
                for (PuntoRuta p : puntos) {
                    Map<String, Object> pi = new HashMap<>();
                    pi.put("id", p.getIdPuntoRuta());
                    pi.put("nombre", p.getNombre());
                    pi.put("orden", p.getOrden());
                    pi.put("lat", p.getLatitud());
                    pi.put("lng", p.getLongitud());
                    pts.add(pi);
                }
                ri.put("puntos", pts);
            }
            rutasInfo.add(ri);
        }
        debug.put("rutas", rutasInfo);
        debug.put("totalRutas", rutas.size());
        return debug;
    }

    // ========== BÚSQUEDA DE RUTAS (PÚBLICA) ==========

    /**
     * Busca las mejores rutas que conectan un origen y destino.
     * Devuelve rutas ordenadas por distancia calculada (más corta primero).
     * Endpoint público - no requiere autenticación.
     */
    @PostMapping("/buscar")
    public List<RutaBusquedaResultadoDTO> buscarMejorRuta(@RequestBody BusquedaRutaRequestDTO request) {
        System.out.println("[RutaController] POST /api/rutas/buscar recibido");
        System.out.println("[RutaController] Origen: " + request.getOrigenLatitud() + ", " + request.getOrigenLongitud());
        System.out.println("[RutaController] Destino: " + request.getDestinoLatitud() + ", " + request.getDestinoLongitud());
        List<RutaBusquedaResultadoDTO> resultados = rutaService.buscarMejorRuta(request);
        System.out.println("[RutaController] Resultados devueltos: " + resultados.size());
        return resultados;
    }

    private RutaResponseDTO toResponseDTO(Ruta r) {
        if (r == null) return null;

        // Información de empresa
        final Long empresaId;
        final String empresaNombre;
        final String empresaRuc;
        if (r.getEmpresa() != null) {
            empresaId = r.getEmpresa().getIdEmpresa();
            empresaNombre = r.getEmpresa().getNombre();
            empresaRuc = r.getEmpresa().getRuc();
        } else {
            empresaId = null;
            empresaNombre = null;
            empresaRuc = null;
        }

        // Información de gerente responsable
        final Long gerenteResponsableId;
        final String gerenteResponsableNombre;
        if (r.getGerenteResponsable() != null) {
            gerenteResponsableId = r.getGerenteResponsable().getIdGerente();
            gerenteResponsableNombre = r.getGerenteResponsable().getNombre();
        } else {
            gerenteResponsableId = null;
            gerenteResponsableNombre = null;
        }

        // Información de usuario registra
        final Long usuarioRegistraId;
        final String usuarioRegistraNombre;
        if (r.getUsuarioRegistra() != null) {
            usuarioRegistraId = r.getUsuarioRegistra().getIdUsuarios();
            usuarioRegistraNombre = r.getUsuarioRegistra().getUsername();
        } else {
            usuarioRegistraId = null;
            usuarioRegistraNombre = null;
        }

        // Convertir puntos de ruta
        List<PuntoRutaResponseDTO> puntosDto = null;
        if (r.getPuntosRuta() != null) {
            puntosDto = r.getPuntosRuta().stream().map(p -> {
                // Información de ruta (ya conocida)
                Long rutaId = r.getIdRuta();
                String rutaNombre = r.getNombre();
                String rutaCodigo = r.getCodigo();

                // Información de empresa (ya conocida)
                Long empId = empresaId;
                String empNombre = empresaNombre;

                // Información de usuario registra (ya conocida)
                Long usrId = usuarioRegistraId;
                String usrNombre = usuarioRegistraNombre;

                return new PuntoRutaResponseDTO(
                    p.getIdPuntoRuta(),
                    p.getNombre(),
                    p.getDescripcion(),
                    p.getLatitud(),
                    p.getLongitud(),
                    p.getOrden(),
                    p.getTipo(),
                    p.getEstado(),
                    p.getFechaRegistro(),
                    p.getFechaActualizacion(),
                    rutaId,
                    rutaNombre,
                    rutaCodigo,
                    empId,
                    empNombre,
                    usrId,
                    usrNombre
                );
            }).collect(Collectors.toList());
        }

        return new RutaResponseDTO(
                r.getIdRuta(),
                r.getCodigo(),
                r.getNombre(),
                r.getDescripcion(),
                r.getDistanciaKm(),
                r.getTiempoEstimadoMinutos(),
                r.getEstado(),
                r.getTipo(),
                r.getObservaciones(),
                r.getFechaRegistro(),
                r.getFechaActualizacion(),
                empresaId,
                empresaNombre,
                empresaRuc,
                gerenteResponsableId,
                gerenteResponsableNombre,
                usuarioRegistraId,
                usuarioRegistraNombre,
                puntosDto
        );
    }
}