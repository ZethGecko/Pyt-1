package com.example.demo.repository;

import com.example.demo.model.Inspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InspeccionRepository extends JpaRepository<Inspeccion, Long> {

    @Query("SELECT DISTINCT i FROM Inspeccion i " +
           "LEFT JOIN FETCH i.instancias ii " +
           "LEFT JOIN FETCH ii.instanciaTramite it " +
           "LEFT JOIN FETCH it.tramite t " +
           "LEFT JOIN FETCH t.empresa e " +
           "LEFT JOIN FETCH e.gerente " +
           "LEFT JOIN FETCH i.tramite t2 " +
           "LEFT JOIN FETCH t2.empresa e2 " +
           "LEFT JOIN FETCH e2.gerente " +
           "LEFT JOIN FETCH i.usuarioInspector")
    List<Inspeccion> findAllWithDetails();

    @Query("SELECT DISTINCT i FROM Inspeccion i " +
           "LEFT JOIN FETCH i.instancias ii " +
           "LEFT JOIN FETCH ii.instanciaTramite it " +
           "LEFT JOIN FETCH it.tramite " +
           "LEFT JOIN FETCH i.tramite t " +
           "LEFT JOIN FETCH t.empresa e " +
           "LEFT JOIN FETCH e.gerente " +
           "LEFT JOIN FETCH i.usuarioInspector " +
           "WHERE i.idInspeccion = :id")
    Optional<Inspeccion> findByIdWithInstancias(@Param("id") Long id);

    @Query("SELECT i FROM Inspeccion i WHERE i.tramite.idTramite = :tramiteId")
    List<Inspeccion> findByTramiteId(@Param("tramiteId") Long tramiteId);

    @Query("SELECT i FROM Inspeccion i WHERE i.fechaProgramada BETWEEN :fechaDesde AND :fechaHasta")
    List<Inspeccion> findByFechaProgramadaBetween(@Param("fechaDesde") LocalDate fechaDesde,
                                                   @Param("fechaHasta") LocalDate fechaHasta);

    @Query("SELECT i FROM Inspeccion i WHERE LOWER(i.tramite.empresa.nombre) LIKE LOWER(CONCAT('%', :empresaNombre, '%'))")
    List<Inspeccion> findByEmpresaNombreContainingIgnoreCase(@Param("empresaNombre") String empresaNombre);
}
