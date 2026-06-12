package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.NotificacionAuthDTO;
import com.example.demo.model.Notificacion;
import com.example.demo.model.Users;
import com.example.demo.repository.NotificacionRepository;
import com.example.demo.repository.UsersRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository repo;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private UsersRepository usersRepository;

    public List<Notificacion> listarTodas() {
        return repo.findAll();
    }

    public Optional<Notificacion> buscarPorId(Long id) {
        return repo.findById(id);
    }

    /**
     * Create directly without entity references (set usuarioCreador/usuarioDestino from id if needed,
     * use NotificacionController to pass the resolved Users entity).
     */
    /**
     * Helper: create a notification as the given user. Sets fechaPublicacion to now
     * so it is immediately visible to the audience.
     */
    @Transactional
    public Notificacion crearNotificacionComo(Users creador, String titulo, String mensaje,
                                              Notificacion.TipoNotificacion tipo,
                                              boolean paraTodos,
                                              Users usuarioDestino,
                                              String urlDestino,
                                              Integer prioridad) {
        Notificacion n = new Notificacion();
        n.setTitulo(titulo);
        n.setMensaje(mensaje);
        n.setTipo(tipo);
        n.setParaTodos(paraTodos);
        n.setUsuarioCreador(creador);
        n.setUsuarioDestino(usuarioDestino); // null → broadcast
        n.setUrlDestino(urlDestino);
        n.setPrioridad(prioridad != null ? prioridad : 0);
        n.setFechaPublicacion(LocalDateTime.now());
        n.setActivo(true);
        return repo.save(n);
    }

    public Notificacion crear(Notificacion notificacion) {
        LocalDateTime now = LocalDateTime.now();
        if (notificacion.getFechaCreacion() == null) {
            notificacion.setFechaCreacion(now);
        }
        // Si no tiene fecha de publicación, la establecemos en 'now' para que sea visible inmediatamente
        if (notificacion.getFechaPublicacion() == null) {
            notificacion.setFechaPublicacion(now);
        }
        if (notificacion.getActivo() == null) {
            notificacion.setActivo(true);
        }
        return repo.save(notificacion);
    }

    public Notificacion actualizar(Long id, Notificacion datos) {
        return repo.findById(id).map(n -> {
            if (datos.getTitulo() != null) n.setTitulo(datos.getTitulo());
            if (datos.getMensaje() != null) n.setMensaje(datos.getMensaje());
            if (datos.getTipo() != null) n.setTipo(datos.getTipo());
            if (datos.getFechaPublicacion() != null) n.setFechaPublicacion(datos.getFechaPublicacion());
            if (datos.getFechaExpiracion() != null) n.setFechaExpiracion(datos.getFechaExpiracion());
            if (datos.getPrioridad() != null) n.setPrioridad(datos.getPrioridad());
            if (datos.getUrlDestino() != null) n.setUrlDestino(datos.getUrlDestino());
            if (datos.getUsuarioDestino() != null) n.setUsuarioDestino(datos.getUsuarioDestino());
            if (datos.getParaTodos() != null) n.setParaTodos(datos.getParaTodos());
            if (datos.getActivo() != null) n.setActivo(datos.getActivo());
            return repo.save(n);
        }).orElse(null);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    /**
     * Paginated: public or targeted to the given Spring Security User.
     * Used by the admin /api/notificaciones/active endpoint.
     */
      public Page<Notificacion> listarActivasParaUsuario(User usuario, Pageable pageable) {
          if (usuario == null) return Page.empty();
          Users appUser = usersRepository.findByUsername(usuario.getUsername());
          if (appUser == null) return Page.empty();
          return repo.findActiveForUser(appUser.getIdUsuarios(), LocalDateTime.now(), pageable);
      }

    /**
     * Paginated: active notifications for the given app Users entity.
     * Uses Native Query to avoid JPQL parameter type mismatch
     * (i.e. not comparing a Spring Security User against a JPA Users FK).
     */
      @Transactional(readOnly = true)
      @SuppressWarnings("unchecked")
      public Page<Notificacion> listarActivasParaUsuarioApp(Users usuarioApp, Pageable pageable) {
          Long userId = usuarioApp.getIdUsuarios();
          LocalDateTime now = LocalDateTime.now();
          int page = pageable.getPageNumber();
          int size = pageable.getPageSize();
          int offset = page * size;

          System.out.println("[NotificacionService] listarActivasParaUsuarioApp: userId=" + userId + 
                  ", now=" + now + ", page=" + page + ", size=" + size);

          // Usamos lista explícita de columnas (sin leido hasta que exista en BD)
           jakarta.persistence.Query query = entityManager.createNativeQuery(
                   "SELECT n.id_notificacion, n.titulo, n.mensaje, n.tipo, " +
                   "n.fecha_creacion, n.fecha_publicacion, n.fecha_expiracion, " +
                   "n.activo, n.prioridad, n.url_destino, n.para_todos, " +
                   "n.usuario_creador_id, n.usuario_destino_id, n.leido " +
                   "FROM notificaciones n WHERE n.activo = true " +
                           "AND (n.para_todos = true OR n.usuario_destino_id = :userId) " +
                           "AND n.fecha_publicacion IS NOT NULL " +
                           "AND (n.fecha_expiracion IS NULL OR n.fecha_expiracion > :now) " +
                           "ORDER BY n.prioridad DESC, n.fecha_publicacion DESC " +
                           "LIMIT :limit OFFSET :offset")
                  .setParameter("userId", userId)
                  .setParameter("now", now)
                  .setParameter("limit", size)
                  .setParameter("offset", offset);
          
          System.out.println("[NotificacionService] Native query generada. Ejecutando...");
          
          List<Object[]> resultRows;
          try {
              resultRows = query.getResultList();
          } catch (Exception e) {
              System.err.println("[NotificacionService] ERROR ejecutando native query: " + e.getMessage());
              e.printStackTrace();
              return new org.springframework.data.domain.PageImpl<>(List.of(), pageable, 0);
          }
          
          System.out.println("[NotificacionService] Native query devolvió " + resultRows.size() + " filas");
          
          // Mostrar cada fila para diagnóstico
          for (Object[] row : resultRows) {
              System.out.println("[NotificacionService] Fila: id=" + row[0] + 
                      ", titulo=" + row[1] + 
                      ", tipo=" + row[3] + 
                      ", para_todos=" + row[10] + 
                      ", fecha_pub=" + row[5] + 
                      ", fecha_exp=" + row[6]);
          }

          List<Notificacion> content = resultRows.stream()
                  .map(row -> {
                      Notificacion n = new Notificacion();
                      n.setId(((Number) row[0]).longValue());
                      n.setTitulo((String) row[1]);
                      n.setMensaje((String) row[2]);
                      String tipoStr = (String) row[3];
                      
                      if (tipoStr != null) {
                          try {
                              n.setTipo(Notificacion.TipoNotificacion.valueOf(tipoStr));
                          } catch (IllegalArgumentException e) {
                              System.err.println("[NotificacionService] Tipo no reconocido: '" + tipoStr + "', estableciendo null");
                              n.setTipo(null);
                          }
                      } else {
                          n.setTipo(null);
                      }
                      
                      // PostgreSQL devuelve java.sql.Timestamp en consultas nativas → convertir a LocalDateTime
                      n.setFechaCreacion(row[4] != null ? ((java.sql.Timestamp) row[4]).toLocalDateTime() : null);
                      n.setFechaPublicacion(row[5] != null ? ((java.sql.Timestamp) row[5]).toLocalDateTime() : null);
                      n.setFechaExpiracion(row[6] != null ? ((java.sql.Timestamp) row[6]).toLocalDateTime() : null);
                      n.setActivo((Boolean) row[7]);
                      n.setPrioridad(((Number) row[8]).intValue());
                      n.setUrlDestino((String) row[9]);
                      n.setParaTodos((Boolean) row[10]);
                      if (row[11] != null) {
                          Users creador = new Users();
                          creador.setIdUsuarios(((Number) row[11]).longValue());
                          n.setUsuarioCreador(creador);
                      }
                       if (row[12] != null) {
                           Users destino = new Users();
                           destino.setIdUsuarios(((Number) row[12]).longValue());
                           n.setUsuarioDestino(destino);
                       }
                       n.setLeido(row[13] != null ? (Boolean) row[13] : false);
                       return n;
                  })
                  .toList();

        Long total = entityManager.createQuery(
                "SELECT COUNT(n) FROM Notificacion n WHERE n.activo = true " +
                        "AND (n.paraTodos = true OR n.usuarioDestino.idUsuarios = :userId) " +
                        "AND n.fechaPublicacion IS NOT NULL " +
                        "AND (n.fechaExpiracion IS NULL OR n.fechaExpiracion > :now) ",
                 Long.class)
                 .setParameter("userId", userId)
                 .setParameter("now", now)
                 .getSingleResult();

        return new org.springframework.data.domain.PageImpl<>(content, pageable, total);
    }

    public Page<Notificacion> listarActivasPublicas(Pageable pageable) {
        return repo.findPublicActivesYPublicadas(LocalDateTime.now(), pageable);
    }

    public Long contarActivasParaUsuario(User usuario) {
        Users appUser = usersRepository.findByUsername(usuario.getUsername());
        if (appUser == null) return 0L;
        return contarActivasParaUsuarioApp(appUser);
    }

    /**
     * Count active notifications for given Users app entity.
     * Uses native query to avoid type mismatch.
     */
    @Transactional(readOnly = true)
    public Long contarActivasParaUsuarioApp(Users usuarioApp) {
        Long userId = usuarioApp.getIdUsuarios();
        LocalDateTime now = LocalDateTime.now();
        return entityManager.createQuery(
                "SELECT COUNT(n) FROM Notificacion n WHERE n.activo = true " +
                        "AND (n.paraTodos = true OR n.usuarioDestino.idUsuarios = :userId) " +
                        "AND n.fechaPublicacion IS NOT NULL " +
                        "AND (n.fechaExpiracion IS NULL OR n.fechaExpiracion > :now) ",
                Long.class)
                .setParameter("userId", userId)
                .setParameter("now", now)
                .getSingleResult();
    }

    public Notificacion publicar(Long id) {
        return repo.findById(id).map(n -> {
            n.setFechaPublicacion(LocalDateTime.now());
            n.setActivo(true);
            return repo.save(n);
        }).orElse(null);
    }

    public Notificacion despublicar(Long id) {
        return repo.findById(id).map(n -> {
            n.setFechaPublicacion(null);
            return repo.save(n);
        }).orElse(null);
    }

    @Transactional
    public Notificacion marcarComoLeido(Long id, Users usuario) {
        if (usuario == null || usuario.getIdUsuarios() == null) {
            return null;
        }

        return repo.findById(id).map(n -> {
            if (!puedeMarcarComoLeido(n, usuario)) {
                return null;
            }
            n.setLeido(true);
            return repo.save(n);
        }).orElse(null);
    }

    private boolean puedeMarcarComoLeido(Notificacion notificacion, Users usuario) {
        if (notificacion == null || usuario == null || usuario.getIdUsuarios() == null) {
            return false;
        }
        if (Boolean.TRUE.equals(notificacion.getParaTodos())) {
            return true;
        }
        return notificacion.getUsuarioDestino() != null
                && usuario.getIdUsuarios().equals(notificacion.getUsuarioDestino().getIdUsuarios());
    }

    public NotificacionAuthDTO convertToAuthDTO(Notificacion n) {
        NotificacionAuthDTO dto = new NotificacionAuthDTO();
        dto.setId(n.getId());
        dto.setTitulo(n.getTitulo());
        dto.setMensaje(n.getMensaje());
        dto.setTipo(n.getTipo() != null ? n.getTipo().name() : null);
        dto.setFechaCreacion(n.getFechaCreacion());
        dto.setFechaPublicacion(n.getFechaPublicacion());
        dto.setFechaExpiracion(n.getFechaExpiracion());
        dto.setActivo(n.getActivo());
        dto.setPrioridad(n.getPrioridad());
        dto.setUrlDestino(n.getUrlDestino());
        dto.setParaTodos(n.getParaTodos());
        dto.setLeido(n.getLeido() != null ? n.getLeido() : false);
        if (n.getUsuarioCreador() != null) {
            dto.setUsuarioCreadorUsername(n.getUsuarioCreador().getUsername());
        }
        if (n.getUsuarioDestino() != null) {
            dto.setUsuarioDestinoUsername(n.getUsuarioDestino().getUsername());
        }
        return dto;
    }

    /**
     * Delegate to UsersRepository to resolve the app Users entity by username.
     */
    public Users getUserByUsername(String username) {
        return usersRepository.findByUsername(username);
    }

    /**
     * Convert a page of Notificacion entities to the auth DTO list.
     */
    @SuppressWarnings("unused")
    public List<NotificacionAuthDTO> getActiveForUserAsDTO(Users usuarioApp, Pageable pageable) {
        return listarActivasParaUsuarioApp(usuarioApp, pageable).getContent().stream()
                .map(n -> {
                    NotificacionAuthDTO dto = new NotificacionAuthDTO();
                    dto.setId(n.getId());
                    dto.setTitulo(n.getTitulo());
                    dto.setMensaje(n.getMensaje());
                    dto.setTipo(n.getTipo() != null ? n.getTipo().name() : null);
                    dto.setFechaCreacion(n.getFechaCreacion());
                    dto.setFechaPublicacion(n.getFechaPublicacion());
                    dto.setFechaExpiracion(n.getFechaExpiracion());
                    dto.setActivo(n.getActivo());
                    dto.setPrioridad(n.getPrioridad());
                    dto.setUrlDestino(n.getUrlDestino());
                    dto.setParaTodos(n.getParaTodos());
                    dto.setLeido(n.getLeido() != null ? n.getLeido() : false);
                    if (n.getUsuarioCreador() != null) {
                        dto.setUsuarioCreadorUsername(n.getUsuarioCreador().getUsername());
                    }
                    if (n.getUsuarioDestino() != null) {
                        dto.setUsuarioDestinoUsername(n.getUsuarioDestino().getUsername());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
