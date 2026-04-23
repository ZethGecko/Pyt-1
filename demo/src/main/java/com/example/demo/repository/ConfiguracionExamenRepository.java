package com.example.demo.repository;

import com.example.demo.model.ConfiguracionExamen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionExamenRepository extends JpaRepository<ConfiguracionExamen, Long> {
    ConfiguracionExamen findByTipoExamen(String tipoExamen);
    java.util.List<ConfiguracionExamen> findByActivoTrue();
    java.util.List<ConfiguracionExamen> findByRequisitoTUPAC_Id(Long requisitoId);
}
