package com.example.demo.controller;

import java.security.Principal;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.dto.NotificacionAuthDTO;
import com.example.demo.dto.NotificacionCountDTO;
import com.example.demo.model.Users;
import com.example.demo.service.NotificacionService;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/auth/notificaciones")
public class NotificacionAuthController {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * GET /api/auth/notificaciones/active
     * Returns notifications visible to the authenticated user:
     * - paraTodos = true  → broadcast to everyone
     * - paraTodos = false → only when usuarioDestino == current user
     * Requires authentication.
     */
    /**
     * Diagnóstico: consulta directa para ver qué hay en la tabla notificaciones
     */
    @GetMapping("/debug")
    public ResponseEntity<java.util.Map<String, Object>> debugNotificaciones(Authentication authentication) {
        java.util.LinkedHashMap<String, Object> result = new java.util.LinkedHashMap<>();
        
        if (authentication == null) {
            result.put("authentication", null);
            return ResponseEntity.ok(result);
        }
        
        String username = authentication.getName();
        result.put("username", username);
        
        Users currentUser = notificacionService.getUserByUsername(username);
        if (currentUser == null) {
            result.put("userFound", false);
            result.put("error", "Usuario no encontrado en BD: " + username);
            return ResponseEntity.ok(result);
        }
        
        Long userId = currentUser.getIdUsuarios();
        result.put("userId", userId);
        result.put("userFound", true);
        
        // Consulta 1: contar todas las notificaciones en la tabla
        Long total = notificacionRepository.count();
        result.put("totalNotificacionesEnTabla", total);
        
        // Consulta 2: contar notificaciones activas sin filtro de usuario
        Long activasCount = (Long) entityManager.createQuery(
            "SELECT COUNT(n) FROM Notificacion n WHERE n.activo = true").getSingleResult();
        result.put("notificacionesActivas", activasCount);
        
        // Consulta 3: contar con filtro para_todos
        Long paraTodosCount = (Long) entityManager.createQuery(
            "SELECT COUNT(n) FROM Notificacion n WHERE n.activo = true AND n.paraTodos = true").getSingleResult();
        result.put("paraTodosTrue", paraTodosCount);
        
        // Consulta 4: contar con filtro de fecha_publicacion
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        Long conFechaPub = (Long) entityManager.createQuery(
            "SELECT COUNT(n) FROM Notificacion n WHERE n.activo = true AND n.fechaPublicacion IS NOT NULL").getSingleResult();
        result.put("conFechaPublicacion", conFechaPub);
        
        // Consulta 5: contar completas (que cumplen todos los filtros de active)
        Long completas = (Long) entityManager.createQuery(
            "SELECT COUNT(n) FROM Notificacion n WHERE n.activo = true " +
            "AND (n.paraTodos = true OR n.usuarioDestino.idUsuarios = :userId) " +
            "AND n.fechaPublicacion IS NOT NULL " +
            "AND (n.fechaExpiracion IS NULL OR n.fechaExpiracion > :now)")
            .setParameter("userId", userId)
            .setParameter("now", now)
            .getSingleResult();
        result.put("cumplenFiltrosCompletos", completas);
        
        // Consulta 6: listar las notificaciones activas para el usuario (lo que devuelve el endpoint)
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<com.example.demo.model.Notificacion> page = 
            notificacionService.listarActivasParaUsuarioApp(currentUser, pageable);
        result.put("resultadoActive(" + page.getTotalElements() + ")", 
            page.getContent().stream().map(n -> {
                java.util.LinkedHashMap<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("id", n.getId());
                m.put("titulo", n.getTitulo());
                m.put("tipo", n.getTipo());
                m.put("paraTodos", n.getParaTodos());
                m.put("fechaPublicacion", n.getFechaPublicacion());
                m.put("fechaExpiracion", n.getFechaExpiracion());
                m.put("activo", n.getActivo());
                return m;
            }).toList());
        
        System.out.println("[NotificacionAuthController] DEBUG result: " + result);
        return ResponseEntity.ok(result);
    }

    @Autowired
    private com.example.demo.repository.NotificacionRepository notificacionRepository;
    
    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @GetMapping("/active")
    public ResponseEntity<List<NotificacionAuthDTO>> getActiveForCurrentUser(Authentication authentication) {
          System.out.println("[NotificacionAuthController] GET /auth/notificaciones/active called. Authentication: " + authentication);
          if (authentication == null) {
              System.out.println("[NotificacionAuthController] Authentication null, returning empty list");
              return ResponseEntity.ok(List.of());
          }
        String username = authentication.getName();
        System.out.println("[NotificacionAuthController] Authenticated username: " + username);
        Users currentUser = notificacionService.getUserByUsername(username);
        if (currentUser == null) {
            System.out.println("[NotificacionAuthController] User not found for username: " + username + ", returning empty list");
            return ResponseEntity.ok(List.of());
        }
        System.out.println("[NotificacionAuthController] User found: " + currentUser.getUsername() + " (id=" + currentUser.getIdUsuarios() + ")");
        return ResponseEntity.ok(
                notificacionService.getActiveForUserAsDTO(currentUser,
                        PageRequest.of(0, 100)));
    }

    /**
     * GET /api/auth/notificaciones/count
     * Returns the total number of active notifications for the authenticated user.
     * Used by sidebar badge and "undelivered on login" logic.
     */
    @GetMapping("/count")
      public ResponseEntity<NotificacionCountDTO> getCountForCurrentUser(Authentication authentication) {
          if (authentication == null) {
              return ResponseEntity.ok(new NotificacionCountDTO(0));
          }
        String username = authentication.getName();
        Users currentUser = notificacionService.getUserByUsername(username);
        if (currentUser == null) {
            return ResponseEntity.ok(new NotificacionCountDTO(0));
        }
        return ResponseEntity.ok(
                new NotificacionCountDTO(
                        notificacionService.contarActivasParaUsuarioApp(currentUser)));
    }

    // ── SSE Streaming ─────────────────────────────────────────
    /**
     * GET /api/auth/notificaciones/stream
     * Server-Sent Events stream — pushes new notification IDs to connected clients.
     * Clients reconnect automatically (EventSource retries).
     */
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Principal principal) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        this.emitters.add(emitter);

        // Auto-remove on completion / timeout / error
        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        emitter.onError((e) -> this.emitters.remove(emitter));

        return emitter;
    }

    /**
     * Call this method from any place that creates / publishes a notification
     * to push the update to all connected admin clients in real-time.
     */
    @SuppressWarnings("unused")
    public void broadcast(NotificacionAuthDTO notif) {
        for (SseEmitter emitter : this.emitters) {
            try {
                String json = objectMapper.writeValueAsString(notif);
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(json, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                System.err.println("[NotificacionAuthController] broadcast error for emitter, removing: " + e.getMessage());
                this.emitters.remove(emitter);
                try { emitter.complete(); } catch (Exception ignored) {}
            }
        }
    }
}
