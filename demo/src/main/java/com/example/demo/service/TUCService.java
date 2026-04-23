package com.example.demo.service;

import com.example.demo.model.TUC;
import com.example.demo.repository.TUCRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TUCService {

    private final TUCRepository tucRepository;

    public TUCService(TUCRepository tucRepository) {
        this.tucRepository = tucRepository;
    }

    public List<TUC> listarTodos() {
        return tucRepository.findAll();
    }

    public TUC guardar(TUC tuc) {
        return tucRepository.save(tuc);
    }

    public TUC buscarPorId(Long id) {
        return tucRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        tucRepository.deleteById(id);
    }
}
