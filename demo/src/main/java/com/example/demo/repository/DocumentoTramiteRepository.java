package com.example.demo.repository;

import com.example.demo.model.DocumentoTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoTramiteRepository extends JpaRepository<DocumentoTramite, Long> {

    @Query("SELECT d FROM DocumentoTramite d " +
           "LEFT JOIN FETCH d.requisito " +
           "LEFT JOIN FETCH d.usuarioAsignado " +
           "LEFT JOIN FETCH d.usuarioRevisa " +
           "LEFT JOIN FETCH d.grupoPresentacion " +
           "WHERE d.tramiteId = :tramiteId")
    List<DocumentoTramite> findByTramiteIdWithFetch(@Param("tramiteId") Long tramiteId);

    @Query("SELECT d FROM DocumentoTramite d LEFT JOIN FETCH d.requisito WHERE d.tramiteId = :tramiteId")
    List<DocumentoTramite> findByTramiteIdWithRequisito(@Param("tramiteId") Long tramiteId);

     List<DocumentoTramite> findByTramiteIdIn(List<Long> tramiteIds);

     @Query("SELECT d FROM DocumentoTramite d " +
            "LEFT JOIN FETCH d.requisito " +
            "LEFT JOIN FETCH d.usuarioAsignado " +
            "LEFT JOIN FETCH d.usuarioRevisa " +
            "LEFT JOIN FETCH d.grupoPresentacion " +
            "WHERE d.instanciaTramite.idInstancia = :instanciaId")
     List<DocumentoTramite> findByInstanciaTramiteIdInstancia(@Param("instanciaId") Long instanciaId);
 }
