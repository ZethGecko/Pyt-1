package com.example.demo.repository;

import com.example.demo.model.GrupoPresentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface GrupoPresentacionRepository extends JpaRepository<GrupoPresentacion, Long> {

    List<GrupoPresentacion> findByEstado(GrupoPresentacion.EstadoGrupo estado);

    List<GrupoPresentacion> findByRequisitoExamen_Id(Long requisitoExamenId);

    List<GrupoPresentacion> findByFechaBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT gp FROM GrupoPresentacion gp WHERE gp.estado = 'PROGRAMADO' AND gp.fecha >= CURRENT_DATE ORDER BY gp.fecha ASC")
    List<GrupoPresentacion> findProximosGruposProgramados();

    @Query("SELECT gp FROM GrupoPresentacion gp WHERE gp.requisitoExamen.id = :requisitoId AND gp.fecha = :fecha")
    List<GrupoPresentacion> findByRequisitoIdAndFecha(@Param("requisitoId") Long requisitoId, @Param("fecha") LocalDate fecha);

    @Query("SELECT COUNT(insc) FROM InscripcionExamen insc WHERE insc.grupoPresentacion.id = :grupoId AND insc.activo = true")
    long countInscripcionesActivasByGrupoId(@Param("grupoId") Long grupoId);

    @Query("SELECT gp FROM GrupoPresentacion gp WHERE gp.configuracionExamen.id = :configId AND gp.estado = 'PROGRAMADO'")
    List<GrupoPresentacion> findActiveByConfigId(@Param("configId") Long configId);
}
