package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.demo.dto.EmpresaProjectionDTO;
import com.example.demo.model.Empresa;
import com.example.demo.repository.EmpresaRepository;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    public List<Empresa> listarTodas() {
        List<Empresa> empresas = empresaRepository.findAllWithDetails();
        Map<Long, Integer> unidadesPorEmpresa = new HashMap<>();
        for (Object[] fila : empresaRepository.contarVehiculosHabilitadosPorEmpresa(LocalDateTime.now())) {
            Long empresaId = ((Number) fila[0]).longValue();
            Long unidades = (Long) fila[1];
            unidadesPorEmpresa.put(empresaId, unidades != null ? unidades.intValue() : 0);
        }
        for (Empresa empresa : empresas) {
            sincronizarEstadoPorVigencia(empresa);
            empresa.setUnidadesHabilitadas(unidadesPorEmpresa.getOrDefault(empresa.getIdEmpresa(), 0));
        }
        return empresas;
    }

    public Empresa guardar(Empresa empresa) {
        boolean nuevo = empresa.getIdEmpresa() == null || empresaRepository.existsById(empresa.getIdEmpresa().intValue()) == false;
        if (nuevo) {
            empresa.setActivo(true);
            if (empresa.getEstadoOperativo() == null
                    || empresa.getEstadoOperativo().isBlank()
                    || "en_proceso".equalsIgnoreCase(empresa.getEstadoOperativo())) {
                empresa.setEstadoOperativo("ACTIVO");
            }
        }

        if (empresa.getInicioVigencia() == null) {
            empresa.setInicioVigencia(LocalDate.now());
        }
        if (empresa.getFechaRegistro() == null) {
            empresa.setFechaRegistro(LocalDateTime.now());
        }
        empresa.setFechaActualizacion(LocalDateTime.now());

        if (!nuevo) {
            sincronizarEstadoPorVigencia(empresa);
        }

        return empresaRepository.save(empresa);
    }

    public Empresa buscarPorId(Integer id) {
        Empresa empresa = empresaRepository.findById(id).orElse(null);
        if (empresa != null) {
            sincronizarEstadoPorVigencia(empresa);
        }
        return empresa;
    }

    public EmpresaProjectionDTO obtenerProjection(Integer id) {
        Empresa empresa = empresaRepository.findByIdWithDetails(Long.valueOf(id)).orElse(null);
        if (empresa == null) {
            return null;
        }
        sincronizarEstadoPorVigencia(empresa);
        return toProjection(empresa);
    }

    public List<EmpresaProjectionDTO> buscarProyecciones(String termino) {
        String filtro = (termino == null || termino.isBlank()) ? "" : termino.trim();
        return empresaRepository.findByTermino(filtro).stream()
                .map(this::toProjection)
                .toList();
    }

    public boolean puedeEliminar(Integer id) {
        return empresaRepository.existsById(id);
    }

    public Empresa activar(Integer id) {
        Empresa empresa = empresaRepository.findById(id).orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        empresa.setActivo(true);
        empresa.setFechaActualizacion(LocalDateTime.now());
        return empresaRepository.save(empresa);
    }

    public Empresa desactivar(Integer id) {
        Empresa empresa = empresaRepository.findById(id).orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        empresa.setActivo(false);
        empresa.setFechaActualizacion(LocalDateTime.now());
        return empresaRepository.save(empresa);
    }

    public void eliminar(Integer id) {
        empresaRepository.deleteById(id);
    }

    @Scheduled(fixedDelay = 3_600_000)
    public void desactivarEmpresasVencidas() {
        for (Empresa empresa : empresaRepository.findAll()) {
            if (sincronizarEstadoPorVigencia(empresa)) {
                empresa.setFechaActualizacion(LocalDateTime.now());
                empresaRepository.save(empresa);
            }
        }
    }

    public boolean sincronizarEstadoPorVigencia(Empresa empresa) {
        if (empresa.getActivo() == null) {
            empresa.setActivo(true);
        }
        if (empresa.getFinVigencia() != null && empresa.getFinVigencia().isBefore(LocalDate.now())) {
            if (Boolean.TRUE.equals(empresa.getActivo())) {
                empresa.setActivo(false);
                return true;
            }
            return false;
        }
        return false;
    }

    private EmpresaProjectionDTO toProjection(Empresa empresa) {
        EmpresaProjectionDTO dto = new EmpresaProjectionDTO();
        dto.setId(empresa.getIdEmpresa());
        dto.setNombre(empresa.getNombre());
        dto.setRuc(empresa.getRuc());
        dto.setCodigo(empresa.getCodigo());
        dto.setNumeroDeResolucion(empresa.getNumeroDeResolucion());
        dto.setContactoTelefono(empresa.getContactoTelefono());
        dto.setEmail(empresa.getEmail());
        dto.setDireccionLegal(empresa.getDireccionLegal());
        dto.setEstadoOperativo(empresa.getEstadoOperativo());
        dto.setTipoTrayectoria(empresa.getTipoTrayectoria());
        dto.setObservaciones(empresa.getObservaciones());
        dto.setInicioVigencia(empresa.getInicioVigencia());
        dto.setFinVigencia(empresa.getFinVigencia());
        dto.setUnidadesVehiculares(empresa.getUnidadesVehiculares());
        dto.setUnidadesHabilitadas(empresa.getUnidadesHabilitadas());
        dto.setFechaRegistro(empresa.getFechaRegistro());
        dto.setFechaActualizacion(empresa.getFechaActualizacion());
        dto.setActivo(empresa.getActivo());
        if (empresa.getGerente() != null) {
            EmpresaProjectionDTO.GerenteDTO gerenteDTO = new EmpresaProjectionDTO.GerenteDTO();
            gerenteDTO.setId(empresa.getGerente().getIdGerente());
            gerenteDTO.setNombre(empresa.getGerente().getNombre());
            gerenteDTO.setDni(empresa.getGerente().getDni());
            gerenteDTO.setTelefono(empresa.getGerente().getTelefono());
            gerenteDTO.setWhatsapp(empresa.getGerente().getWhatsapp());
            gerenteDTO.setPartidaElectronica(empresa.getGerente().getPartidaElectronica());
            dto.setGerente(gerenteDTO);
            dto.setGerenteId(empresa.getGerente().getIdGerente());
            dto.setGerenteNombre(empresa.getGerente().getNombre());
        }
        if (empresa.getSubtipoTransporte() != null) {
            EmpresaProjectionDTO.SubtipoTransporteDTO subtipoDTO = new EmpresaProjectionDTO.SubtipoTransporteDTO();
            subtipoDTO.setId(empresa.getSubtipoTransporte().getIdSubtipoTransporte());
            subtipoDTO.setNombre(empresa.getSubtipoTransporte().getNombre());
            dto.setSubtipoTransporte(subtipoDTO);
            dto.setSubtipoTransporteId(empresa.getSubtipoTransporte().getIdSubtipoTransporte());
            dto.setSubtipoTransporteNombre(empresa.getSubtipoTransporte().getNombre());
        }
        return dto;
    }
}
