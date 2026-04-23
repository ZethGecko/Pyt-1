package com.example.demo.repository;

import com.example.demo.model.ObservacionSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObservacionSolicitudRepository extends JpaRepository<ObservacionSolicitud, Long> {
}
