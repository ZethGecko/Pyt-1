package com.example.demo.repository;

import com.example.demo.model.HistorialTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialTramiteRepository extends JpaRepository<HistorialTramite, Long> {

    @Query("SELECT h FROM HistorialTramite h " +
           "LEFT JOIN FETCH h.usuarioAccion " +
           "LEFT JOIN FETCH h.usuarioResponsable " +
           "LEFT JOIN FETCH h.departamentoOrigen " +
           "LEFT JOIN FETCH h.departamentoDestino " +
           "WHERE h.tramiteId = :tramiteId")
    List<HistorialTramite> findByTramiteIdWithFetch(@Param("tramiteId") Long tramiteId);
}
