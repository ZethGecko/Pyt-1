package com.example.demo.controller;

import com.example.demo.dto.TUPACResponseDTO;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.TUPAC;
import com.example.demo.service.TUPACService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tupac")
public class TUPACController {

    private final TUPACService tupacService;

    public TUPACController(TUPACService tupacService) {
        this.tupacService = tupacService;
    }

    private TUPACResponseDTO toResponseDTO(TUPAC t) {
        if (t == null) return null;
        String fechaStr = t.getFechaVigencia() != null ? t.getFechaVigencia().toString() : null;
        return new TUPACResponseDTO(
            t.getIdTupac(),
            fechaStr,
            t.getEstado(),
            t.getCategoria(),
            t.getCodigo(),
            t.getDescripcion()
        );
    }

    @GetMapping
    public List<TUPACResponseDTO> listar() {
        return tupacService.listarTodos().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public TUPACResponseDTO crear(@RequestBody TUPAC tupac) {
        TUPAC guardado = tupacService.guardar(tupac);
        return toResponseDTO(guardado);
    }

    @GetMapping("/{id}")
    public TUPACResponseDTO obtener(@PathVariable Long id) {
        return toResponseDTO(tupacService.buscarPorId(id));
    }

     @DeleteMapping("/{id}")
     public void eliminar(@PathVariable Long id) {
         tupacService.eliminar(id);
     }

     @GetMapping("/{id}/requisitos")
     public ResponseEntity<List<RequisitoTUPAC>> obtenerRequisitos(@PathVariable Long id) {
         TUPAC tupac = tupacService.buscarPorIdConRequisitos(id);
         if (tupac == null) {
             return ResponseEntity.notFound().build();
         }
         List<RequisitoTUPAC> requisitos = tupac.getRequisitos();
         if (requisitos == null) {
             requisitos = new ArrayList<>();
         }
         return ResponseEntity.ok(requisitos);
     }

     @PutMapping("/{id}/archivar")
    public TUPACResponseDTO archivar(@PathVariable Long id) {
        TUPAC tupac = tupacService.buscarPorId(id);
        if (tupac != null) {
            tupac.setEstado("archivado");
            tupac = tupacService.guardar(tupac);
        }
        return toResponseDTO(tupac);
    }

    @PutMapping("/{id}/vigente")
    public TUPACResponseDTO activar(@PathVariable Long id) {
        TUPAC tupac = tupacService.buscarPorId(id);
        if (tupac != null) {
            tupac.setEstado("vigente");
            tupac = tupacService.guardar(tupac);
        }
        return toResponseDTO(tupac);
    }
}
