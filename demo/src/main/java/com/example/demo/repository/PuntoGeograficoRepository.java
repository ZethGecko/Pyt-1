package com.example.demo.repository;

import com.example.demo.model.PuntoGeografico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PuntoGeograficoRepository extends JpaRepository<PuntoGeografico, Long> {
}
