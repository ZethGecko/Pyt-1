package com.example.demo.service;

import com.example.demo.model.Solicitud;
import com.example.demo.repository.SolicitudRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;

    public SolicitudService(SolicitudRepository solicitudRepository) {
        this.solicitudRepository = solicitudRepository;
    }

    public List<Solicitud> listarTodas() {
        return solicitudRepository.findAll();
    }

    public Solicitud guardar(Solicitud solicitud) {
        return solicitudRepository.save(solicitud);
    }

    public Solicitud buscarPorId(Integer id) {
        return solicitudRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        solicitudRepository.deleteById(id);
    }
}
