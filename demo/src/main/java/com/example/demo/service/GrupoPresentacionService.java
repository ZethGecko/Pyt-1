package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.GrupoPresentacion;
import com.example.demo.model.Users;
import com.example.demo.repository.GrupoPresentacionRepository;
import com.example.demo.repository.InscripcionExamenRepository;
import com.example.demo.repository.UsersRepository;

@Service
public class GrupoPresentacionService {

    @Autowired
    private GrupoPresentacionRepository repo;

    @Autowired
    private UsersRepository usersRepository;
    
    @Autowired
    private InscripcionExamenRepository inscripcionRepo;

    public List<GrupoPresentacion> listarTodos() {
        return repo.findAll();
    }

    public List<GrupoPresentacion> listarPorEstado(GrupoPresentacion.EstadoGrupo estado) {
        return repo.findByEstado(estado);
    }

    public List<GrupoPresentacion> listarProximosProgramados() {
        return repo.findProximosGruposProgramados();
    }

    public List<GrupoPresentacion> listarPorRequisito(Long requisitoId) {
        return repo.findByRequisitoExamen_Id(requisitoId);
    }

    public List<GrupoPresentacion> listarPorFechas(LocalDate inicio, LocalDate fin) {
        return repo.findByFechaBetween(inicio, fin);
    }

    public List<GrupoPresentacion> listarActivosPorConfiguracion(Long configId) {
        return repo.findActiveByConfigId(configId);
    }

    public Optional<GrupoPresentacion> buscarPorId(Long id) {
        return repo.findById(id);
    }

    @Transactional
    public GrupoPresentacion crear(GrupoPresentacion grupo) {
        // Validate required fields
        if (grupo.getRequisitoExamen() == null || grupo.getRequisitoExamen().getId() == null) {
            throw new IllegalArgumentException("El requisito de examen es obligatorio");
        }
        if (grupo.getFecha() == null) {
            throw new IllegalArgumentException("La fecha es obligatoria");
        }
        if (grupo.getCodigo() == null || grupo.getCodigo().isBlank()) {
            throw new IllegalArgumentException("El código del grupo es obligatorio");
        }
        if (grupo.getCapacidad() == null || grupo.getCapacidad() <= 0) {
            throw new IllegalArgumentException("La capacidad debe ser mayor a 0");
        }

        // Set usuarioCreador from authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            Users usuarioCreador = usersRepository.findByUsername(authentication.getName());
            if (usuarioCreador != null) {
                grupo.setUsuarioCreador(usuarioCreador);
            }
        }

        // Ensure cupos disponibles equals capacidad initially
        if (grupo.getCuposDisponibles() == null) {
            grupo.setCuposDisponibles(grupo.getCapacidad());
        }
        // Ensure estado is PROGRAMADO if null
        if (grupo.getEstado() == null) {
            grupo.setEstado(GrupoPresentacion.EstadoGrupo.PROGRAMADO);
        }
        // Ensure activo is true if null
        if (grupo.getActivo() == null) {
            grupo.setActivo(true);
        }
        // Validate pre-persist
        grupo.validarGrupo();
        return repo.save(grupo);
    }

    @Transactional
    public GrupoPresentacion actualizar(Long id, GrupoPresentacion datos) {
        return repo.findById(id).map(grupo -> {
            if (datos.getCodigo() != null) grupo.setCodigo(datos.getCodigo());
            if (datos.getFecha() != null) grupo.setFecha(datos.getFecha());
            if (datos.getHoraInicio() != null) grupo.setHoraInicio(datos.getHoraInicio());
            if (datos.getHoraFin() != null) grupo.setHoraFin(datos.getHoraFin());
            if (datos.getCapacidad() != null) {
                grupo.setCapacidad(datos.getCapacidad());
                // Adjust cupos if needed
                if (grupo.getCuposDisponibles() > datos.getCapacidad()) {
                    grupo.setCuposDisponibles(datos.getCapacidad());
                }
            }
            if (datos.getObservaciones() != null) grupo.setObservaciones(datos.getObservaciones());
            if (datos.getActivo() != null) grupo.setActivo(datos.getActivo());
            if (datos.getConfiguracionExamen() != null) grupo.setConfiguracionExamen(datos.getConfiguracionExamen());
            // Validate before save
            grupo.validarGrupo();
            return repo.save(grupo);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    @Transactional
    public void reservarCupo(Long grupoId) {
        GrupoPresentacion grupo = repo.findById(grupoId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
        grupo.reservarCupo();
        repo.save(grupo);
    }

    @Transactional
    public void liberarCupo(Long grupoId) {
        GrupoPresentacion grupo = repo.findById(grupoId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
        grupo.liberarCupo();
        repo.save(grupo);
    }

    @Transactional
    public void iniciarGrupo(Long grupoId) {
        GrupoPresentacion grupo = repo.findById(grupoId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
        grupo.iniciarGrupo();
        repo.save(grupo);
    }

    @Transactional
    public void completarGrupo(Long grupoId) {
        GrupoPresentacion grupo = repo.findById(grupoId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
        grupo.completarGrupo();
        repo.save(grupo);
    }

    @Transactional
    public void cancelarGrupo(Long grupoId, String motivo) {
        GrupoPresentacion grupo = repo.findById(grupoId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
        grupo.cancelarGrupo(motivo);
        repo.save(grupo);
    }

    public long countInscripcionesActivas(Long grupoId) {
        return inscripcionRepo.countByGrupoPresentacionIdAndActivoTrue(grupoId);
    }

    public int getCuposDisponibles(Long grupoId) {
        return repo.findById(grupoId)
                .map(GrupoPresentacion::getCuposDisponibles)
                .orElse(0);
    }

    public double getPorcentajeOcupacion(Long grupoId) {
        return repo.findById(grupoId)
                .map(GrupoPresentacion::getPorcentajeOcupacion)
                .orElse(0.0);
    }
}
