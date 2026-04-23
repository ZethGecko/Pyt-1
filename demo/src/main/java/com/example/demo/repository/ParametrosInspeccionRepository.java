package com.example.demo.repository;

import com.example.demo.model.ParametrosInspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ParametrosInspeccionRepository extends JpaRepository<ParametrosInspeccion, Integer> {

    List<ParametrosInspeccion> findByFichaInspeccion_IdFichaInspeccion(Long fichaId);

    // Assuming disponibles are all parameters (reusable)
    @Query("SELECT p FROM ParametrosInspeccion p")
    List<ParametrosInspeccion> findDisponibles();
}
