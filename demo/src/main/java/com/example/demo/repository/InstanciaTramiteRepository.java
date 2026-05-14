 package com.example.demo.repository;

import com.example.demo.model.InstanciaTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstanciaTramiteRepository extends JpaRepository<InstanciaTramite, Long> {
    List<InstanciaTramite> findByTramite_IdTramiteOrderByFechaCreacionDesc(Long tramiteId);
    List<InstanciaTramite> findByTramite_IdTramiteAndEstadoOrderByFechaCreacionDesc(Long tramiteId, String estado);
    long countByTramite_IdTramite(Long tramiteId);
    InstanciaTramite findTopByTramite_IdTramiteOrderByFechaCreacionDesc(Long tramiteId);

    @Query("SELECT i FROM InstanciaTramite i LEFT JOIN FETCH i.documentos WHERE i.tramite.idTramite = :tramiteId")
    List<InstanciaTramite> findByTramiteIdWithDocumentos(@Param("tramiteId") Long tramiteId);

    @Query("SELECT i FROM InstanciaTramite i LEFT JOIN FETCH i.tramite t LEFT JOIN FETCH t.tipoTramite LEFT JOIN FETCH t.empresa")
    List<InstanciaTramite> findAllWithTramiteAndTipoTramite();

    @Query("SELECT i FROM InstanciaTramite i LEFT JOIN FETCH i.tramite t LEFT JOIN FETCH t.empresa WHERE t.empresa.ruc = :ruc")
    List<InstanciaTramite> findByEmpresaRuc(@Param("ruc") String ruc);

  @Query("SELECT i FROM InstanciaTramite i LEFT JOIN FETCH i.tramite t LEFT JOIN FETCH t.empresa WHERE t.empresa.idEmpresa = :empresaId")
  List<InstanciaTramite> findByEmpresaId(@Param("empresaId") Long empresaId);

  @Modifying
  @Query("DELETE FROM InstanciaTramite i WHERE i.tramite.idTramite = :tramiteId")
  void deleteByTramiteId(@Param("tramiteId") Long tramiteId);
}
