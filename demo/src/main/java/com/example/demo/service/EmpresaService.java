package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.demo.dto.EmpresaProjectionDTO;
import com.example.demo.model.Empresa;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.GerenteRepository;
import com.example.demo.repository.SubtipoTransporteRepository;
import com.example.demo.repository.TUCRepository;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final GerenteRepository gerenteRepository;
    private final TUCRepository tucRepository;
    private final SubtipoTransporteRepository subtipoTransporteRepository;

    public EmpresaService(EmpresaRepository empresaRepository,
                          GerenteRepository gerenteRepository,
                          TUCRepository tucRepository,
                          SubtipoTransporteRepository subtipoTransporteRepository) {
        this.empresaRepository = empresaRepository;
        this.gerenteRepository = gerenteRepository;
        this.tucRepository = tucRepository;
        this.subtipoTransporteRepository = subtipoTransporteRepository;
    }

    public List<Empresa> listarTodas() {
        List<Empresa> empresas = empresaRepository.findAllWithDetails();
        LocalDateTime now = LocalDateTime.now();
        for (Empresa empresa : empresas) {
            sincronizarEstadoPorVigencia(empresa);
            empresa.setUnidadesHabilitadas(contarUnidadesHabilitadas(empresa.getIdEmpresa(), now));
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
        asignarGerente(empresa);
        asignarSubtipoTransporte(empresa);
        empresa.setUnidadesHabilitadas(contarUnidadesHabilitadas(empresa.getIdEmpresa(), LocalDateTime.now()));
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
            empresa.setUnidadesHabilitadas(contarUnidadesHabilitadas(empresa.getIdEmpresa(), LocalDateTime.now()));
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

    private Integer contarUnidadesHabilitadas(Long empresaId, LocalDateTime now) {
        if (empresaId == null) {
            return 0;
        }
        Long unidades = tucRepository.countVehiculosHabilitadosPorEmpresa(empresaId, now);
        return unidades != null ? unidades.intValue() : 0;
    }

    private void asignarGerente(Empresa empresa) {
        if (empresa.getGerenteId() != null) {
            empresa.setGerente(gerenteRepository.findById(Math.toIntExact(empresa.getGerenteId())).orElse(null));
        }
    }

    private void asignarSubtipoTransporte(Empresa empresa) {
        if (empresa.getSubtipoTransporteId() != null) {
            empresa.setSubtipoTransporte(subtipoTransporteRepository.findById(empresa.getSubtipoTransporteId()).orElse(null));
        }
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
        dto.setUnidadesHabilitadas(contarUnidadesHabilitadas(empresa.getIdEmpresa(), LocalDateTime.now()));
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
