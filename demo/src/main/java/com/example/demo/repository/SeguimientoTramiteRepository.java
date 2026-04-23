package com.example.demo.repository;

import com.example.demo.model.SeguimientoTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeguimientoTramiteRepository extends JpaRepository<SeguimientoTramite, Long> {

    List<SeguimientoTramite> findByTramiteId(Long tramiteId);

    @Query("SELECT s FROM SeguimientoTramite s WHERE s.tramiteId = :tramiteId AND s.estadoEtapa = 'EN_PROGRESO'")
    SeguimientoTramite findActivoByTramiteId(@Param("tramiteId") Long tramiteId);
}