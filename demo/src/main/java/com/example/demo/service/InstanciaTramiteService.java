package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.DocumentoTramiteRepository;
import com.example.demo.repository.InstanciaTramiteRepository;
import com.example.demo.repository.RequisitoTUPACRepository;
import com.example.demo.repository.TipoTramiteRepository;
import com.example.demo.repository.TramiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class InstanciaTramiteService {

    @Autowired
    private InstanciaTramiteRepository instanciaRepository;

    @Autowired
    private DocumentoTramiteRepository documentoRepository;

    @Autowired
    private TramiteRepository tramiteRepository;

    @Autowired
    private TipoTramiteRepository tipoTramiteRepository;

    @Autowired
    private RequisitoTUPACRepository requisitoRepository;

    public List<InstanciaTramite> listarPorTramite(Long tramiteId) {
        return instanciaRepository.findByTramite_IdTramiteOrderByFechaCreacionDesc(tramiteId);
    }

    public Optional<InstanciaTramite> obtenerPorId(Long id) {
        return instanciaRepository.findById(id);
    }

     public long contarPorTramite(Long tramiteId) {
         return instanciaRepository.countByTramite_IdTramite(tramiteId);
     }

    public List<InstanciaTramite> listarTodas() {
        return instanciaRepository.findAllWithTramiteAndTipoTramite();
    }

    @Transactional
    public InstanciaTramite crear(Long tramiteId, InstanciaTramite instancia) {
        // Validar que el trámite existe y cargarlo completo
        Tramite tramite = tramiteRepository.findById(tramiteId)
            .orElseThrow(() -> new RuntimeException("Trámite no encontrado con id: " + tramiteId));
        
        instancia.setTramite(tramite);
        instancia.setFechaCreacion(LocalDateTime.now());
        instancia.setFechaActualizacion(LocalDateTime.now()); // <-- Agregar
        instancia.setEstado("ACTIVO");

        InstanciaTramite guardada = instanciaRepository.save(instancia);

        // Crear documentos pendientes para cada requisito del tipo-tramite
        crearDocumentosParaRequisitos(guardada);

        return guardada;
    }

    @Transactional
    public InstanciaTramite actualizar(Long id, InstanciaTramite datos) {
        return instanciaRepository.findById(id).map(inst -> {
            if (datos.getIdentificador() != null) inst.setIdentificador(datos.getIdentificador());
            if (datos.getDescripcion() != null) inst.setDescripcion(datos.getDescripcion());
            if (datos.getObservaciones() != null) inst.setObservaciones(datos.getObservaciones());
            if (datos.getEstado() != null) inst.setEstado(datos.getEstado());
            // Forzar actualización de fecha
            inst.setFechaActualizacion(LocalDateTime.now());
            return instanciaRepository.save(inst);
        }).orElse(null);
    }

    @Transactional
    public void eliminar(Long id) {
        instanciaRepository.deleteById(id);
    }

    /**
     * Crea DocumentoTramite pendientes para todos los requisitos asociados al tipo de trámite
     */
    private void crearDocumentosParaRequisitos(InstanciaTramite instancia) {
        Tramite tramite = instancia.getTramite();
        if (tramite == null || tramite.getTipoTramite() == null) return;

        TipoTramite tipo = tramite.getTipoTramite();
        String requisitosIdsCsv = tipo.getRequisitosIds();
        if (requisitosIdsCsv == null || requisitosIdsCsv.trim().isEmpty()) return;

        // Parsear CSV de IDs
        String[] ids = requisitosIdsCsv.split(",");
        List<Long> requisitoIds = new ArrayList<>();
        for (String idStr : ids) {
            try {
                requisitoIds.add(Long.parseLong(idStr.trim()));
            } catch (NumberFormatException e) {
                // Ignorar IDs inválidos
            }
        }

        if (requisitoIds.isEmpty()) return;

        // Obtener requisitos
        List<RequisitoTUPAC> requisitos = requisitoRepository.findAllById(requisitoIds);

        // Crear documentos pendientes para cada requisito
        for (RequisitoTUPAC req : requisitos) {
            DocumentoTramite doc = new DocumentoTramite();
            doc.setTramiteId(tramite.getIdTramite());
            doc.setRequisitoId(req.getId());
            doc.setEstado("PENDIENTE");
            doc.setFechaCreacion(LocalDateTime.now());
            doc.setInstanciaTramite(instancia);
            // No se establece ruta_archivo ni nombre_archivo hasta que se suba
            documentoRepository.save(doc);
        }
    }

    /**
     * Obtiene los documentos de una instancia específica
     */
    public List<DocumentoTramite> obtenerDocumentosDeInstancia(Long instanciaId) {
        return documentoRepository.findByInstanciaTramiteIdInstancia(instanciaId);
    }
}
