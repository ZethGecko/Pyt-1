package com.example.demo.repository;

import com.example.demo.model.InspeccionInstancia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InspeccionInstanciaRepository extends JpaRepository<InspeccionInstancia, Long> {
    List<InspeccionInstancia> findByInspeccion_IdInspeccion(Long inspeccionId);
    List<InspeccionInstancia> findByInstanciaTramite_IdInstancia(Long instanciaId);
    void deleteByInspeccion_IdInspeccionAndInstanciaTramite_IdInstancia(Long inspeccionId, Long instanciaId);
}
