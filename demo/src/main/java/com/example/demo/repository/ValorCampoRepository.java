package com.example.demo.repository;

import com.example.demo.model.ValorCampo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ValorCampoRepository extends JpaRepository<ValorCampo, Long> {

    List<ValorCampo> findByFichaInspeccion_IdFichaInspeccion(Long fichaId);

    void deleteByFichaInspeccion_IdFichaInspeccion(Long fichaId);

    ValorCampo findByFichaInspeccion_IdFichaInspeccionAndCampoFormato_IdCampoFormato(Long fichaId, Long campoId);

    // Also find by campo id only? Not needed.
}
