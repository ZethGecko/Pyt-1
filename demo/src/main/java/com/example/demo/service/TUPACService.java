package com.example.demo.service;

import com.example.demo.model.TUPAC;
import com.example.demo.repository.TUPACRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TUPACService {

    private final TUPACRepository tupacRepository;

    public TUPACService(TUPACRepository tupacRepository) {
        this.tupacRepository = tupacRepository;
    }

    public List<TUPAC> listarTodos() {
        return tupacRepository.findAll();
    }

    public TUPAC guardar(TUPAC tupac) {
        return tupacRepository.save(tupac);
    }

    public TUPAC buscarPorId(Long id) {
        return tupacRepository.findById(id).orElse(null);
    }

    public TUPAC buscarPorIdConRequisitos(Long id) {
        return tupacRepository.findByIdWithRequisitos(id);
    }

    public void eliminar(Long id) {
        tupacRepository.deleteById(id);
    }
}
