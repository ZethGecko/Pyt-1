package com.example.demo.repository;

import com.example.demo.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    Optional<Vehiculo> findByPlaca(String placa);

    Optional<Vehiculo> findByNumeroMotor(String numeroMotor);

    Optional<Vehiculo> findByNumeroChasis(String numeroChasis);

    List<Vehiculo> findByEstado(String estado);

    @EntityGraph(attributePaths = {
        "empresa",
        "subtipoTransporte",
        "subtipoTransporte.tipoTransporte",
        "subtipoTransporte.tipoTransporte.categoriaTransporte",
        "gerenteResponsable",
        "tuc",
        "inspecciones"
    })
    List<Vehiculo> findByEmpresaIdEmpresa(Long empresaId);

    @EntityGraph(attributePaths = {
        "empresa",
        "subtipoTransporte",
        "subtipoTransporte.tipoTransporte",
        "subtipoTransporte.tipoTransporte.categoriaTransporte",
        "gerenteResponsable",
        "tuc",
        "inspecciones"
    })
    List<Vehiculo> findBySubtipoTransporteIdSubtipoTransporte(Long subtipoId);

    @EntityGraph(attributePaths = {
        "empresa",
        "subtipoTransporte",
        "subtipoTransporte.tipoTransporte",
        "subtipoTransporte.tipoTransporte.categoriaTransporte",
        "gerenteResponsable",
        "tuc",
        "inspecciones"
    })
    List<Vehiculo> findByGerenteResponsableIdGerente(Long gerenteId);

    @Query("SELECT v FROM Vehiculo v WHERE v.tuc.idTuc = :tucId")
    List<Vehiculo> findByTucId(@Param("tucId") Long tucId);

    @Query("SELECT v FROM Vehiculo v WHERE v.estado = 'ACTIVO'")
    List<Vehiculo> findAllActivos();

    @Query("SELECT v FROM Vehiculo v WHERE LOWER(v.placa) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(v.marca) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(v.modelo) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Vehiculo> buscarPorTermino(@Param("termino") String termino);

    @Query("SELECT COUNT(v) FROM Vehiculo v WHERE v.empresa.id = :empresaId")
    Long countByEmpresaId(@Param("empresaId") Long empresaId);

     @Query("SELECT v FROM Vehiculo v " +
            "LEFT JOIN FETCH v.empresa " +
            "LEFT JOIN FETCH v.subtipoTransporte st " +
            "LEFT JOIN FETCH st.tipoTransporte " +
            "LEFT JOIN FETCH st.tipoTransporte.categoriaTransporte " +
            "LEFT JOIN FETCH v.gerenteResponsable " +
            "LEFT JOIN FETCH v.tuc " +
            "LEFT JOIN FETCH v.inspecciones " +
            "WHERE v.idVehiculo = :id")
     Optional<Vehiculo> findByIdWithAssociations(@Param("id") Long id);

     @EntityGraph(attributePaths = {
         "empresa",
         "subtipoTransporte",
         "subtipoTransporte.tipoTransporte",
         "subtipoTransporte.tipoTransporte.categoriaTransporte",
         "gerenteResponsable",
         "tuc",
         "inspecciones"
     })
     @Query("SELECT v FROM Vehiculo v")
     List<Vehiculo> findAllWithDetails();
}