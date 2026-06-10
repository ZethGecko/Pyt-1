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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.example.demo.dto.NotificacionAuthDTO;
import com.example.demo.dto.NotificacionCountDTO;
import com.example.demo.model.Notificacion;
import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import com.example.demo.service.NotificacionService;

@RestController
@RequestMapping("/api/auth/notificaciones")
public class NotificacionAuthController {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

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

    @PostMapping("/{id}/leer")
    public ResponseEntity<NotificacionAuthDTO> marcarComoLeido(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        Users currentUser = notificacionService.getUserByUsername(username);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        Notificacion notif = notificacionService.marcarComoLeido(id, currentUser);
        if (notif == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notificacionService.convertToAuthDTO(notif));
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
