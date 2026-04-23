package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Publicacion;
import com.example.demo.repository.PublicacionRepository;

@Service
public class PublicacionService {

    @Autowired
    private PublicacionRepository repo;

    public List<Publicacion> listarTodos() {
        return repo.findAll();
    }

    public Optional<Publicacion> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<Publicacion> listarPorEstado(String estado) {
        return repo.findAll().stream()
                .filter(p -> estado != null && estado.equals(p.getEstado()))
                .toList();
    }

    public List<Publicacion> listarPorTipo(String tipo) {
        return repo.findAll().stream()
                .filter(p -> tipo != null && tipo.equals(p.getTipoPublicacion()))
                .toList();
    }

    public List<Publicacion> listarPorTipoTramite(Long tipoTramiteId) {
        return repo.findAll().stream()
                .filter(p -> p.getTipoTramite() != null && 
                           p.getTipoTramite().getIdTipoTramite() != null &&
                           p.getTipoTramite().getIdTipoTramite().equals(tipoTramiteId))
                .toList();
    }

    public List<Publicacion> listarPublicadas() {
        return repo.findAll().stream()
                .filter(p -> "PUBLICADO".equalsIgnoreCase(p.getEstado()))
                .toList();
    }

    public Publicacion crear(Publicacion pub) {
        if (pub.getFechaCreacion() == null) {
            pub.setFechaCreacion(LocalDateTime.now());
        }
        if (pub.getEstado() == null) {
            pub.setEstado("BORRADOR");
        }
        return repo.save(pub);
    }

    public Publicacion actualizar(Long id, Publicacion datos) {
        return repo.findById(id).map(pub -> {
            if (datos.getTitulo() != null) pub.setTitulo(datos.getTitulo());
            if (datos.getContenido() != null) pub.setContenido(datos.getContenido());
            if (datos.getTipoPublicacion() != null) pub.setTipoPublicacion(datos.getTipoPublicacion());
            if (datos.getEstado() != null) pub.setEstado(datos.getEstado());
            if (datos.getTipoTramite() != null) pub.setTipoTramite(datos.getTipoTramite());
            if (datos.getFormato() != null) pub.setFormato(datos.getFormato());
            return repo.save(pub);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public Publicacion publicar(Long id) {
        return repo.findById(id).map(pub -> {
            pub.setEstado("PUBLICADO");
            if (pub.getFechaPublicacion() == null) {
                pub.setFechaPublicacion(LocalDateTime.now());
            }
            pub.setFechaModificacion(LocalDateTime.now());
            return repo.save(pub);
        }).orElse(null);
    }

    public Publicacion archivar(Long id) {
        return repo.findById(id).map(pub -> {
            pub.setEstado("ARCHIVADO");
            return repo.save(pub);
        }).orElse(null);
    }

    public Publicacion desarchivar(Long id) {
        return repo.findById(id).map(pub -> {
            pub.setEstado("PUBLICADO"); // or BORRADOR?
            return repo.save(pub);
        }).orElse(null);
    }

    public long countByTipo(String tipo) {
        return repo.findAll().stream()
                .filter(p -> p.getTipoPublicacion() != null && p.getTipoPublicacion().equals(tipo))
                .count();
    }

    public long countByEstado(String estado) {
        return repo.findAll().stream()
                .filter(p -> p.getEstado() != null && p.getEstado().equals(estado))
                .count();
    }
}
