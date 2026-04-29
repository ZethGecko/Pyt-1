package com.example.demo.repository;

import com.example.demo.model.TipoTramite;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

 @Repository
 public interface TipoTramiteRepository extends JpaRepository<TipoTramite, Long> {

     @Query("SELECT t FROM TipoTramite t LEFT JOIN FETCH t.tupac")
     List<TipoTramite> findAllWithTupac();

     @Query("SELECT t FROM TipoTramite t LEFT JOIN FETCH t.tupac WHERE t.idTipoTramite = :id")
     TipoTramite findByIdWithTupac(@Param("id") Long id);

     Optional<TipoTramite> findByCodigo(String codigo);
 }
