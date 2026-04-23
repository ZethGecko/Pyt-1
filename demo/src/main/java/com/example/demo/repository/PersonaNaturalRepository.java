package com.example.demo.repository;

import com.example.demo.model.PersonaNatural;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonaNaturalRepository extends JpaRepository<PersonaNatural, Long> {
}
