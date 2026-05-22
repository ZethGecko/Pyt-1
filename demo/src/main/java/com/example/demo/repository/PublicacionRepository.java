package com.example.demo.repository;

import java.util.List;
import com.example.demo.model.Publicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {

    @Query("SELECT p FROM Publicacion p WHERE LOWER(p.estado) = LOWER(:estado) ORDER BY p.fechaPublicacion DESC")
    List<Publicacion> findByEstadoIgnoreCase(@Param("estado") String estado);
}
