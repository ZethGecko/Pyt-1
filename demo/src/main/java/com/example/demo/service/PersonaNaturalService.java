package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.PersonaNatural;
import com.example.demo.repository.PersonaNaturalRepository;

@Service
public class PersonaNaturalService {

    @Autowired
    private PersonaNaturalRepository repo;

    public List<PersonaNatural> listarTodos() {
        return repo.findAll();
    }

    public Optional<PersonaNatural> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public Optional<PersonaNatural> buscarPorDni(Integer dni) {
        return repo.findAll().stream()
                .filter(p -> p.getDni() != null && p.getDni().equals(dni))
                .findFirst();
    }

    public List<PersonaNatural> buscarPorNombre(String nombre) {
        return repo.findAll().stream()
                .filter(p -> p.getNombres() != null && p.getNombres().toLowerCase().contains(nombre.toLowerCase()))
                .toList();
    }

    public Optional<PersonaNatural> buscarPorEmail(String email) {
        return repo.findAll().stream()
                .filter(p -> p.getEmail() != null && p.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    public long contarPorGenero(String genero) {
        return repo.findAll().stream()
                .filter(p -> p.getGenero() != null && p.getGenero().equals(genero))
                .count();
    }

    public PersonaNatural guardar(PersonaNatural persona) {
        // Validate dni uniqueness
        if (persona.getDni() != null && buscarPorDni(persona.getDni()).isPresent() && persona.getIdPersonaNatural() == null) {
            throw new IllegalArgumentException("Ya existe una persona con el DNI: " + persona.getDni());
        }
        // Validate email uniqueness if provided
        if (persona.getEmail() != null && !persona.getEmail().isBlank() && 
            buscarPorEmail(persona.getEmail()).isPresent() && persona.getIdPersonaNatural() == null) {
            throw new IllegalArgumentException("Ya existe una persona con el email: " + persona.getEmail());
        }
        return repo.save(persona);
    }

    public PersonaNatural actualizar(Long id, PersonaNatural datos) {
        return repo.findById(id).map(existing -> {
            if (datos.getDni() != null && !datos.getDni().equals(existing.getDni())) {
                if (buscarPorDni(datos.getDni()).isPresent()) {
                    throw new IllegalArgumentException("Ya existe una persona con el DNI: " + datos.getDni());
                }
                existing.setDni(datos.getDni());
            }
            if (datos.getEmail() != null && !datos.getEmail().equalsIgnoreCase(existing.getEmail())) {
                if (buscarPorEmail(datos.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Ya existe una persona con el email: " + datos.getEmail());
                }
                existing.setEmail(datos.getEmail());
            }
            if (datos.getNombres() != null) existing.setNombres(datos.getNombres());
            if (datos.getApellidos() != null) existing.setApellidos(datos.getApellidos());
            if (datos.getTelefono() != null) existing.setTelefono(datos.getTelefono());
            if (datos.getGenero() != null) existing.setGenero(datos.getGenero());
            if (datos.getObservaciones() != null) existing.setObservaciones(datos.getObservaciones());
            return repo.save(existing);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public List<PersonaNatural> buscarCompleto(String termino) {
        return repo.findAll().stream()
                .filter(p -> (p.getNombres() != null && p.getNombres().toLowerCase().contains(termino.toLowerCase())) ||
                           (p.getApellidos() != null && p.getApellidos().toLowerCase().contains(termino.toLowerCase())) ||
                           (p.getDni() != null && p.getDni().toString().contains(termino)))
                .toList();
    }

    public List<PersonaNatural> buscarInscriptasEnGrupo(Long grupoId) {
        // Need InscripcionExamenRepository to get personas from inscripciones
        // For now return empty list, will implement when we have access to that repository
        return List.of();
    }
}
