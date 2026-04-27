package com.example.demo.repository;

import com.example.demo.dto.TramiteListadoDTO;
import com.example.demo.model.Tramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TramiteRepository extends JpaRepository<Tramite, Long> {
     
    @Query("SELECT t.idTramite FROM Tramite t WHERE t.usuarioRegistra.idUsuarios = :usuarioId")
    List<Long> findIdsByUsuarioRegistraId(Long usuarioId);

    @Query("SELECT t FROM Tramite t LEFT JOIN FETCH t.tipoTramite WHERE t.codigoRut = :codigoRut")
    Tramite findByCodigoRutWithFetch(@Param("codigoRut") String codigoRut);
    
    @Query("SELECT t FROM Tramite t " +
           "LEFT JOIN FETCH t.tipoTramite " +
           "LEFT JOIN FETCH t.personaNatural " +
           "LEFT JOIN FETCH t.empresa " +
           "LEFT JOIN FETCH t.gerente " +
           "WHERE t.idTramite = :id")
    Tramite findByIdWithTipoTramite(@Param("id") Long id);

    @Query("SELECT t FROM Tramite t " +
            "LEFT JOIN FETCH t.departamentoActual " +
            "LEFT JOIN FETCH t.usuarioRegistra " +
            "LEFT JOIN t.tipoTramite tt " +
            "WHERE t.codigoRut = :codigoRut")
    Tramite findByCodigoRutEnriquecido(@Param("codigoRut") String codigoRut);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findAllEnriquecidos();

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE LOWER(t.codigoRut) LIKE LOWER(CONCAT('%',:termino,'%')) " +
           "   OR LOWER(d.nombre) LIKE LOWER(CONCAT('%',:termino,'%')) " +
           "   OR LOWER(u.username) LIKE LOWER(CONCAT('%',:termino,'%')) " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findEnriquecidosByTermino(@Param("termino") String termino);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE t.usuarioResponsableId.idUsuarios = :usuarioId " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findByUsuarioResponsable_IdUsuarios(@Param("usuarioId") Long usuarioId);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE pn.idPersonaNatural = :personaNaturalId " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findByPersonaNaturalId(@Param("personaNaturalId") Long personaNaturalId);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE e.idEmpresa = :empresaId " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findByEmpresaId(@Param("empresaId") Long empresaId);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE g.idGerente = :gerenteId " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findByGerenteId(@Param("gerenteId") Long gerenteId);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE t.usuarioRegistra.idUsuarios = :usuarioId " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findByUsuarioRegistraId(@Param("usuarioId") Long usuarioId);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE d.idDepartamento = :departamentoId " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findByDepartamentoId(@Param("departamentoId") Long departamentoId);

    @Query("SELECT NEW com.example.demo.dto.TramiteListadoDTO(" +
           "t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, " +
           "d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni)), " +
           "COUNT(DISTINCT doc.idDocumento), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'APROBADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado IN ('PENDIENTE', 'PRESENTADO') THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'OBSERVADO' THEN doc.idDocumento END), " +
           "COUNT(DISTINCT CASE WHEN doc.estado = 'REPROBADO' THEN doc.idDocumento END) " +
           ") " +
           "FROM Tramite t " +
           "LEFT JOIN t.departamentoActual d " +
           "LEFT JOIN t.usuarioRegistra u " +
           "LEFT JOIN t.personaNatural pn " +
           "LEFT JOIN t.empresa e " +
           "LEFT JOIN t.gerente g " +
           "LEFT JOIN e.subtipoTransporte st " +
           "LEFT JOIN t.tipoTramite tt " +
           "LEFT JOIN t.documentos doc " +
           "WHERE COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente) = :solicitanteId " +
           "GROUP BY t.idTramite, t.codigoRut, t.estado, t.prioridad, " +
           "t.fechaRegistro, t.fechaActualizacion, d.nombre, u.username, " +
           "COALESCE(CONCAT(pn.nombres, ' ', pn.apellidos), e.nombre, g.nombre, 'N/A'), " +
           "tt.descripcion, tt.idTipoTramite, " +
           "COALESCE(pn.idPersonaNatural, e.idEmpresa, g.idGerente), " +
           "CASE " +
           "  WHEN pn.idPersonaNatural IS NOT NULL THEN 'PersonaNatural' " +
           "  WHEN e.idEmpresa IS NOT NULL THEN 'Empresa' " +
           "  WHEN g.idGerente IS NOT NULL THEN 'Gerente' " +
           "  ELSE null " +
           "END, " +
           "COALESCE(CONCAT('', pn.dni), e.ruc, CONCAT('', g.dni))")
    List<TramiteListadoDTO> findBySolicitanteId(@Param("solicitanteId") Long solicitanteId);

    List<Tramite> findByPersonaNatural_IdPersonaNatural(Long personaNaturalId);
}
