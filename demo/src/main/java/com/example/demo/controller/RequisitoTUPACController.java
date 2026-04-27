package com.example.demo.controller;

import com.example.demo.dto.RequisitoTUPACEnriquecidoDTO;
import com.example.demo.model.Formatos;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.TUPAC;
import com.example.demo.service.FormatosService;
import com.example.demo.service.RequisitoTUPACService;
import com.example.demo.service.TUPACService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requisitos-tupac")
public class RequisitoTUPACController {

    private final RequisitoTUPACService requisitoTUPACService;
    private final TUPACService tupacService;
    private final FormatosService formatosService;

    public RequisitoTUPACController(RequisitoTUPACService requisitoTUPACService,
                                    TUPACService tupacService,
                                    FormatosService formatosService) {
        this.requisitoTUPACService = requisitoTUPACService;
        this.tupacService = tupacService;
        this.formatosService = formatosService;
    }

    @GetMapping
    public List<RequisitoTUPAC> listar() {
        return requisitoTUPACService.listarTodos();
    }

    @GetMapping("/enriquecidos")
    public List<RequisitoTUPACEnriquecidoDTO> listarEnriquecidos() {
        return requisitoTUPACService.listarTodos().stream()
                .map(this::toEnriquecidoDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/tupac/{tupacId}/enriquecidos")
    public List<RequisitoTUPACEnriquecidoDTO> listarEnriquecidosPorTupac(@PathVariable Long tupacId) {
        return requisitoTUPACService.listarPorTupac(tupacId).stream()
                .map(this::toEnriquecidoDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<RequisitoTUPACEnriquecidoDTO> crear(@RequestBody Map<String, Object> data) {
        try {
            RequisitoTUPAC requisito = new RequisitoTUPAC();

            // Simple fields
            requisito.setCodigo((String) data.get("codigo"));
            requisito.setDescripcion((String) data.get("descripcion"));
            requisito.setTipoDocumento((String) data.get("tipoDocumento"));

            // Optional fields with defaults
            if (data.containsKey("obligatorio")) {
                requisito.setObligatorio((Boolean) data.get("obligatorio"));
            } else {
                requisito.setObligatorio(true);
            }
            if (data.containsKey("esExamen")) {
                requisito.setEsExamen((Boolean) data.get("esExamen"));
            }
            if (data.containsKey("observaciones")) {
                requisito.setObservaciones((String) data.get("observaciones"));
            }
            if (data.containsKey("activo")) {
                requisito.setActivo((Boolean) data.get("activo"));
            } else {
                requisito.setActivo(true);
            }
            if (data.containsKey("diasValidez")) {
                Object dv = data.get("diasValidez");
                if (dv != null) {
                    Integer diasValidez = null;
                    if (dv instanceof Number) {
                        diasValidez = ((Number) dv).intValue();
                    } else if (dv instanceof String) {
                        diasValidez = Integer.valueOf((String) dv);
                    }
                    requisito.setDiasValidez(diasValidez);
                }
            }

            // Handle TUPAC relationship: expects { "tupac": { "id": number } }
            Map<String, Object> tupacMap = (Map<String, Object>) data.get("tupac");
            if (tupacMap != null) {
                Object idObj = tupacMap.get("id");
                if (idObj != null) {
                    Long tupacId = null;
                    if (idObj instanceof Number) {
                        tupacId = ((Number) idObj).longValue();
                    } else if (idObj instanceof String) {
                        tupacId = Long.valueOf((String) idObj);
                    }
                    if (tupacId != null) {
                        TUPAC tupac = tupacService.buscarPorId(tupacId);
                        requisito.setTupac(tupac);
                    }
                }
            }

            // Handle Formato: expects formatoId (number or null)
            Object formatoIdObj = data.get("formatoId");
            if (formatoIdObj != null) {
                Long formatoId = null;
                if (formatoIdObj instanceof Number) {
                    formatoId = ((Number) formatoIdObj).longValue();
                } else if (formatoIdObj instanceof String) {
                    formatoId = Long.valueOf((String) formatoIdObj);
                }
                if (formatoId != null) {
                    Formatos formato = formatosService.buscarPorId(formatoId).orElse(null);
                    requisito.setFormato(formato);
                }
            } else {
                requisito.setFormato(null);
            }

            RequisitoTUPAC guardado = requisitoTUPACService.guardar(requisito);
            return ResponseEntity.ok(toEnriquecidoDTO(guardado));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{id}")
    public RequisitoTUPAC obtener(@PathVariable Long id) {
        return requisitoTUPACService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequisitoTUPACEnriquecidoDTO> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        RequisitoTUPAC requisito = requisitoTUPACService.buscarPorId(id);
        if (requisito == null) {
            return ResponseEntity.notFound().build();
        }

        // Update simple fields if present
        if (data.containsKey("codigo")) {
            requisito.setCodigo((String) data.get("codigo"));
        }
        if (data.containsKey("descripcion")) {
            requisito.setDescripcion((String) data.get("descripcion"));
        }
        if (data.containsKey("tipoDocumento")) {
            requisito.setTipoDocumento((String) data.get("tipoDocumento"));
        }
        if (data.containsKey("obligatorio")) {
            requisito.setObligatorio((Boolean) data.get("obligatorio"));
        }
        if (data.containsKey("esExamen")) {
            requisito.setEsExamen((Boolean) data.get("esExamen"));
        }
        if (data.containsKey("observaciones")) {
            requisito.setObservaciones((String) data.get("observaciones"));
        }
        if (data.containsKey("activo")) {
            requisito.setActivo((Boolean) data.get("activo"));
        }
        if (data.containsKey("diasValidez")) {
            Object dv = data.get("diasValidez");
            if (dv != null) {
                Integer diasValidez = null;
                if (dv instanceof Number) {
                    diasValidez = ((Number) dv).intValue();
                } else if (dv instanceof String) {
                    diasValidez = Integer.valueOf((String) dv);
                }
                requisito.setDiasValidez(diasValidez);
            } else {
                requisito.setDiasValidez(null);
            }
        }

        // Update TUPAC if provided
        if (data.containsKey("tupac")) {
            Map<String, Object> tupacMap = (Map<String, Object>) data.get("tupac");
            if (tupacMap != null) {
                Object idObj = tupacMap.get("id");
                if (idObj != null) {
                    Long tupacId = null;
                    if (idObj instanceof Number) {
                        tupacId = ((Number) idObj).longValue();
                    } else if (idObj instanceof String) {
                        tupacId = Long.valueOf((String) idObj);
                    }
                    if (tupacId != null) {
                        TUPAC tupac = tupacService.buscarPorId(tupacId);
                        requisito.setTupac(tupac);
                    }
                }
            }
        }

        // Update Formato if provided
        if (data.containsKey("formatoId")) {
            Object formatoIdObj = data.get("formatoId");
            if (formatoIdObj != null) {
                Long formatoId = null;
                if (formatoIdObj instanceof Number) {
                    formatoId = ((Number) formatoIdObj).longValue();
                } else if (formatoIdObj instanceof String) {
                    formatoId = Long.valueOf((String) formatoIdObj);
                }
                if (formatoId != null) {
                    Formatos formato = formatosService.buscarPorId(formatoId).orElse(null);
                    requisito.setFormato(formato);
                }
            } else {
                requisito.setFormato(null);
            }
        }

        RequisitoTUPAC guardado = requisitoTUPACService.guardar(requisito);
        return ResponseEntity.ok(toEnriquecidoDTO(guardado));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        requisitoTUPACService.eliminar(id);
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<RequisitoTUPACEnriquecidoDTO> activar(@PathVariable Long id) {
        RequisitoTUPAC requisito = requisitoTUPACService.buscarPorId(id);
        if (requisito == null) {
            return ResponseEntity.notFound().build();
        }
        requisito.setActivo(true);
        requisito = requisitoTUPACService.guardar(requisito);
        return ResponseEntity.ok(toEnriquecidoDTO(requisito));
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<RequisitoTUPACEnriquecidoDTO> desactivar(@PathVariable Long id) {
        RequisitoTUPAC requisito = requisitoTUPACService.buscarPorId(id);
        if (requisito == null) {
            return ResponseEntity.notFound().build();
        }
        requisito.setActivo(false);
        requisito = requisitoTUPACService.guardar(requisito);
        return ResponseEntity.ok(toEnriquecidoDTO(requisito));
    }

    @GetMapping("/activos")
    public List<RequisitoTUPAC> listarActivos() {
        return requisitoTUPACService.listarActivos();
    }

    @GetMapping("/tipos-documento")
    public List<String> obtenerTiposDocumentoUnicos() {
        return requisitoTUPACService.obtenerTiposDocumentoUnicos();
    }

    private RequisitoTUPACEnriquecidoDTO toEnriquecidoDTO(RequisitoTUPAC r) {
        if (r == null) return null;
        RequisitoTUPACEnriquecidoDTO dto = new RequisitoTUPACEnriquecidoDTO();
        dto.setId(r.getId());
        dto.setCodigo(r.getCodigo());
        dto.setDescripcion(r.getDescripcion());
        dto.setObligatorio(r.getObligatorio());
        dto.setTipoDocumento(r.getTipoDocumento());
        dto.setEsExamen(r.getEsExamen());
        dto.setObservaciones(r.getObservaciones());
        dto.setActivo(r.getActivo());
        dto.setDiasValidez(r.getDiasValidez());

        if (r.getTupac() != null) {
            dto.setTupacId(r.getTupac().getIdTupac());
            dto.setTupacCodigo(r.getTupac().getCodigo());
            dto.setTupacDescripcion(r.getTupac().getDescripcion());
            dto.setTupacEstado(r.getTupac().getEstado());
            dto.setTupacCategoria(r.getTupac().getCategoria());
        }

        if (r.getFormato() != null) {
            dto.setFormatoId(r.getFormato().getIdFormato());
            dto.setFormatoDescripcion(r.getFormato().getDescripcion());
            dto.setFormatoArchivoRuta(r.getFormato().getArchivoRuta());
        }

        // Stats placeholders
        dto.setTotalDocumentos(0);
        dto.setDocumentosAprobados(0);
        dto.setDocumentosPendientes(0);
        dto.setGruposProgramados(0);

        return dto;
    }
}
