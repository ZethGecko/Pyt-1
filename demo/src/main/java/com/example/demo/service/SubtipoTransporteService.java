package com.example.demo.service;

import com.example.demo.model.SubtipoTransporte;
import com.example.demo.repository.SubtipoTransporteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubtipoTransporteService {
    private final SubtipoTransporteRepository subtipoTransporteRepository;
    public SubtipoTransporteService(SubtipoTransporteRepository subtipoTransporteRepository) {
        this.subtipoTransporteRepository = subtipoTransporteRepository;
    }

    public List<SubtipoTransporte> listarTodos() {
        return subtipoTransporteRepository.findAll();
    }

    public SubtipoTransporte guardar(SubtipoTransporte subtipoTransporte) {
        return subtipoTransporteRepository.save(subtipoTransporte);
    }

    public SubtipoTransporte buscarPorId(Long id) {
        return subtipoTransporteRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        subtipoTransporteRepository.deleteById(id);
    }

    public List<SubtipoTransporte> listarPorTipoTransporte(Long tipoId) {
        return subtipoTransporteRepository.findByTipoTransporte_IdTipoTransporte(tipoId);
    }
}
