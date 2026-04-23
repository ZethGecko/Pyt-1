package com.example.demo.repository;

import com.example.demo.model.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RutaRepository extends JpaRepository<Ruta, Long> {

    Optional<Ruta> findByCodigo(String codigo);

    List<Ruta> findByEmpresaIdEmpresa(Long empresaId);

    List<Ruta> findByEstado(String estado);

    List<Ruta> findByTipo(String tipo);

    List<Ruta> findByGerenteResponsableIdGerente(Long gerenteId);

    @Query("SELECT r FROM Ruta r WHERE r.estado = 'ACTIVO'")
    List<Ruta> findAllActivos();

    @Query("SELECT r FROM Ruta r WHERE LOWER(r.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(r.codigo) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Ruta> buscarPorTermino(@Param("termino") String termino);

    @Query("SELECT r FROM Ruta r LEFT JOIN FETCH r.puntosRuta WHERE r.idRuta = :id")
    Optional<Ruta> findByIdWithPuntosRuta(@Param("id") Long id);

    @Query("SELECT COUNT(r) FROM Ruta r WHERE r.empresa.id = :empresaId")
    Long countByEmpresaId(@Param("empresaId") Long empresaId);
}