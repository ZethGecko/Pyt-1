package com.example.demo.repository;

import com.example.demo.model.PuntoRuta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuntoRutaRepository extends JpaRepository<PuntoRuta, Long> {

    List<PuntoRuta> findByRutaIdRuta(Long rutaId);

    List<PuntoRuta> findByEmpresaIdEmpresa(Long empresaId);

    List<PuntoRuta> findByEstado(String estado);

    List<PuntoRuta> findByTipo(String tipo);

    @Query("SELECT pr FROM PuntoRuta pr WHERE pr.ruta.idRuta = :rutaId ORDER BY pr.orden ASC")
    List<PuntoRuta> findByRutaIdRutaOrderByOrdenAsc(@Param("rutaId") Long rutaId);

    @Query("SELECT pr FROM PuntoRuta pr WHERE pr.estado = 'ACTIVO'")
    List<PuntoRuta> findAllActivos();

    @Query("SELECT pr FROM PuntoRuta pr WHERE LOWER(pr.nombre) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<PuntoRuta> buscarPorTermino(@Param("termino") String termino);
}