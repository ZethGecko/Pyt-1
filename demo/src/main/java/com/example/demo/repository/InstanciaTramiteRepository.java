package com.example.demo.repository;

import com.example.demo.model.InstanciaTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface InstanciaTramiteRepository extends JpaRepository<InstanciaTramite, Long> {
    List<InstanciaTramite> findByTramite_IdTramiteOrderByFechaCreacionDesc(Long tramiteId);
    List<InstanciaTramite> findByTramite_IdTramiteAndEstadoOrderByFechaCreacionDesc(Long tramiteId, String estado);
    long countByTramite_IdTramite(Long tramiteId);
    
    @Query("SELECT i FROM InstanciaTramite i LEFT JOIN FETCH i.tramite t LEFT JOIN FETCH t.tipoTramite")
    List<InstanciaTramite> findAllWithTramiteAndTipoTramite();
}
