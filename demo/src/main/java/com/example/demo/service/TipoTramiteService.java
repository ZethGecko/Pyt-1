package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.TipoTramite;
import com.example.demo.model.TUPAC;
import com.example.demo.repository.TipoTramiteRepository;
import com.example.demo.repository.TUPACRepository;

@Service
@Transactional(readOnly = true)
public class TipoTramiteService {

    @Autowired
    private TipoTramiteRepository repo;
    
    @Autowired
    private TUPACRepository tupacRepository;

    public List<TipoTramite> listarTodos() {
        return repo.findAllWithTupac();
    }

    public Optional<TipoTramite> buscarPorId(Long id) {
        return repo.findById(id);
    }

    @Transactional(readOnly = true)
    public TipoTramite buscarPorIdConTupac(Long id) {
        return repo.findByIdWithTupac(id);
    }

    public Optional<TipoTramite> buscarPorCodigo(String codigo) {
        return listarTodos().stream()
                .filter(t -> t.getCodigo() != null && t.getCodigo().equals(codigo))
                .findFirst();
    }

    @Transactional
    public TipoTramite crear(TipoTramite tipo) {
        // Si tiene tupac con ID, cargar la entidad persistida
        if (tipo.getTupac() != null) {
            Long tupacId = tipo.getTupac().getIdTupac();
            if (tupacId != null) {
                TUPAC tupacPersistido = tupacRepository.findById(tupacId)
                    .orElseThrow(() -> new RuntimeException("TUPAC no encontrado con id: " + tupacId));
                tipo.setTupac(tupacPersistido);
            } else {
                tipo.setTupac(null);
            }
        }
        return repo.save(tipo);
    }

    @Transactional
    public TipoTramite actualizar(Long id, TipoTramite datos) {
        return repo.findById(id).map(tipo -> {
            if (datos.getCodigo() != null) tipo.setCodigo(datos.getCodigo());
            if (datos.getDescripcion() != null) tipo.setDescripcion(datos.getDescripcion());
            if (datos.getDiasDescargo() != null) tipo.setDiasDescargo(datos.getDiasDescargo());
            if (datos.getRequisitosIds() != null) tipo.setRequisitosIds(datos.getRequisitosIds());

            // Manejar TUPAC: si viene en datos, cargar la entidad persistida
            if (datos.getTupac() != null) {
                Long tupacId = datos.getTupac().getIdTupac();
                if (tupacId != null) {
                    TUPAC tupacPersistido = tupacRepository.findById(tupacId)
                        .orElseThrow(() -> new RuntimeException("TUPAC no encontrado con id: " + tupacId));
                    tipo.setTupac(tupacPersistido);
                } else {
                    tipo.setTupac(null);
                }
            } else {
                tipo.setTupac(null);
            }
            return repo.save(tipo);
        }).orElse(null);
    }

    @Transactional
    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public List<TipoTramite> buscar(String termino) {
        return listarTodos().stream()
                .filter(t -> (t.getCodigo() != null && t.getCodigo().toLowerCase().contains(termino.toLowerCase())) ||
                           (t.getDescripcion() != null && t.getDescripcion().toLowerCase().contains(termino.toLowerCase())))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<TipoTramite> listarParaPersonaNatural() {
        return listarTodos().stream()
                .filter(t -> "PERSONA_NATURAL".equals(t.getTupac() != null ? t.getTupac().getCategoria() : ""))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<TipoTramite> listarParaEmpresa() {
        return listarTodos().stream()
                .filter(t -> "EMPRESA".equals(t.getTupac() != null ? t.getTupac().getCategoria() : ""))
                .collect(java.util.stream.Collectors.toList());
    }
}
