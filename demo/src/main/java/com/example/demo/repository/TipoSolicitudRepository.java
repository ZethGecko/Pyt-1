package com.example.demo.repository;

import com.example.demo.model.TipoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoSolicitudRepository extends JpaRepository<TipoSolicitud, Integer> {
}
