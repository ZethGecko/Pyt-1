package com.example.demo.repository;

import com.example.demo.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {
    
    @Query("SELECT e FROM Empresa e WHERE e.activo = true")
    List<Empresa> findByActivoTrue();
}
