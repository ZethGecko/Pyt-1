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
        "vehiculoApto.tramite.expediente",
        "vehiculoApto.tramite.empresa",
        "inspeccionEntity",
        "usuarioInspectorEntity",
        "parametros"
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
        "vehiculoApto.tramite",
        "vehiculoApto.tramite.expediente",
        "vehiculoApto.tramite.empresa",
        "parametros"
    })
    @Query("SELECT f FROM FichaInspeccion f JOIN f.vehiculoApto va WHERE va.tramite.idTramite = :tramiteId")
    List<FichaInspeccion> findByVehiculoApto_Tramite_IdTramite(@Param("tramiteId") Long tramiteId);
}
