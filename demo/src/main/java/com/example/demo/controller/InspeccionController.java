package com.example.demo.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.BloqueAccionRequest;
import com.example.demo.dto.BloqueInspeccionDTO;
import com.example.demo.dto.CrearInspeccionEnBloqueRequest;
import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.InspeccionCabeceraCreateDTO;
import com.example.demo.dto.InspeccionConInstanciasCreateRequest;
import com.example.demo.dto.InspeccionCreateRequestDTO;
import com.example.demo.dto.InspeccionIniciarRequest;
import com.example.demo.dto.InspeccionInstanciaInspeccionarRequest;
import com.example.demo.dto.InspeccionInstanciaResponse;
import com.example.demo.dto.InspeccionPublicaDTO;
import com.example.demo.dto.InspeccionResponse;
import com.example.demo.dto.InspeccionRezagadaRequest;
import com.example.demo.dto.InspeccionTerminarRequest;
import com.example.demo.dto.InspeccionUpdateRequestDTO;
import com.example.demo.dto.InstanciasIdsRequest;
import com.example.demo.dto.ParametroInspeccionDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
import com.example.demo.dto.SiguienteInstanciaPendienteResponse;
import com.example.demo.dto.VehiculoDTO;
import com.example.demo.model.Inspeccion;
import com.example.demo.service.InspeccionService;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inspecciones")
public class InspeccionController {

    private final InspeccionService inspeccionService;

    public InspeccionController(InspeccionService inspeccionService) {
        this.inspeccionService = inspeccionService;
    }

    @GetMapping
    public List<Inspeccion> listar() {
        return inspeccionService.listarTodas();
    }

    /**
     * Lista las inspecciones agrupadas por bloque (fecha, lugar, estado).
     * Cada bloque contiene una lista de inspecciones para ese criterio.
     */
    @GetMapping("/por-bloque")
    public List<BloqueInspeccionDTO> listarPorBloque() {
        return inspeccionService.listarPorBloques();
    }

