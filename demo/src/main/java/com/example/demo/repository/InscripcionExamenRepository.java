package com.example.demo.repository;

import com.example.demo.model.InscripcionExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscripcionExamenRepository extends JpaRepository<InscripcionExamen, Long> {
    
    long countByGrupoPresentacionIdAndActivoTrue(Long grupoPresentacionId);
    
    List<InscripcionExamen> findByGrupoPresentacionId(Long grupoPresentacionId);
    
    List<InscripcionExamen> findByPersonaIdAndActivoTrue(Long personaId);
}
