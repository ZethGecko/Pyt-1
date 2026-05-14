package com.example.demo.repository;

import com.example.demo.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    Users findByUsername(String username);
    
    @Query("SELECT u FROM Users u WHERE u.departamento.idDepartamento = ?1")
    List<Users> findByDepartamentoId(Long departamentoId);
}
