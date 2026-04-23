package com.example.demo.service;

import com.example.demo.dto.VehiculoResponseDTO;
import com.example.demo.model.Vehiculo;
import com.example.demo.repository.VehiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VehiculoService {

    @Autowired
    private VehiculoRepository repo;

    public List<Vehiculo> listarTodos() {
        return repo.findAll();
    }

    public Optional<Vehiculo> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public Optional<Vehiculo> buscarPorIdConAsociaciones(Long id) {
        return repo.findByIdWithAssociations(id);
    }

    public Optional<Vehiculo> buscarPorPlaca(String placa) {
        return repo.findByPlaca(placa);
    }

    public Optional<Vehiculo> buscarPorNumeroMotor(String numeroMotor) {
        return repo.findByNumeroMotor(numeroMotor);
    }

    public Optional<Vehiculo> buscarPorNumeroChasis(String numeroChasis) {
        return repo.findByNumeroChasis(numeroChasis);
    }

    public List<Vehiculo> listarActivos() {
        return repo.findAllActivos();
    }

    public List<Vehiculo> buscarPorTermino(String termino) {
        return repo.buscarPorTermino(termino);
    }

    public List<Vehiculo> listarPorEmpresa(Long empresaId) {
        return repo.findByEmpresaIdEmpresa(empresaId);
    }

    public List<Vehiculo> listarPorSubtipoTransporte(Long subtipoId) {
        return repo.findBySubtipoTransporteIdSubtipoTransporte(subtipoId);
    }

    public List<Vehiculo> listarPorGerente(Long gerenteId) {
        return repo.findByGerenteResponsableIdGerente(gerenteId);
    }

    public Vehiculo guardar(Vehiculo vehiculo) {
        if (vehiculo.getFechaRegistro() == null) {
            vehiculo.setFechaRegistro(LocalDateTime.now());
        }
        vehiculo.setFechaActualizacion(LocalDateTime.now());
        return repo.save(vehiculo);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public boolean existePorPlaca(String placa, Long idExcluir) {
        Optional<Vehiculo> vehiculo = repo.findByPlaca(placa);
        return vehiculo.isPresent() && !vehiculo.get().getIdVehiculo().equals(idExcluir);
    }

    public boolean existePorNumeroMotor(String numeroMotor, Long idExcluir) {
        Optional<Vehiculo> vehiculo = repo.findByNumeroMotor(numeroMotor);
        return vehiculo.isPresent() && !vehiculo.get().getIdVehiculo().equals(idExcluir);
    }

    public boolean existePorNumeroChasis(String numeroChasis, Long idExcluir) {
        Optional<Vehiculo> vehiculo = repo.findByNumeroChasis(numeroChasis);
        return vehiculo.isPresent() && !vehiculo.get().getIdVehiculo().equals(idExcluir);
    }

    public Long contarPorEmpresa(Long empresaId) {
        return repo.countByEmpresaId(empresaId);
    }

    // ========== ESTADOS ==========

    public List<Vehiculo> listarHabilitados() {
        return repo.findAll().stream()
                .filter(v -> "HABILITADO".equals(v.getEstado()))
                .collect(Collectors.toList());
    }

    public Vehiculo habilitar(Long id) {
        Vehiculo vehiculo = buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Vehiculo no encontrado"));
        vehiculo.setEstado("HABILITADO");
        vehiculo.setFechaActualizacion(LocalDateTime.now());
        return guardar(vehiculo);
    }

    public Vehiculo deshabilitar(Long id) {
        Vehiculo vehiculo = buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Vehiculo no encontrado"));
        vehiculo.setEstado("DESHABILITADO");
        vehiculo.setFechaActualizacion(LocalDateTime.now());
        return guardar(vehiculo);
    }

    // ========== DTO CONVERSION ==========

    public VehiculoResponseDTO toResponseDTO(Vehiculo v) {
        if (v == null) return null;

        // Información de empresa
        Long empresaId = null;
        String empresaNombre = null;
        String empresaRuc = null;
        if (v.getEmpresa() != null) {
            empresaId = (long) v.getEmpresa().getIdEmpresa();
            empresaNombre = v.getEmpresa().getNombre();
            empresaRuc = v.getEmpresa().getRuc();
        }

        // Información de subtipo transporte
        Long subtipoTransporteId = null;
        String subtipoTransporteNombre = null;
        if (v.getSubtipoTransporte() != null) {
            subtipoTransporteId = v.getSubtipoTransporte().getIdSubtipoTransporte();
            subtipoTransporteNombre = v.getSubtipoTransporte().getNombre();
        }

        // Información de tipo transporte (a través de subtipo)
        Long tipoTransporteId = null;
        String tipoTransporteNombre = null;
        if (v.getSubtipoTransporte() != null && v.getSubtipoTransporte().getTipoTransporte() != null) {
            tipoTransporteId = (long) v.getSubtipoTransporte().getTipoTransporte().getIdTipoTransporte();
            tipoTransporteNombre = v.getSubtipoTransporte().getTipoTransporte().getNombre();
        }

        // Información de categoría transporte (a través de tipo -> categoría)
        Long categoriaTransporteId = null;
        String categoriaTransporteNombre = null;
        if (v.getSubtipoTransporte() != null && 
            v.getSubtipoTransporte().getTipoTransporte() != null &&
            v.getSubtipoTransporte().getTipoTransporte().getCategoriaTransporte() != null) {
            categoriaTransporteId = (long) v.getSubtipoTransporte().getTipoTransporte().getCategoriaTransporte().getIdCategoriaTransporte();
            categoriaTransporteNombre = v.getSubtipoTransporte().getTipoTransporte().getCategoriaTransporte().getNombre();
        }

        // Información de gerente responsable
        Long gerenteResponsableId = null;
        String gerenteResponsableNombre = null;
        if (v.getGerenteResponsable() != null) {
            gerenteResponsableId = (long) v.getGerenteResponsable().getIdGerente();
            gerenteResponsableNombre = v.getGerenteResponsable().getNombre();
        }

        // TUC vinculado
        LocalDateTime fechaVencimientoTUC = null;
        if (v.getTuc() != null) {
            fechaVencimientoTUC = v.getTuc().getFechaVencimiento();
        }

        // Conteo de TUCs
        long totalTucs = v.getTuc() != null ? 1 : 0;

        // Conteo de inspecciones
        int inspeccionesCount = v.getInspecciones() != null ? v.getInspecciones().size() : 0;

        VehiculoResponseDTO dto = new VehiculoResponseDTO(
                v.getIdVehiculo(),
                v.getPlaca(),
                v.getNumeroMotor(),
                v.getNumeroChasis(),
                v.getMarca(),
                v.getModelo(),
                v.getAnioFabricacion(),
                v.getColor(),
                v.getCapacidadPasajeros(),
                v.getCapacidadCarga(),
                v.getEstado(),
                v.getObservaciones(),
                v.getFechaRegistro(),
                v.getFechaActualizacion(),
                empresaId,
                empresaNombre,
                empresaRuc,
                subtipoTransporteId,
                subtipoTransporteNombre,
                gerenteResponsableId,
                gerenteResponsableNombre
        );

        // Campos adicionales
        dto.setTipoTransporteId(tipoTransporteId);
        dto.setTipoTransporteNombre(tipoTransporteNombre);
        dto.setCategoriaTransporteId(categoriaTransporteId);
        dto.setCategoriaTransporteNombre(categoriaTransporteNombre);
        dto.setActivo(v.getEstado() != null && v.getEstado().equals("ACTIVO"));
        dto.setFechaVencimientoTUC(fechaVencimientoTUC);
        dto.setTotalTucs((int) totalTucs);
        dto.setInspeccionesCount(inspeccionesCount);
        dto.setPesoNeto(v.getCapacidadCarga());

        return dto;
    }

    // Método para listar enriquecidos
    public List<VehiculoResponseDTO> listarTodosEnriquecidos() {
        List<Vehiculo> vehiculos = repo.findAllWithDetails();
        return vehiculos.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
}
