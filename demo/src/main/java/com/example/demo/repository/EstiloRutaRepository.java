package com.example.demo.repository;

import com.example.demo.model.EstiloRuta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstiloRutaRepository extends JpaRepository<EstiloRuta, Long> {
}
