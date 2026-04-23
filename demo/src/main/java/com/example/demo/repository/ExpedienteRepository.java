package com.example.demo.repository;

import com.example.demo.model.Expediente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpedienteRepository extends JpaRepository<Expediente, Integer> {
}
