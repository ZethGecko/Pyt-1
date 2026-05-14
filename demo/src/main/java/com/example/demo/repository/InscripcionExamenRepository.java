package com.example.demo.repository;

import com.example.demo.model.InscripcionExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscripcionExamenRepository extends JpaRepository<InscripcionExamen, Long> {
    
    long countByGrupoPresentacionIdAndActivoTrue(Long grupoPresentacionId);
    
    List<InscripcionExamen> findByGrupoPresentacionId(Long grupoPresentacionId);
    
    List<InscripcionExamen> findByPersonaIdAndActivoTrue(Long personaId);
    
    @Query("SELECT i FROM InscripcionExamen i LEFT JOIN FETCH i.grupoPresentacion LEFT JOIN FETCH i.persona LEFT JOIN FETCH i.instanciaTramite WHERE i.tramiteId = :tramiteId")
    List<InscripcionExamen> findByTramiteId(@Param("tramiteId") Long tramiteId);

    @Query("SELECT i FROM InscripcionExamen i " +
           "LEFT JOIN FETCH i.grupoPresentacion " +
           "LEFT JOIN FETCH i.persona " +
           "LEFT JOIN FETCH i.instanciaTramite " +
           "WHERE i.tramiteId = :tramiteId AND (i.instanciaTramite.idInstancia = :instanciaId OR i.instanciaTramite IS NULL)")
    List<InscripcionExamen> findByTramiteIdAndInstanciaOrGlobal(@Param("tramiteId") Long tramiteId, @Param("instanciaId") Long instanciaId);
}
