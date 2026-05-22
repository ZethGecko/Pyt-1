package com.example.demo.repository;

import com.example.demo.model.FichaInspeccion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FichaInspeccionRepository extends JpaRepository<FichaInspeccion, Long> {

    @EntityGraph(attributePaths = {
        "vehiculoEntity",
        "vehiculoEntity.empresa",
        "vehiculoApto",
        "vehiculoApto.vehiculo",
        "vehiculoApto.tramite",
        "vehiculoApto.tramite.empresa",
        "inspeccionEntity",
        "usuarioInspectorEntity",
        "formatoInspeccion",
        "formatoInspeccion.campos"
    })
    @Query("SELECT f FROM FichaInspeccion f WHERE f.idFichaInspeccion = :id")
    Optional<FichaInspeccion> findByIdWithAssociations(@Param("id") Long id);

    @EntityGraph(attributePaths = {
        "vehiculoEntity",
        "vehiculoEntity.empresa",
        "inspeccionEntity",
        "usuarioInspectorEntity"
    })
    List<FichaInspeccion> findByInspeccion(Long inspeccionId);

    @EntityGraph(attributePaths = {
        "vehiculoEntity",
        "vehiculoEntity.empresa",
        "vehiculoApto",
        "vehiculoApto.vehiculo",
        "vehiculoApto.tramite",
        "vehiculoApto.tramite.empresa"
    })
    @Query("SELECT f FROM FichaInspeccion f JOIN f.vehiculoApto va WHERE va.tramite.idTramite = :tramiteId")
    List<FichaInspeccion> findByVehiculoApto_Tramite_IdTramite(@Param("tramiteId") Long tramiteId);

    @Query("SELECT f FROM FichaInspeccion f WHERE f.inspeccionEntity.idInspeccion = :inspeccionId AND f.vehiculoEntity.idVehiculo = :vehiculoId")
    Optional<FichaInspeccion> findByInspeccionAndVehiculo(@Param("inspeccionId") Long inspeccionId,
                                                           @Param("vehiculoId") Long vehiculoId);

    @Query("SELECT f FROM FichaInspeccion f " +
           "WHERE f.inspeccionEntity.idInspeccion = :inspeccionId AND f.instanciaTramiteId = :instanciaTramiteId")
    Optional<FichaInspeccion> findByInstanciaTramiteIdAndInspeccion(@Param("inspeccionId") Long inspeccionId,
                                                                     @Param("instanciaTramiteId") Long instanciaTramiteId);

    @Query("SELECT f FROM FichaInspeccion f " +
           "JOIN f.inspeccionEntity i " +
           "JOIN i.tramite t " +
           "WHERE t.empresa.idEmpresa = :empresaId " +
           "AND f.resultado = 'APROBADO' " +
           "AND f.estado = true " +
           "ORDER BY f.fechaCreacion DESC")
    List<FichaInspeccion> findApprovedByEmpresa(@Param("empresaId") Long empresaId);

    @Query("SELECT f FROM FichaInspeccion f " +
           "WHERE f.vehiculo = :vehiculoId " +
           "AND f.resultado = 'APROBADO' " +
           "AND f.estado = true " +
           "ORDER BY f.fechaCreacion DESC")
    List<FichaInspeccion> findApprovedByVehiculoOrderByFechaCreacionDesc(@Param("vehiculoId") Long vehiculoId);
}
