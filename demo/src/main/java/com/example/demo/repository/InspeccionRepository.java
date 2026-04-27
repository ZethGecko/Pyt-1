package com.example.demo.repository;

import com.example.demo.model.Inspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InspeccionRepository extends JpaRepository<Inspeccion, Long> {

    @Query("SELECT i FROM Inspeccion i WHERE i.tramite.idTramite = :tramiteId")
    List<Inspeccion> findByTramiteId(@Param("tramiteId") Long tramiteId);
}
