package com.example.demo.repository;

import com.example.demo.model.EstadoDocumental;
import com.example.demo.model.VehiculoApto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculoAptoRepository extends JpaRepository<VehiculoApto, Long> {

    @EntityGraph(attributePaths = {
        "vehiculo",
        "vehiculo.empresa",
        "tramite",
        "tramite.tipoTramite",
        "usuarioAprobador",
        "fichaInspeccion"
    })
    @Query("SELECT va FROM VehiculoApto va WHERE va.tramite.idTramite = :tramiteId ORDER BY va.numeroInstancia ASC, va.fechaCreacion DESC")
    List<VehiculoApto> findByTramiteIdOrderByNumeroInstanciaAscFechaCreacionDesc(@Param("tramiteId") Long tramiteId);

    @EntityGraph(attributePaths = {
        "vehiculo",
        "vehiculo.empresa",
        "tramite",
        "tramite.tipoTramite",
        "usuarioAprobador"
    })
    @Query("SELECT va FROM VehiculoApto va WHERE va.tramite.idTramite = :tramiteId AND va.vehiculo.idVehiculo = :vehiculoId ORDER BY va.numeroInstancia DESC")
    Optional<VehiculoApto> findTopByTramiteIdAndVehiculoIdOrderByNumeroInstanciaDesc(@Param("tramiteId") Long tramiteId, @Param("vehiculoId") Long vehiculoId);

    @EntityGraph(attributePaths = {
        "vehiculo",
        "vehiculo.empresa",
        "tramite",
        "tramite.tipoTramite",
        "usuarioAprobador",
        "fichaInspeccion"
    })
    @Query("SELECT va FROM VehiculoApto va " +
           "WHERE va.tramite.idTramite = :tramiteId " +
           "AND va.estadoDocumental = :estado")
    List<VehiculoApto> findByTramiteIdAndEstadoDocumental(@Param("tramiteId") Long tramiteId, @Param("estado") EstadoDocumental estado);

    @EntityGraph(attributePaths = {
        "vehiculo",
        "vehiculo.empresa",
        "tramite",
        "tramite.expediente"
    })
    @Query("SELECT va FROM VehiculoApto va " +
           "JOIN va.tramite t " +
           "WHERE t.estado = 'APROBADO' " +
           "AND va.estadoDocumental = 'APTO' " +
           "AND NOT EXISTS (" +
           "    SELECT fi FROM FichaInspeccion fi " +
           "    WHERE fi.vehiculoApto = va AND fi.estado = true" +
           ")")
    List<VehiculoApto> findAptosDisponiblesParaInspeccion();

    @Query("SELECT COUNT(va) FROM VehiculoApto va WHERE va.tramite.idTramite = :tramiteId")
    Long countByTramiteId(@Param("tramiteId") Long tramiteId);

    @Query("SELECT COUNT(va) FROM VehiculoApto va WHERE va.tramite.idTramite = :tramiteId AND va.estadoDocumental = :estado")
    Long countByTramiteIdAndEstadoDocumental(@Param("tramiteId") Long tramiteId, @Param("estado") EstadoDocumental estado);

    @EntityGraph(attributePaths = {
        "vehiculo",
        "vehiculo.empresa",
        "tramite",
        "tramite.tipoTramite",
        "usuarioAprobador"
    })
    @Query("SELECT va FROM VehiculoApto va WHERE va.vehiculo.idVehiculo = :vehiculoId ORDER BY va.numeroInstancia DESC")
    List<VehiculoApto> findByVehiculoIdOrderByInstanciaDesc(@Param("vehiculoId") Long vehiculoId);

    @Query("SELECT MAX(va.numeroInstancia) FROM VehiculoApto va WHERE va.tramite.idTramite = :tramiteId AND va.vehiculo.idVehiculo = :vehiculoId")
    Integer findMaxInstanciaByTramiteIdAndVehiculoId(@Param("tramiteId") Long tramiteId, @Param("vehiculoId") Long vehiculoId);
}