    /**
     * Endpoint público para listar inspecciones con filtros simples.
     * Accesible sin autenticación.
     */
    @GetMapping("/publico")
    public List<InspeccionPublicaDTO> listarPublico(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) String empresa) {

        LocalDate desde = null;
        LocalDate hasta = null;

        if (fechaDesde != null && !fechaDesde.trim().isEmpty()) {
            desde = LocalDate.parse(fechaDesde);
        }
        if (fechaHasta != null && !fechaHasta.trim().isEmpty()) {
            hasta = LocalDate.parse(fechaHasta);
        }

        String empresaNombre = (empresa != null && !empresa.trim().isEmpty()) ? empresa.trim() : null;

        return inspeccionService.listarInspeccionesPublicas(desde, hasta, empresaNombre);
    }


    /**
     * Endpoint público para obtener los vehículos (identificador/placa) de una inspección.
     * No requiere autenticación.
     */
    @GetMapping("/{inspeccionId}/vehiculos")
    public List<VehiculoDTO> listarVehiculosInspeccion(@PathVariable Long inspeccionId) {
        return inspeccionService.obtenerVehiculosPorInspeccion(inspeccionId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public Inspeccion crear(@RequestBody InspeccionCabeceraCreateDTO request) {
        return inspeccionService.crearInspeccionCabecera(request);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        inspeccionService.eliminar(id);
    }

    @GetMapping("/{id}")
    public Inspeccion obtener(@PathVariable Long id) {
        return inspeccionService.buscarPorId(id);
    }

    /**
     * Crea una inspección (y sus fichas) a partir de un trámite aprobado.
     * Para cada vehículo seleccionado se genera una ficha con los parámetros
     * por defecto del tipo de trámite.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/desde-tramite")
    public Inspeccion crearDesdeTramite(@RequestBody InspeccionCreateRequestDTO request) {
        return inspeccionService.crearDesdeTramiteAprobado(request);
    }

    /**
     * Crea una ficha adicional para un vehículo en una inspección existente.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/{inspeccionId}/fichas")
    public FichaInspeccionResponseDTO crearFicha(@PathVariable Long inspeccionId,
                                                  @RequestBody FichaInspeccionCreateRequestDTO request) {
        return inspeccionService.crearFichaParaVehiculo(inspeccionId, request);
    }

    /**
     * Agrega un parámetro a una ficha de inspección.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/fichas/{fichaId}/parametros")
    public ParametroInspeccionResponseDTO agregarParametro(@PathVariable Long fichaId,
                                                            @RequestBody ParametroInspeccionDTO dto) {
        return inspeccionService.agregarParametro(fichaId, dto);
    }

    /**
     * Actualiza un parámetro de ficha.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/parametros/{paramId}")
    public ParametroInspeccionResponseDTO actualizarParametro(@PathVariable Long paramId,
                                                               @RequestBody ParametroInspeccionDTO dto) {
        return inspeccionService.actualizarParametro(paramId, dto);
    }

    /**
     * Elimina un parámetro de ficha.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/parametros/{paramId}")
    public void eliminarParametro(@PathVariable Long paramId) {
        inspeccionService.eliminarParametro(paramId);
    }

    /**
     * Lista las inspecciones asociadas a un trámite.
     */
    @GetMapping("/tramite/{tramiteId}")
    public List<Inspeccion> listarPorTramite(@PathVariable Long tramiteId) {
        return inspeccionService.listarPorTramite(tramiteId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/rezagadas")
    public Inspeccion crearInspeccionRezagada(@RequestBody InspeccionRezagadaRequest request) {
        return inspeccionService.crearInspeccionRezagada(request);
    }

    /**
     * Crea una inspección con múltiples instancias de trámite.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/con-instancias")
    public InspeccionResponse crearConInstancias(@RequestBody InspeccionConInstanciasCreateRequest request) {
        System.out.println("DEBUG: Received crearConInstancias - hora: " + request.getHora()
            + ", fecha: " + request.getFechaProgramada() + ", lugar: " + request.getLugar()
            + ", instancias: " + request.getInstanciasTramiteIds());
        return inspeccionService.crearConInstancias(request);
    }

    /**
     * Agrega instancias de trámite a una inspección existente.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/{inspeccionId}/instancias")
    public InspeccionResponse agregarInstancias(@PathVariable Long inspeccionId,
                                                 @RequestBody InstanciasIdsRequest request) {
        return inspeccionService.agregarInstancias(inspeccionId, request.getInstanciasIds());
    }

    /**
     * Remueve una instancia de trámite de una inspección.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{inspeccionId}/instancias/{instanciaId}")
    public void removerInstancia(@PathVariable Long inspeccionId,
                                  @PathVariable Long instanciaId) {
        inspeccionService.removerInstancia(inspeccionId, instanciaId);
    }

     /**
      * Obtiene una inspección con su lista de instancias asociadas.
      */
      @GetMapping("/{inspeccionId}/con-instancias")
      public InspeccionResponse obtenerConInstancias(@PathVariable Long inspeccionId) {
          return inspeccionService.obtenerConInstancias(inspeccionId);
      }

       /**
        * Actualiza una inspección (estado, fecha, hora, lugar, observaciones).
        */
        @PutMapping("/{id}")
        public InspeccionResponse actualizar(@PathVariable Long id, @RequestBody InspeccionUpdateRequestDTO dto) {
            return inspeccionService.actualizar(id, dto);
        }

        /**
         * Cancela una inspección (cambia estado a CANCELADA).
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @PutMapping("/{id}/cancelar")
        public InspeccionResponse cancelar(@PathVariable Long id) {
            return inspeccionService.cancelar(id);
        }

        /**
         * Inicia una inspección (cambia estado a EN_CURSO y asigna inspector).
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @PutMapping("/{id}/iniciar")
        public InspeccionResponse iniciar(@PathVariable Long id, @RequestBody InspeccionIniciarRequest request) {
            return inspeccionService.iniciar(id, request);
        }

        /**
         * Termina una inspección (cambia estado a FINALIZADA y establece resultado general).
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @PutMapping("/{id}/terminar")
        public InspeccionResponse terminar(@PathVariable Long id, @RequestBody InspeccionTerminarRequest request) {
            return inspeccionService.terminar(id, request);
        }

        /**
         * Obtiene la siguiente instancia pendiente de inspección para una inspección.
         */
        @GetMapping("/{id}/siguiente-pendiente")
        public SiguienteInstanciaPendienteResponse siguientePendiente(@PathVariable Long id) {
            return inspeccionService.obtenerSiguienteInstanciaPendiente(id);
        }

         /**
          * Registra la inspección de una instancia específica (placa, fecha, observaciones, parámetros).
          * Este endpoint se usa para el flujo secuencial de inspección vehículo por vehículo.
          */
         @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
         @PostMapping("/instancias/{instanciaId}/inspeccionar")
         public void inspeccionarInstancia(@PathVariable Long instanciaId, @RequestBody InspeccionInstanciaInspeccionarRequest request) {
             inspeccionService.inspeccionarInstancia(instanciaId, request);
         }

         /**
          * Completa una instancia de inspección (marca como INSPECCIONADO y guarda datos).
          */
         @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
         @PutMapping("/instancias/{instanciaId}/completar")
         public void completarInstancia(@PathVariable Long instanciaId, @RequestBody InspeccionInstanciaInspeccionarRequest request) {
             inspeccionService.completarInstancia(instanciaId, request);
         }

        // ==================== ENDPOINTS POR BLOQUE ====================

        /**
         * Crea una nueva inspección dentro de un bloque existente (misma fecha y lugar).
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @PostMapping("/bloques/{fecha}/{lugar}/inspecciones")
        public InspeccionResponse crearEnBloque(@PathVariable String fecha, @PathVariable String lugar,
                                                @RequestBody CrearInspeccionEnBloqueRequest request) {
            java.time.LocalDate fechaParsed = java.time.LocalDate.parse(fecha);
            return inspeccionService.crearInspeccionEnBloque(fechaParsed, lugar, request);
        }

        /**
         * Inicia todas las inspecciones de un bloque (cambia estado a EN_CURSO).
         * Opcionalmente asigna un inspector a todas.
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @PutMapping("/bloques/{fecha}/{lugar}/iniciar")
        public List<InspeccionResponse> iniciarBloque(@PathVariable String fecha, @PathVariable String lugar,
                                                      @RequestBody(required = false) BloqueAccionRequest request) {
            java.time.LocalDate fechaParsed = java.time.LocalDate.parse(fecha);
            Long inspectorId = (request != null) ? request.getUsuarioInspectorId() : null;
            return inspeccionService.iniciarBloque(fechaParsed, lugar, inspectorId);
        }

        /**
         * Cancela todas las inspecciones de un bloque (cambia estado a CANCELADA).
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @PutMapping("/bloques/{fecha}/{lugar}/cancelar")
        public List<InspeccionResponse> cancelarBloque(@PathVariable String fecha, @PathVariable String lugar) {
            java.time.LocalDate fechaParsed = java.time.LocalDate.parse(fecha);
            return inspeccionService.cancelarBloque(fechaParsed, lugar);
        }

        /**
         * Obtiene las instancias de un trámite con su estado de inspección.
         * Útil para ver qué vehículos están inspeccionados y cuáles pendientes.
         */
        @GetMapping("/tramite/{tramiteId}/instancias-detalle")
        public List<InspeccionInstanciaResponse> listarInstanciasDetalle(@PathVariable Long tramiteId) {
            return inspeccionService.listarInstanciasPorTramite(tramiteId);
        }

        /**
         * Obtiene las instancias de un trámite que NO están asignadas a una inspección específica.
         * Para agregar instancias faltantes a una inspección existente.
         */
        @GetMapping("/tramite/{tramiteId}/instancias-disponibles")
        public List<InspeccionInstanciaResponse> listarInstanciasDisponibles(
                @PathVariable Long tramiteId,
                @RequestParam(required = false) Long inspeccionId) {
            return inspeccionService.listarInstanciasDisponibles(tramiteId, inspeccionId);
        }
}
