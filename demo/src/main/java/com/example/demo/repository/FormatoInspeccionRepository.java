package com.example.demo.repository;

import com.example.demo.model.FormatoInspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormatoInspeccionRepository extends JpaRepository<FormatoInspeccion, Long> {
    Optional<FormatoInspeccion> findByInspecciones_IdInspeccion(Long inspeccionId);
    Optional<FormatoInspeccion> findByNombreAndActivoTrue(String nombre);
    Optional<FormatoInspeccion> findByNombre(String nombre);
    Optional<FormatoInspeccion> findByNombreStartingWith(String nombre);
}
