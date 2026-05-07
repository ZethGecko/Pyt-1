package com.example.demo.repository;

import com.example.demo.model.ImagenSitio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ImagenSitioRepository extends JpaRepository<ImagenSitio, Long> {
    Optional<ImagenSitio> findByUbicacion(ImagenSitio.UbicacionImagen ubicacion);
    boolean existsByUbicacion(ImagenSitio.UbicacionImagen ubicacion);
}
