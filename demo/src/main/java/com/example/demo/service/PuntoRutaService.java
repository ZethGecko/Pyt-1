package com.example.demo.service;

import com.example.demo.model.PuntoRuta;
import com.example.demo.repository.PuntoRutaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PuntoRutaService {

    @Autowired
    private PuntoRutaRepository repo;

    public List<PuntoRuta> listarTodos() {
        return repo.findAll();
    }

    public Optional<PuntoRuta> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public List<PuntoRuta> listarActivos() {
        return repo.findAllActivos();
    }

    public List<PuntoRuta> buscarPorTermino(String termino) {
        return repo.buscarPorTermino(termino);
    }

    public List<PuntoRuta> listarPorRuta(Long rutaId) {
        return repo.findByRutaIdRutaOrderByOrdenAsc(rutaId);
    }

    public List<PuntoRuta> listarPorEmpresa(Long empresaId) {
        return repo.findByEmpresaIdEmpresa(empresaId);
    }

    public List<PuntoRuta> listarPorTipo(String tipo) {
        return repo.findByTipo(tipo);
    }

    public PuntoRuta guardar(PuntoRuta puntoRuta) {
        if (puntoRuta.getFechaRegistro() == null) {
            puntoRuta.setFechaRegistro(LocalDateTime.now());
        }
        puntoRuta.setFechaActualizacion(LocalDateTime.now());
        return repo.save(puntoRuta);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public boolean existePorNombreEnRuta(String nombre, Long rutaId, Long idExcluir) {
        List<PuntoRuta> puntos = repo.findByRutaIdRuta(rutaId);
        return puntos.stream()
                .anyMatch(p -> p.getNombre().equalsIgnoreCase(nombre) &&
                        !p.getIdPuntoRuta().equals(idExcluir));
    }
}