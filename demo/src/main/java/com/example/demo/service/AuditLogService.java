package com.example.demo.service;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.AuditLogFilterRequest;
import com.example.demo.dto.AuditLogResponseDTO;
import com.example.demo.model.CampoFormato;
import com.example.demo.model.Departamento;
import com.example.demo.model.DocumentoTramite;
import com.example.demo.model.Empresa;
import com.example.demo.model.FichaInspeccion;
import com.example.demo.model.FormatoInspeccion;
import com.example.demo.model.Gerente;
import com.example.demo.model.GrupoPresentacion;
import com.example.demo.model.HistorialTramite;
import com.example.demo.model.InscripcionExamen;
import com.example.demo.model.Inspeccion;
import com.example.demo.model.InspeccionInstancia;
import com.example.demo.model.InstanciaTramite;
import com.example.demo.model.Notificacion;
import com.example.demo.model.PersonaNatural;
import com.example.demo.model.Publicacion;
import com.example.demo.model.PuntoRuta;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.Roles;
import com.example.demo.model.Ruta;
import com.example.demo.model.Solicitud;
import com.example.demo.model.TUC;
import com.example.demo.model.TUPAC;
import com.example.demo.model.TipoTramite;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.model.ValorCampo;
import com.example.demo.model.Vehiculo;
import com.example.demo.model.VehiculoApto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

@Service
public class AuditLogService {

    @Autowired
    private EntityManager entityManager;

    private static final Map<Integer, String> REV_TYPE_MAP = Map.of(
            0, "CREACIÓN",
            1, "MODIFICACIÓN",
            2, "ELIMINACIÓN"
    );

    private static final List<String> SENSITIVE_AUDIT_COLUMN_PATTERNS = List.of(
            "password",
            "token",
            "secret",
            "jwt",
            "credential",
            "credentials",
            "clave",
            "contrasena",
            "contraseña",
            "dni",
            "ruc",
            "email",
            "correo",
            "telefono",
            "teléfono",
            "direccion",
            "dirección",
            "licencia"
    );

    private static final int MAX_AUDIT_COUNT_CAP = 10_000;
    private static final long AUDIT_TABLES_CACHE_TTL_MILLIS = 60_000L;
    private static final String REDACTED_AUDIT_VALUE = "***REDACTADO***";
    private static volatile List<String> cachedAuditedTables = List.of();
    private static volatile long cachedAuditedTablesAt = 0L;

    private static final Map<String, Class<?>> TABLE_TO_ENTITY = new java.util.HashMap<>();

    static {
        TABLE_TO_ENTITY.put("tramite", Tramite.class);
        TABLE_TO_ENTITY.put("solicitud", Solicitud.class);
        TABLE_TO_ENTITY.put("empresa", Empresa.class);
        TABLE_TO_ENTITY.put("gerente", Gerente.class);
        TABLE_TO_ENTITY.put("persona_natural", PersonaNatural.class);
        TABLE_TO_ENTITY.put("tuc", TUC.class);
        TABLE_TO_ENTITY.put("tupac", TUPAC.class);
        TABLE_TO_ENTITY.put("vehiculo", Vehiculo.class);
        TABLE_TO_ENTITY.put("vehiculo_apto", VehiculoApto.class);
        TABLE_TO_ENTITY.put("documento_tramite", DocumentoTramite.class);
        TABLE_TO_ENTITY.put("formato_inspeccion", FormatoInspeccion.class);
        TABLE_TO_ENTITY.put("ficha_inspeccion", FichaInspeccion.class);
        TABLE_TO_ENTITY.put("inspeccion", Inspeccion.class);
        TABLE_TO_ENTITY.put("inscripcion_examen", InscripcionExamen.class);
        TABLE_TO_ENTITY.put("inspeccion_instancia", InspeccionInstancia.class);
        TABLE_TO_ENTITY.put("instancia_tramite", InstanciaTramite.class);
        TABLE_TO_ENTITY.put("publicacion", Publicacion.class);
        TABLE_TO_ENTITY.put("punto_ruta", PuntoRuta.class);
        TABLE_TO_ENTITY.put("requisito_tupac", RequisitoTUPAC.class);
        TABLE_TO_ENTITY.put("ruta", Ruta.class);
        TABLE_TO_ENTITY.put("tipo_tramite", TipoTramite.class);
        TABLE_TO_ENTITY.put("valor_campo", ValorCampo.class);
        TABLE_TO_ENTITY.put("campo_formato", CampoFormato.class);
        TABLE_TO_ENTITY.put("departamento", Departamento.class);
        TABLE_TO_ENTITY.put("grupo_presentacion", GrupoPresentacion.class);
        TABLE_TO_ENTITY.put("historial_tramite", HistorialTramite.class);
        TABLE_TO_ENTITY.put("roles", Roles.class);
        TABLE_TO_ENTITY.put("users", Users.class);
        TABLE_TO_ENTITY.put("notificacion", Notificacion.class);
    }

