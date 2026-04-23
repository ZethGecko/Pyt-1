package com.example.demo.repository;

import com.example.demo.model.Observaciones;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObservacionesRepository extends JpaRepository<Observaciones, Integer> {
}
