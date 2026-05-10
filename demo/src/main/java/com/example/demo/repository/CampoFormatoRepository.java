package com.example.demo.repository;

import com.example.demo.model.CampoFormato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampoFormatoRepository extends JpaRepository<CampoFormato, Long> {

    List<CampoFormato> findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(Long formatoId);

    void deleteByFormatoInspeccion_IdFormatoInspeccion(Long formatoId);

    Optional<CampoFormato> findByFormatoInspeccion_IdFormatoInspeccionAndNombre(Long formatoId, String nombre);
}
