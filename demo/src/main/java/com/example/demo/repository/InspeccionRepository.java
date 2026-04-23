package com.example.demo.repository;

import com.example.demo.model.Inspeccion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspeccionRepository extends JpaRepository<Inspeccion, Integer> {
}
