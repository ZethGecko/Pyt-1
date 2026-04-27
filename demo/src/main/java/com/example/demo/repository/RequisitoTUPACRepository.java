package com.example.demo.repository;

import com.example.demo.model.RequisitoTUPAC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RequisitoTUPACRepository extends JpaRepository<RequisitoTUPAC, Long> {
    List<RequisitoTUPAC> findByTupac_IdTupac(Long idTupac);

    @Query("SELECT r FROM RequisitoTUPAC r LEFT JOIN FETCH r.tupac LEFT JOIN FETCH r.formato")
    List<RequisitoTUPAC> findAllWithTupacAndFormato();

    @Query("SELECT r FROM RequisitoTUPAC r LEFT JOIN FETCH r.tupac LEFT JOIN FETCH r.formato WHERE r.tupac.idTupac = :tupacId")
    List<RequisitoTUPAC> findByTupac_IdTupacWithFetch(@Param("tupacId") Long tupacId);
    
     @Query("SELECT r FROM RequisitoTUPAC r LEFT JOIN FETCH r.tupac LEFT JOIN FETCH r.formato WHERE r.activo = true")
     List<RequisitoTUPAC> findAllActiveWithFetch();
    
    @Query("SELECT DISTINCT r.tipoDocumento FROM RequisitoTUPAC r WHERE r.activo = true AND r.tipoDocumento IS NOT NULL")
    List<String> findDistinctTipoDocumentoByActivoTrue();
}
