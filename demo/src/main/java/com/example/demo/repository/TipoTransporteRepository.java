package com.example.demo.repository;

import com.example.demo.model.TipoTransporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoTransporteRepository extends JpaRepository<TipoTransporte, Long> {
    List<TipoTransporte> findByCategoriaTransporte_IdCategoriaTransporte(Long categoriaId);
    
    @Query("SELECT t FROM TipoTransporte t LEFT JOIN FETCH t.categoriaTransporte LEFT JOIN FETCH t.subtipos WHERE t.categoriaTransporte.idCategoriaTransporte = :categoriaId")
    List<TipoTransporte> findByCategoriaTransporte_IdCategoriaTransporteWithFetch(@Param("categoriaId") Long categoriaId);

    @Query("SELECT t FROM TipoTransporte t LEFT JOIN FETCH t.categoriaTransporte LEFT JOIN FETCH t.subtipos")
    List<TipoTransporte> findAllWithFetch();

    @Query("SELECT t FROM TipoTransporte t LEFT JOIN FETCH t.categoriaTransporte LEFT JOIN FETCH t.subtipos WHERE t.idTipoTransporte = :id")
    TipoTransporte findByIdWithFetch(@Param("id") Long id);
}
