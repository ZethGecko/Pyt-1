package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.model.CategoriaTransporte;
import com.example.demo.repository.CategoriaTransporteRepository;

@Service
public class CategoriaTransporteService {
    private final CategoriaTransporteRepository repo;
    public CategoriaTransporteService(CategoriaTransporteRepository repo) { this.repo = repo; }
    
    public List<CategoriaTransporte> listarTodos() { return repo.findAll(); }
    
    public CategoriaTransporte guardar(CategoriaTransporte c) { return repo.save(c); }
    
    public CategoriaTransporte buscarPorId(Long id) { return repo.findById(id).orElse(null); }
    
    public void eliminar(Long id) { repo.deleteById(id); }
}
