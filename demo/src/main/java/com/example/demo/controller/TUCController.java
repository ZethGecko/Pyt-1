package com.example.demo.controller;

import com.example.demo.dto.EmisionTUCRequestDTO;
import com.example.demo.dto.EmpresaHabilitadaDTO;
import com.example.demo.dto.TUCDTO;
import com.example.demo.model.TUC;
import com.example.demo.service.TUCService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tuc")
public class TUCController {

    private final TUCService tucService;

    public TUCController(TUCService tucService) {
        this.tucService = tucService;
    }

    @GetMapping
    public List<TUC> listar() {
        return tucService.listarTodos();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public TUC crear(@RequestBody TUC tuc) {
        return tucService.guardar(tuc);
    }

    @GetMapping("/{id}")
    public TUC obtener(@PathVariable Long id) {
        return tucService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public void eliminar(@PathVariable Long id) {
        tucService.eliminar(id);
    }

    /**
     * Emite un TUC para un vehículo que ha pasado su inspección (ficha aprobada).
     * La ficha debe tener estado=true y resultado="APROBADO".
     * El tipo puede ser "12_MESES" o "HASTA_FIN_ANIO".
     */
    @PostMapping("/emitir")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public TUCDTO emitirTUC(@RequestBody EmisionTUCRequestDTO request) {
        return tucService.emitirTUCDesdeFicha(request);
    }

    /**
     * Lista todas las empresas habilitadas (con TUC activo).
     * Para cada empresa muestra fecha de emisión, vencimiento y vehículos habilitados.
     */
    @GetMapping("/empresas-habilitadas")
    public List<EmpresaHabilitadaDTO> listarEmpresasHabilitadas() {
        return tucService.listarEmpresasHabilitadas();
    }

    /**
     * Lista los TUC activos de una empresa específica.
     */
    @GetMapping("/empresa/{empresaId}")
    public List<TUCDTO> listarPorEmpresa(@PathVariable Long empresaId) {
        return tucService.listarTUCsPorEmpresa(empresaId);
    }
}
