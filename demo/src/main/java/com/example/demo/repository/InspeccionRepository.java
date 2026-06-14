package com.example.demo.repository;

import com.example.demo.dto.InspeccionPublicaDTO;
import com.example.demo.model.Inspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InspeccionRepository extends JpaRepository<Inspeccion, Long> {

    @Query("SELECT DISTINCT i FROM Inspeccion i " +
           "LEFT JOIN FETCH i.instancias ii " +
           "LEFT JOIN FETCH ii.instanciaTramite it " +
           "LEFT JOIN FETCH it.tramite t " +
           "LEFT JOIN FETCH t.empresa e " +
           "LEFT JOIN FETCH e.gerente " +
           "LEFT JOIN FETCH i.empresa emp " +
           "LEFT JOIN FETCH emp.gerente " +
           "LEFT JOIN FETCH i.tramite t2 " +
           "LEFT JOIN FETCH t2.empresa e2 " +
           "LEFT JOIN FETCH e2.gerente " +
           "LEFT JOIN FETCH i.usuarioInspector")
    List<Inspeccion> findAllWithDetails();

    @Query("SELECT DISTINCT i FROM Inspeccion i " +
           "LEFT JOIN FETCH i.instancias ii " +
           "LEFT JOIN FETCH ii.instanciaTramite it " +
           "LEFT JOIN FETCH it.tramite t " +
           "LEFT JOIN FETCH t.empresa e " +
           "LEFT JOIN FETCH e.gerente " +
           "LEFT JOIN FETCH i.empresa emp " +
           "LEFT JOIN FETCH emp.gerente " +
           "LEFT JOIN FETCH i.tramite t2 " +
           "LEFT JOIN FETCH t2.empresa e2 " +
           "LEFT JOIN FETCH e2.gerente " +
           "LEFT JOIN FETCH i.usuarioInspector " +
           "WHERE i.fechaProgramada = :fecha AND i.lugar = :lugar")
    List<Inspeccion> findBloqueWithDetails(@Param("fecha") LocalDate fecha,
                                           @Param("lugar") String lugar);

    @Query("SELECT NEW com.example.demo.dto.InspeccionPublicaDTO(" +
           "i.idInspeccion, i.codigo, i.fechaProgramada, i.hora, i.lugar, " +
           "COALESCE(e.nombre, te.nombre, 'Sin asignar'), " +
           "(SELECT COUNT(ii.id) FROM InspeccionInstancia ii WHERE ii.inspeccion.idInspeccion = i.idInspeccion)" +
           ") " +
           "FROM Inspeccion i " +
           "LEFT JOIN i.empresa e " +
           "LEFT JOIN i.tramite t " +
           "LEFT JOIN t.empresa te " +
           "WHERE (:desde IS NULL OR i.fechaProgramada >= :desde) " +
           "AND (:hasta IS NULL OR i.fechaProgramada <= :hasta) " +
           "AND (:empresaNombre IS NULL OR :empresaNombre = '' OR " +
           "LOWER(COALESCE(e.nombre, '')) LIKE LOWER(CONCAT('%', :empresaNombre, '%')) OR " +
           "LOWER(COALESCE(te.nombre, '')) LIKE LOWER(CONCAT('%', :empresaNombre, '%'))) " +
           "ORDER BY COALESCE(i.fechaEjecucion, i.fechaCreacion) DESC, i.fechaProgramada DESC")
    Page<InspeccionPublicaDTO> findPublicas(@Param("desde") LocalDate desde,
                                            @Param("hasta") LocalDate hasta,
                                            @Param("empresaNombre") String empresaNombre,
                                            Pageable pageable);

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

    @Query("SELECT i FROM Inspeccion i WHERE i.tramite.empresa.nombre LIKE LOWER(CONCAT('%', :empresaNombre, '%'))")
    List<Inspeccion> findByEmpresaNombreContainingIgnoreCase(@Param("empresaNombre") String empresaNombre);

    @Query("SELECT i FROM Inspeccion i " +
           "LEFT JOIN i.empresa e " +
           "LEFT JOIN i.tramite t " +
           "LEFT JOIN t.empresa te " +
           "WHERE e.idEmpresa = :empresaId OR te.idEmpresa = :empresaId " +
           "ORDER BY COALESCE(i.fechaEjecucion, i.fechaCreacion) DESC, i.fechaProgramada DESC")
    List<Inspeccion> findByEmpresaIdEmpresaOrderByFechaDesc(@Param("empresaId") Long empresaId);

    @Query("SELECT i FROM Inspeccion i WHERE i.formatoInspeccion.idFormatoInspeccion = :formatoId")
    List<Inspeccion> findByFormatoInspeccion_IdFormatoInspeccion(@Param("formatoId") Long formatoId);
}