    private List<String> getAuditedTableNames() {
        long now = System.currentTimeMillis();
        List<String> cached = cachedAuditedTables;
        if (now - cachedAuditedTablesAt < AUDIT_TABLES_CACHE_TTL_MILLIS) {
            return cached;
        }
        return loadAuditedTableNames();
    }

    private List<String> loadAuditedTableNames() {
        List<String> tables = new ArrayList<>();
        try {
            Query query = entityManager.createNativeQuery(
                    "SELECT table_name FROM information_schema.tables " +
                            "WHERE table_schema = 'public' AND table_name LIKE '%\\_aud' ESCAPE '\\' " +
                            "ORDER BY table_name"
            );
            @SuppressWarnings("unchecked")
            List<String> result = query.getResultList();
            tables.addAll(result);
            cachedAuditedTables = List.copyOf(tables);
            cachedAuditedTablesAt = System.currentTimeMillis();
        } catch (Exception e) {
            System.err.println("[AuditLogService] Error obteniendo tablas auditadas: " + e.getMessage());
        }
        return tables;
    }

    private String getPkColumnForTable(String tableName) {
        return switch (tableName) {
            case "solicitud" -> "id_solicitud";
            case "empresa" -> "id_empresa";
            case "gerente" -> "id_gerente";
            case "persona_natural" -> "id_personanatural";
            case "tramite" -> "id_tramite";
            case "tuc" -> "id_tuc";
            case "tupac" -> "id_tupac";
            case "vehiculo" -> "id_vehiculo";
            case "vehiculo_apto" -> "id_vehiculo_apto";
            case "documento_tramite" -> "id_documento";
            case "formato_inspeccion" -> "id_formato_inspeccion";
            case "ficha_inspeccion" -> "id_ficha_inspeccion";
            case "inspeccion" -> "id_inspeccion";
            case "inscripcion_examen" -> "id_inscripcion";
            case "inspeccion_instancia" -> "id_inspeccion_instancia";
            case "instancia_tramite" -> "id_instancia";
            case "publicacion" -> "id_publicacion";
            case "punto_ruta" -> "id_punto_ruta";
            case "requisito_tupac" -> "id_requisito";
            case "ruta" -> "id_ruta";
            case "tipo_tramite" -> "id_tipo_tramite";
            case "valor_campo" -> "id_valor_campo";
            case "campo_formato" -> "id_campo_formato";
            case "departamento" -> "id_departamento";
            case "grupo_presentacion" -> "ID_Grupo";
            case "historial_tramite", "roles" -> "id";
            case "users", "notificacion" -> "id_usuarios";
            default -> "id";
        };
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDTO> getAuditLogs(AuditLogFilterRequest filter, Pageable pageable) {
        Pageable normalizedPageable = pageable == null
                ? PageRequest.of(0, 50)
                : PageRequest.of(
                        Math.max(0, pageable.getPageNumber()),
                        Math.min(Math.max(1, pageable.getPageSize()), 100),
                        pageable.getSort() != null ? pageable.getSort() : Sort.unsorted()
                );

        List<String> auditTables = getAuditedTableNames();
        if (filter != null && filter.getTabla() != null && !filter.getTabla().isEmpty()) {
            String requestedAuditTable = filter.getTabla().toLowerCase(Locale.ROOT) + "_aud";
            auditTables.removeIf(table -> !table.equals(requestedAuditTable));
        }
        if (auditTables.isEmpty()) {
            return new PageImpl<>(List.of(), normalizedPageable, 0);
        }

        List<Object> params = new java.util.ArrayList<>();
        StringBuilder mainSql = new StringBuilder();
        StringBuilder countSql = new StringBuilder();

        mainSql.append("SELECT r.id as rev, r.timestamp, r.username, a.revtype, a.entity_id, a.entity_table ")
                .append("FROM revinfo r ")
                .append("JOIN (");

        countSql.append("SELECT COUNT(*) FROM (SELECT 1 FROM revinfo r JOIN (");

        for (int i = 0; i < auditTables.size(); i++) {
            String table = auditTables.get(i);
            String baseName = table.replace("_aud", "");
            String pkColumn = getPkColumnForTable(baseName);

            if (i > 0) {
                mainSql.append(" UNION ALL ");
                countSql.append(" UNION ALL ");
            }

            mainSql.append("SELECT rev, revtype, ")
                    .append(pkColumn).append(" as entity_id, '")
                    .append(baseName).append("' as entity_table FROM ").append(table);

            countSql.append("SELECT rev, revtype, ")
                    .append(pkColumn).append(" as entity_id, '")
                    .append(baseName).append("' as entity_table FROM ").append(table);
        }

        mainSql.append(") a ON r.id = a.rev ");
        countSql.append(") a ON r.id = a.rev ");

        StringBuilder where = new StringBuilder();
        boolean hasWhere = false;

        if (filter != null) {
            if (filter.getTabla() != null && !filter.getTabla().isEmpty()) {
                where.append("WHERE ").append("entity_table = ? ");
                params.add(filter.getTabla());
                hasWhere = true;
            }
            if (filter.getRegistroId() != null) {
                if (hasWhere) where.append("AND ");
                else where.append("WHERE ");
                where.append("entity_id = ? ");
                params.add(filter.getRegistroId());
                hasWhere = true;
            }
            if (filter.getAccion() != null && !filter.getAccion().isEmpty()) {
                if (hasWhere) where.append("AND ");
                else where.append("WHERE ");
                where.append("revtype = ? ");
                params.add(getRevType(filter.getAccion()));
                hasWhere = true;
            }
            if (filter.getUsuario() != null && !filter.getUsuario().isEmpty()) {
                if (hasWhere) where.append("AND ");
                else where.append("WHERE ");
                where.append("r.username LIKE ? ");
                params.add("%" + filter.getUsuario() + "%");
                hasWhere = true;
            }
            if (filter.getFechaDesde() != null) {
                if (hasWhere) where.append("AND ");
                else where.append("WHERE ");
                where.append("r.timestamp >= ? ");
                params.add(java.sql.Timestamp.valueOf(filter.getFechaDesde()));
                hasWhere = true;
            }
            if (filter.getFechaHasta() != null) {
                if (hasWhere) where.append("AND ");
                else where.append("WHERE ");
                where.append("r.timestamp <= ? ");
                params.add(java.sql.Timestamp.valueOf(filter.getFechaHasta()));
                hasWhere = true;
            }
        }

        String whereStr = where.toString();
        mainSql.append(whereStr).append("ORDER BY r.id DESC");
        countSql.append(whereStr).append(" LIMIT ? ) limited");

        Query query = entityManager.createNativeQuery(mainSql.toString());
        Query countQuery = entityManager.createNativeQuery(countSql.toString());

        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
            countQuery.setParameter(i + 1, params.get(i));
        }
        countQuery.setParameter(params.size() + 1, MAX_AUDIT_COUNT_CAP);

        Pageable cappedPageable = PageRequest.of(
                normalizedPageable.getPageNumber(),
                normalizedPageable.getPageSize(),
                normalizedPageable.getSort()
        );

        query.setFirstResult((int) cappedPageable.getOffset());
        query.setMaxResults(cappedPageable.getPageSize());

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Number totalCount = (Number) countQuery.getSingleResult();

        List<AuditLogResponseDTO> results = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            AuditLogResponseDTO dto = new AuditLogResponseDTO();
            dto.setRegistroId(((Number) row[4]).longValue());
            dto.setTablaAfectada((String) row[5]);
            Integer revType = ((Number) row[3]).intValue();
            String accion = REV_TYPE_MAP.getOrDefault(revType, "DESCONOCIDO");
            dto.setAccion(accion);
            dto.setTipoAccion(getTipoAccionCode(revType));
            dto.setFechaAccion(new Date(((Number) row[1]).longValue()).toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime());
            dto.setUsuario((String) row[2]);

            String desc = generarDescripcionCambio((String) row[5], revType, ((Number) row[4]).longValue());
            dto.setDescripcion(desc);

            results.add(dto);
        }

