package com.example.demo.repository;

import com.example.demo.model.EvaluacionParametro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluacionParametroRepository extends JpaRepository<EvaluacionParametro, Long> {
}
