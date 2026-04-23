package com.example.demo.repository;

import com.example.demo.model.ElementoCanvas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ElementoCanvasRepository extends JpaRepository<ElementoCanvas, Long> {
}
