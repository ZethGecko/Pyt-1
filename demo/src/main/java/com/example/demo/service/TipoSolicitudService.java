package com.example.demo.service;

import com.example.demo.model.TipoSolicitud;
import com.example.demo.repository.TipoSolicitudRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoSolicitudService {

    private final TipoSolicitudRepository tipoSolicitudRepository;

    public TipoSolicitudService(TipoSolicitudRepository tipoSolicitudRepository) {
        this.tipoSolicitudRepository = tipoSolicitudRepository;
    }

    public List<TipoSolicitud> listarTodos() {
        return tipoSolicitudRepository.findAll();
    }

    public TipoSolicitud guardar(TipoSolicitud tipoSolicitud) {
        return tipoSolicitudRepository.save(tipoSolicitud);
    }

    public TipoSolicitud buscarPorId(Integer id) {
        return tipoSolicitudRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        tipoSolicitudRepository.deleteById(id);
    }
}
