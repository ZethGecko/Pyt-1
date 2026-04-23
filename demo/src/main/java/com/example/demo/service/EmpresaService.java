package com.example.demo.service;

import com.example.demo.model.Empresa;
import com.example.demo.repository.EmpresaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    public Empresa guardar(Empresa empresa) {
        // Set default values for required fields
        if (empresa.getInicioVigencia() == null) {
            empresa.setInicioVigencia(LocalDate.now());
        }
        if (empresa.getFechaRegistro() == null) {
            empresa.setFechaRegistro(LocalDateTime.now());
        }
        if (empresa.getFechaActualizacion() == null) {
            empresa.setFechaActualizacion(LocalDateTime.now());
        }
        if (empresa.getActivo() == null) {
            empresa.setActivo(true);
        }
        return empresaRepository.save(empresa);
    }

    public Empresa buscarPorId(Integer id) {
        return empresaRepository.findById(id).orElse(null);
    }

    public void eliminar(Integer id) {
        empresaRepository.deleteById(id);
    }
}
