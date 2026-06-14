package com.example.demo.repository;

import com.example.demo.model.TUC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TUCRepository extends JpaRepository<TUC, Long> {

    @Query("SELECT t FROM TUC t JOIN t.vehiculos v WHERE v.idVehiculo = :vehiculoId AND t.fechaVencimiento > :fecha AND t.estado = 'ACTIVO' ORDER BY t.fechaEmision DESC")
    List<TUC> findTopByVehiculosIdVehiculoAndFechaVencimientoAfterOrderByFechaEmisionDesc(@Param("vehiculoId") Long vehiculoId, @Param("fecha") LocalDateTime fecha);

    @Query("SELECT DISTINCT t FROM TUC t JOIN t.vehiculos v WHERE v.idVehiculo IN :vehiculoIds AND t.fechaVencimiento > :fecha AND t.estado = 'ACTIVO' ORDER BY t.fechaEmision DESC")
    List<TUC> findActiveByVehiculoIds(@Param("vehiculoIds") List<Long> vehiculoIds, @Param("fecha") LocalDateTime fecha);

    @Query("SELECT t FROM TUC t WHERE t.empresa.idEmpresa = :empresaId AND t.fechaVencimiento > :fecha")
    List<TUC> findByEmpresaIdEmpresaAndFechaVencimientoAfter(@Param("empresaId") Long empresaId, @Param("fecha") LocalDateTime fecha);

    @Query("SELECT t FROM TUC t WHERE t.estado = 'ACTIVO' AND t.fechaVencimiento <= :fecha ORDER BY t.fechaVencimiento ASC")
    List<TUC> findActivosVencidos(@Param("fecha") LocalDateTime fecha);

    @Query("SELECT COUNT(t) FROM TUC t WHERE t.estado = 'ACTIVO' AND t.fechaVencimiento <= :fecha")
    long countActivosVencidos(@Param("fecha") LocalDateTime fecha);

    @Modifying
    @Query("""
        UPDATE TUC t
        SET t.estado = 'VENCIDO',
            t.fechaSuspension = :fecha,
            t.fechaActualizacion = :fecha,
            t.observaciones = CASE
                WHEN t.observaciones IS NULL THEN :observacion
                WHEN t.observaciones LIKE CONCAT('%', :observacion, '%') THEN t.observaciones
                ELSE CONCAT(t.observaciones, ' | ', :observacion)
            END
        WHERE t.estado = 'ACTIVO' AND t.fechaVencimiento <= :fecha
    """)
    int marcarTucsVencidos(@Param("fecha") LocalDateTime fecha, @Param("observacion") String observacion);

    @Modifying
    @Query("""
        UPDATE Vehiculo v
        SET v.estado = 'DESHABILITADO',
            v.fechaVencimientoTUC = :fechaVencimiento,
            v.fechaActualizacion = :fecha,
            v.observaciones = CASE
                WHEN v.observaciones IS NULL THEN :observacion
                WHEN v.observaciones LIKE CONCAT('%', :observacion, '%') THEN v.observaciones
                ELSE CONCAT(v.observaciones, ' | ', :observacion)
            END
        WHERE v.tuc IN (
            SELECT t FROM TUC t
            WHERE t.estado = 'VENCIDO'
              AND t.fechaSuspension = :fecha
        )
    """)
    int deshabilitarVehiculosDeTucsVencidos(@Param("fecha") LocalDateTime fecha, @Param("fechaVencimiento") LocalDateTime fechaVencimiento, @Param("observacion") String observacion);

    @Query("SELECT COUNT(DISTINCT v.idVehiculo) FROM TUC t JOIN t.vehiculos v WHERE t.empresa.idEmpresa = :empresaId AND t.estado = 'ACTIVO' AND t.fechaVencimiento > :fecha")
    Long countVehiculosHabilitadosPorEmpresa(@Param("empresaId") Long empresaId, @Param("fecha") LocalDateTime fecha);

    @Query("SELECT t FROM TUC t WHERE t.fechaVencimiento > :fecha ORDER BY t.fechaEmision DESC")
    List<TUC> findByFechaVencimientoAfterOrderByFechaEmisionDesc(@Param("fecha") LocalDateTime fecha);
}