        return new PageImpl<>(results, cappedPageable, totalCount.longValue());
    }

    private String getTipoAccionCode(Integer revType) {
        return switch (revType) {
            case 0 -> "CREACION";
            case 1 -> "MODIFICACION";
            case 2 -> "ELIMINACION";
            default -> "DESCONOCIDO";
        };
    }

    private String generarDescripcionCambio(String tabla, Integer revType, Long registroId) {
        String tipoEntidad = switch (tabla) {
            case "tramite" -> "Trámite";
            case "solicitud" -> "Solicitud";
            case "empresa" -> "Empresa";
            case "gerente" -> "Gerente";
            case "persona_natural" -> "Persona Natural";
            case "vehiculo" -> "Vehículo";
            case "documento_tramite" -> "Documento de Trámite";
            case "inspeccion" -> "Inspección";
            case "ruta" -> "Ruta";
            case "users" -> "Usuario";
            case "roles" -> "Rol";
            case "departamento" -> "Departamento";
            default -> tabla;
        };

        String accion = switch (revType) {
            case 0 -> "creó";
            case 1 -> "modificó";
            case 2 -> "eliminó";
            default -> "modificó";
        };

        return tipoEntidad + " #" + registroId + " - " + accion;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAuditLogDetail(String tableName, Long recordId, Long revision) {
        if (tableName == null || tableName.trim().isEmpty()) {
            return Map.of("error", "Tabla inválida");
        }
        if (recordId == null) {
            return Map.of("error", "Registro inválido");
        }

        String normalizedTableName = tableName.trim().toLowerCase(Locale.ROOT);
        Map<String, Object> detalle = new LinkedHashMap<>();

        try {
            if (!TABLE_TO_ENTITY.containsKey(normalizedTableName)) {
                detalle.put("error", "Tabla no reconocida: " + normalizedTableName);
                return detalle;
            }

            String auditTable = normalizedTableName + "_aud";
            String pkColumn = getPkColumnForTable(normalizedTableName);

            if (revision == null) {
                String sqlMax = "SELECT MAX(r.id) FROM " + auditTable + " a JOIN revinfo r ON r.id = a.rev WHERE a." + pkColumn + " = ?";
                Query maxQuery = entityManager.createNativeQuery(sqlMax);
                maxQuery.setParameter(1, recordId);
                Object maxResult = maxQuery.getSingleResult();
                if (maxResult == null) {
                    detalle.put("error", "No se encontraron revisiones para este registro");
                    return detalle;
                }
                revision = ((Number) maxResult).longValue();
            }

            String sql = "SELECT r.timestamp, r.username, a.revtype, a.* FROM "
                    + auditTable + " a "
                    + "JOIN revinfo r ON r.id = a.rev "
                    + "WHERE a." + pkColumn + " = ? AND r.id = ?";

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, recordId);
            query.setParameter(2, revision);

            List<Object[]> rows = query.getResultList();
            if (rows.isEmpty()) {
                detalle.put("error", "Revisión no encontrada");
                return detalle;
            }

            Object[] row = rows.get(0);
            Integer revType = ((Number) row[2]).intValue();
            String accion = REV_TYPE_MAP.getOrDefault(revType, "DESCONOCIDO");

            detalle.put("tabla", normalizedTableName);
            detalle.put("registroId", recordId);
            detalle.put("revision", revision);
            detalle.put("accion", accion);
            detalle.put("tipoAccion", getTipoAccionCode(revType));
            detalle.put("usuario", (String) row[1]);
            detalle.put("fechaAccion", new Date(((Number) row[0]).longValue()).toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime());

            detalle.put("datosNuevos", convertirFilaAuditAFiltro(auditTable, row));

            if (revType == 1) {
                String sqlAnt = "SELECT MAX(r.id) FROM " + auditTable + " a "
                        + "JOIN revinfo r ON r.id = a.rev "
                        + "WHERE a." + pkColumn + " = ? AND r.id < ?";
                Query antQuery = entityManager.createNativeQuery(sqlAnt);
                antQuery.setParameter(1, recordId);
                antQuery.setParameter(2, revision);
                Object antResult = antQuery.getSingleResult();

                if (antResult != null) {
                    Long revAnt = ((Number) antResult).longValue();
                    String sqlAntData = "SELECT r.timestamp, r.username, a.revtype, a.* FROM "
                            + auditTable + " a "
                            + "JOIN revinfo r ON r.id = a.rev "
                            + "WHERE a." + pkColumn + " = ? AND r.id = ?";
                    Query antDataQuery = entityManager.createNativeQuery(sqlAntData);
                    antDataQuery.setParameter(1, recordId);
                    antDataQuery.setParameter(2, revAnt);
                    List<Object[]> antRows = antDataQuery.getResultList();
                    if (!antRows.isEmpty()) {
                        detalle.put("datosAnteriores", convertirFilaAuditAFiltro(auditTable, antRows.get(0)));
                    }
                }
            }

            Map<String, Object> datosFiltrados = new LinkedHashMap<>();
            datosFiltrados.put("revision", row[0]);
            datosFiltrados.put("usuario", row[1]);
            datosFiltrados.put("tipo", accion);
            datosFiltrados.put("tabla", normalizedTableName);
            datosFiltrados.put("idRegistro", recordId);
            detalle.put("resumenDatos", datosFiltrados);

        } catch (Exception e) {
            detalle.put("error", "Error al cargar detalle: " + e.getMessage());
            System.err.println("[AuditLogService] Error en getAuditLogDetail: " + e.getMessage());
        }

        return detalle;
    }

    private Map<String, Object> convertirFilaAuditAFiltro(String auditTable, Object[] row) {
        Map<String, Object> datosFiltrados = new LinkedHashMap<>();
        List<String> columnNames = obtenerColumnasTablaAudit(auditTable);
        int dataStartIndex = 3;

        for (int i = dataStartIndex; i < row.length; i++) {
            String columnName = i - dataStartIndex < columnNames.size()
                    ? columnNames.get(i - dataStartIndex)
                    : "columna_" + (i - dataStartIndex + 1);
            datosFiltrados.put(columnName, esColumnaAuditSensible(columnName) ? REDACTED_AUDIT_VALUE : row[i]);
        }

        return datosFiltrados;
    }

    @SuppressWarnings("unchecked")
    private List<String> obtenerColumnasTablaAudit(String auditTable) {
        try {
            Query query = entityManager.createNativeQuery(
                    "SELECT column_name FROM information_schema.columns " +
                            "WHERE table_schema = 'public' AND table_name = ? " +
                            "ORDER BY ordinal_position"
            );
            query.setParameter(1, auditTable.toLowerCase(Locale.ROOT));
            return (List<String>) query.getResultList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private boolean esColumnaAuditSensible(String columnName) {
        if (columnName == null) {
            return false;
        }

        String normalized = columnName.toLowerCase(Locale.ROOT);
        return SENSITIVE_AUDIT_COLUMN_PATTERNS.stream().anyMatch(normalized::contains);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDTO> getAuditLogsByTableAndId(String tableName, Long recordId, Pageable pageable) {
        AuditLogFilterRequest filter = new AuditLogFilterRequest();
        filter.setTabla(tableName);
        filter.setRegistroId(recordId);
        return getAuditLogs(filter, pageable);
    }

    private int getRevType(String accion) {
        if (accion == null) return -1;
        return switch (accion.toUpperCase(Locale.ROOT)) {
            case "CREACIÓN", "INSERT" -> 0;
            case "MODIFICACIÓN", "UPDATE" -> 1;
            case "ELIMINACIÓN", "DELETE" -> 2;
            default -> -1;
        };
    }
}
