package com.example.demo.service;

import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.repository.RequisitoTUPACRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequisitoTUPACService {

    private final RequisitoTUPACRepository requisitoTUPACRepository;

    public RequisitoTUPACService(RequisitoTUPACRepository requisitoTUPACRepository) {
        this.requisitoTUPACRepository = requisitoTUPACRepository;
    }

    public List<RequisitoTUPAC> listarTodos() {
        return requisitoTUPACRepository.findAllWithTupacAndFormato();
    }

    public List<RequisitoTUPAC> listarActivos() {
        return requisitoTUPACRepository.findAllActiveWithFetch();
    }

    public RequisitoTUPAC guardar(RequisitoTUPAC requisito) {
        return requisitoTUPACRepository.save(requisito);
    }

    public RequisitoTUPAC buscarPorId(Long id) {
        return requisitoTUPACRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        requisitoTUPACRepository.deleteById(id);
    }

    public List<RequisitoTUPAC> listarPorTupac(Long tupacId) {
        return requisitoTUPACRepository.findByTupac_IdTupacWithFetch(tupacId);
    }

    public List<String> obtenerTiposDocumentoUnicos() {
        return requisitoTUPACRepository.findDistinctTipoDocumentoByActivoTrue();
    }
}
