package com.example.demo.repository;

import com.example.demo.model.TUPAC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TUPACRepository extends JpaRepository<TUPAC, Long> {
    
    @Query("SELECT t FROM TUPAC t LEFT JOIN FETCH t.requisitos WHERE t.idTupac = :id")
    TUPAC findByIdWithRequisitos(@Param("id") Long id);
}
