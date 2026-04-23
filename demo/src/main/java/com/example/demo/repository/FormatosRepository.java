package com.example.demo.repository;

import com.example.demo.model.Formatos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormatosRepository extends JpaRepository<Formatos, Long> {
}
