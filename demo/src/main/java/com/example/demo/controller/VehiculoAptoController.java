package com.example.demo.controller;

import com.example.demo.dto.BloqueRevisarRequestDTO;
import com.example.demo.dto.TerminarInstanciaRequestDTO;
import com.example.demo.dto.VehiculoAptoDTO;
import com.example.demo.dto.VehiculoAptoProgresoDTO;
import com.example.demo.dto.VehiculoAptoResponseDTO;
import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import com.example.demo.service.VehiculoAptoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehiculos-aptos")
@PreAuthorize("hasRole('ADMIN') or hasRole('INSPECTOR') or hasRole('TRAMITES')")
public class VehiculoAptoController {

    private final VehiculoAptoService vehiculoAptoService;
    private final UsersRepository usersRepository;

    public VehiculoAptoController(VehiculoAptoService vehiculoAptoService,
                                   UsersRepository usersRepository) {
        this.vehiculoAptoService = vehiculoAptoService;
        this.usersRepository = usersRepository;
    }

    private Long obtenerUsuarioId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) auth.getPrincipal()).getUsername();
            Users user = usersRepository.findByUsername(username);
            if (user != null) {
                return user.getIdUsuarios();
            }
        }
        throw new IllegalStateException("Usuario no autenticado o no encontrado");
    }

    @GetMapping("/tramite/{tramiteId}")
    public ResponseEntity<List<VehiculoAptoResponseDTO>> listarPorTramite(@PathVariable Long tramiteId) {
        List<VehiculoAptoResponseDTO> resultado = vehiculoAptoService.obtenerPorTramite(tramiteId);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/tramite/{tramiteId}/progreso")
    public ResponseEntity<VehiculoAptoProgresoDTO> obtenerProgreso(@PathVariable Long tramiteId) {
        VehiculoAptoProgresoDTO progreso = vehiculoAptoService.obtenerProgreso(tramiteId);
        return ResponseEntity.ok(progreso);
    }

    @PostMapping("/iniciar-revision")
    public ResponseEntity<Void> iniciarRevision(@RequestBody VehiculoAptoDTO request) {
        Long usuarioId = obtenerUsuarioId();
        vehiculoAptoService.iniciarRevisionDocumental(request.getTramiteId(), request.getVehiculosIds(), usuarioId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/terminar-instancia")
    public ResponseEntity<VehiculoAptoResponseDTO> terminarInstancia(@PathVariable Long id,
                                                                       @RequestBody TerminarInstanciaRequestDTO request) {
        Long usuarioId = obtenerUsuarioId();
        request.setVehiculoAptoId(id);
        VehiculoAptoResponseDTO resultado = vehiculoAptoService.terminarInstancia(request, usuarioId);
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/bloque/revisar")
    public ResponseEntity<List<VehiculoAptoResponseDTO>> revisarEnBloque(@RequestBody BloqueRevisarRequestDTO request) {
        Long usuarioId = obtenerUsuarioId();
        List<VehiculoAptoResponseDTO> resultados = vehiculoAptoService.revisarEnBloque(request, usuarioId);
        return ResponseEntity.ok(resultados);
    }

    @PostMapping("/tramite/{tramiteId}/completar")
    public ResponseEntity<Void> completarTramite(@PathVariable Long tramiteId) {
        vehiculoAptoService.completarTramite(tramiteId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tramite/{tramiteId}/aptos-para-inspeccion")
    public ResponseEntity<List<VehiculoAptoResponseDTO>> obtenerAptosParaInspeccion(@PathVariable Long tramiteId) {
        List<VehiculoAptoResponseDTO> resultado = vehiculoAptoService.obtenerAptosParaInspeccion(tramiteId);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/tramite/{tramiteId}/vehiculo/{vehiculoId}/historial")
    public ResponseEntity<List<VehiculoAptoResponseDTO>> obtenerHistorialVehiculo(
            @PathVariable Long tramiteId,
            @PathVariable Long vehiculoId) {
        List<VehiculoAptoResponseDTO> resultado = vehiculoAptoService.obtenerHistorialVehiculo(tramiteId, vehiculoId);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/tramite/{tramiteId}/dashboard")
    public ResponseEntity<Object> obtenerDashboard(@PathVariable Long tramiteId) {
        List<VehiculoAptoResponseDTO> vehiculos = vehiculoAptoService.obtenerPorTramite(tramiteId);
        VehiculoAptoProgresoDTO progreso = vehiculoAptoService.obtenerProgreso(tramiteId);
        return ResponseEntity.ok(Map.of(
                "vehiculos", vehiculos,
                "progreso", progreso
        ));
    }
}
