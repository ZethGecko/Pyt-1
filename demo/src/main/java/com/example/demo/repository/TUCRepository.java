package com.example.demo.repository;

import com.example.demo.model.TUC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TUCRepository extends JpaRepository<TUC, Long> {

    @Query("SELECT t FROM TUC t JOIN t.vehiculos v WHERE v.idVehiculo = :vehiculoId AND t.fechaVencimiento > :fecha")
    List<TUC> findByVehiculosIdVehiculoAndFechaVencimientoAfter(@Param("vehiculoId") Long vehiculoId, @Param("fecha") LocalDateTime fecha);

    @Query("SELECT t FROM TUC t WHERE t.empresa.idEmpresa = :empresaId AND t.fechaVencimiento > :fecha")
    List<TUC> findByEmpresaIdEmpresaAndFechaVencimientoAfter(@Param("empresaId") Long empresaId, @Param("fecha") LocalDateTime fecha);

    @Query("SELECT t FROM TUC t WHERE t.fechaVencimiento > :fecha ORDER BY t.fechaEmision DESC")
    List<TUC> findByFechaVencimientoAfterOrderByFechaEmisionDesc(@Param("fecha") LocalDateTime fecha);
}
