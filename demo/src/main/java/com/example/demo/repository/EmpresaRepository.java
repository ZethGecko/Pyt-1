package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {
    
    @Query("SELECT e FROM Empresa e WHERE e.activo = true")
    List<Empresa> findByActivoTrue();

    @Query("SELECT e FROM Empresa e LEFT JOIN FETCH e.gerente LEFT JOIN FETCH e.subtipoTransporte ORDER BY e.nombre")
    List<Empresa> findAllWithDetails();

    @Query("SELECT e FROM Empresa e LEFT JOIN FETCH e.gerente LEFT JOIN FETCH e.subtipoTransporte WHERE e.idEmpresa = :id")
    Optional<Empresa> findByIdWithDetails(@Param("id") Long id);

    @Query("""
            SELECT e FROM Empresa e
            LEFT JOIN FETCH e.gerente
            LEFT JOIN FETCH e.subtipoTransporte
            WHERE LOWER(e.nombre) LIKE LOWER(CONCAT('%', :termino, '%'))
               OR LOWER(e.ruc) LIKE LOWER(CONCAT('%', :termino, '%'))
               OR LOWER(e.codigo) LIKE LOWER(CONCAT('%', :termino, '%'))
            ORDER BY e.nombre
            """)
    List<Empresa> findByTermino(@Param("termino") String termino);

    long countByActivoTrue();

    @Query("SELECT v.empresa.idEmpresa, COUNT(DISTINCT v.idVehiculo) FROM Vehiculo v " +
            "LEFT JOIN v.inspecciones i " +
            "LEFT JOIN v.tuc tuc " +
            "WHERE COALESCE(i.resultadoGeneral, '') = 'APROBADO' " +
            "AND (tuc.fechaVencimiento IS NULL OR tuc.fechaVencimiento > CURRENT_TIMESTAMP) " +
            "GROUP BY v.empresa.idEmpresa")
    List<Object[]> contarVehiculosHabilitadosPorEmpresa(LocalDateTime now);
}
