package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.model.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {
    
    @Query("SELECT e FROM Empresa e WHERE e.activo = true")
    List<Empresa> findByActivoTrue();
}
