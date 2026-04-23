package com.example.demo.repository;

import com.example.demo.model.SubtipoTransporte;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubtipoTransporteRepository extends JpaRepository<SubtipoTransporte, Long> { 
    List<SubtipoTransporte> findByTipoTransporte_IdTipoTransporte(Long tipoId);
}
