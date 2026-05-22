package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    @Query(value = "SELECT n.* FROM notificaciones n WHERE n.activo = true AND n.para_todos = true " +
            "ORDER BY n.fecha_publicacion DESC", nativeQuery = true)
    List<Notificacion> findByActivoAndParaTodosTrueOrderByFechaPublicacionDesc(Boolean activo);

    @Query(value = "SELECT n.* FROM notificaciones n " +
            "WHERE n.activo = true AND n.usuario_destino_id = :uid AND n.para_todos = false " +
            "ORDER BY n.fecha_publicacion DESC", nativeQuery = true)
    List<Notificacion> findByUsuarioDestinoAndActivoTrueOrderByFechaPublicacionDesc(
            @Param("uid") Long uid);

    @Query(value = "SELECT n.id_notificacion, n.titulo, n.mensaje, n.tipo, " +
            "n.fecha_creacion, n.fecha_publicacion, n.fecha_expiracion, " +
            "n.activo, n.prioridad, n.url_destino, n.para_todos, " +
            "n.usuario_creador_id, n.usuario_destino_id " +
            "FROM notificaciones n WHERE n.activo = true " +
            "AND (n.para_todos = true OR n.usuario_destino_id = :uid) " +
            "AND n.fecha_publicacion IS NOT NULL " +
            "AND (n.fecha_expiracion IS NULL OR n.fecha_expiracion > :now) " +
            "ORDER BY n.prioridad DESC, n.fecha_publicacion DESC",
            countQuery = "SELECT COUNT(*) FROM notificaciones n WHERE n.activo = true " +
                    "AND (n.para_todos = true OR n.usuario_destino_id = :uid) " +
                    "AND n.fecha_publicacion IS NOT NULL " +
                    "AND (n.fecha_expiracion IS NULL OR n.fecha_expiracion > :now)",
            nativeQuery = true)
    Page<Notificacion> findActiveForUser(@Param("uid") Long uid,
                                          @Param("now") LocalDateTime now,
                                          Pageable pageable);

    @Query(value = "SELECT n.id_notificacion, n.titulo, n.mensaje, n.tipo, " +
            "n.fecha_creacion, n.fecha_publicacion, n.fecha_expiracion, " +
            "n.activo, n.prioridad, n.url_destino, n.para_todos, " +
            "n.usuario_creador_id, n.usuario_destino_id " +
            "FROM notificaciones n WHERE n.activo = true AND n.para_todos = true " +
            "AND n.fecha_publicacion IS NOT NULL " +
            "AND (n.fecha_expiracion IS NULL OR n.fecha_expiracion > :now) " +
            "ORDER BY n.prioridad DESC, n.fecha_publicacion DESC",
            countQuery = "SELECT COUNT(*) FROM notificaciones n WHERE n.activo = true AND n.para_todos = true " +
                    "AND n.fecha_publicacion IS NOT NULL " +
                    "AND (n.fecha_expiracion IS NULL OR n.fecha_expiracion > :now)",
            nativeQuery = true)
    Page<Notificacion> findPublicActivesYPublicadas(@Param("now") LocalDateTime now, Pageable pageable);
}
