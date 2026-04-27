package com.example.demo.repository;

import com.example.demo.model.RequisitoTUPAC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RequisitoTUPACRepository extends JpaRepository<RequisitoTUPAC, Long> {

    @Query("SELECT r FROM RequisitoTUPAC r LEFT JOIN FETCH r.tupac LEFT JOIN FETCH r.formato WHERE r.activo = true")
    List<RequisitoTUPAC> findAllActiveWithFetch();

    @Query("SELECT r FROM RequisitoTUPAC r LEFT JOIN FETCH r.tupac LEFT JOIN FETCH r.formato")
    List<RequisitoTUPAC> findAllWithTupacAndFormato();

    @Query("SELECT r FROM RequisitoTUPAC r WHERE r.tupac.idTupac = :tupacId AND r.activo = true")
    List<RequisitoTUPAC> findByTupac_IdTupacWithFetch(@Param("tupacId") Long tupacId);

    @Query("SELECT DISTINCT r.tipoDocumento FROM RequisitoTUPAC r WHERE r.activo = true")
    List<String> findDistinctTipoDocumentoByActivoTrue();
}

