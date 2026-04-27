package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.TipoTransporte;
import com.example.demo.repository.TipoTransporteRepository;

@Service
public class TipoTransporteService {

    private final TipoTransporteRepository tipoTransporteRepository;

    public TipoTransporteService(TipoTransporteRepository tipoTransporteRepository) {
        this.tipoTransporteRepository = tipoTransporteRepository;
    }

    public List<TipoTransporte> listarTodos() {
        return tipoTransporteRepository.findAllWithFetch();
    }

    public TipoTransporte guardar(TipoTransporte tipoTransporte) {
        return tipoTransporteRepository.save(tipoTransporte);
    }

    public TipoTransporte buscarPorId(Long id) {
        return tipoTransporteRepository.findByIdWithFetch(id);
    }

    public void eliminar(Long id) {
        tipoTransporteRepository.deleteById(id);
    }

    public List<TipoTransporte> listarPorCategoria(Long categoriaId) {
        return tipoTransporteRepository.findByCategoriaTransporte_IdCategoriaTransporteWithFetch(categoriaId);
    }
}