package com.example.demo.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.NotificacionRequest;
import com.example.demo.dto.NotificacionResponse;
import com.example.demo.dto.NotificacionAuthDTO;
import com.example.demo.model.Notificacion;
import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import com.example.demo.service.NotificacionService;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

     @Autowired
     private NotificacionService notificacionService;
     @Autowired
     private UsersRepository usersRepository;
     @Autowired
     private NotificacionAuthController authNotifController;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<NotificacionResponse>> listarTodas() {
        List<Notificacion> notificaciones = notificacionService.listarTodas();
        return ResponseEntity.ok(notificaciones.stream().map(this::convertToResponse).toList());
    }

    @GetMapping("/active")
    public ResponseEntity<Page<NotificacionResponse>> listarActivas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        Pageable pageable = PageRequest.of(page, size);
        System.out.println("[NotificacionController] GET /notificaciones/active - page=" + page + ", size=" + size +
                ", principal=" + (principal != null ? principal.getName() : "null"));
        User user = (principal != null) ? (User) principal : null;
        Page<Notificacion> result;

        if (user != null && user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            System.out.println("[NotificacionController] Admin user detected, calling listarActivasParaUsuario");
            result = notificacionService.listarActivasParaUsuario(user, pageable);
        } else {
            System.out.println("[NotificacionController] Non-admin or unauthenticated user, calling listarActivasPublicas");
            result = notificacionService.listarActivasPublicas(pageable);
        }

        System.out.println("[NotificacionController] Result page: totalElements=" + result.getTotalElements() +
                ", contentSize=" + result.getContent().size());
        return ResponseEntity.ok(result.map(this::convertToResponse));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> contarActivas(Principal principal) {
        User user = (principal != null) ? (User) principal : null;
        Long count = (user != null) ? notificacionService.contarActivasParaUsuario(user) : 0L;
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<NotificacionResponse> obtenerPorId(@PathVariable Long id) {
        return notificacionService.buscarPorId(id)
                .map(n -> ResponseEntity.ok(convertToResponse(n)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<NotificacionResponse> crear(@RequestBody NotificacionRequest request, Principal principal) {
        Notificacion notificacion = new Notificacion();
        notificacion.setTitulo(request.getTitulo());
        notificacion.setMensaje(request.getMensaje());
        notificacion.setTipo(request.getTipo());
        notificacion.setFechaPublicacion(request.getFechaPublicacion());
        notificacion.setFechaExpiracion(request.getFechaExpiracion());
        notificacion.setPrioridad(request.getPrioridad());
        notificacion.setUrlDestino(request.getUrlDestino());
        notificacion.setParaTodos(request.getParaTodos() != null ? request.getParaTodos() : true);
        if (Boolean.TRUE.equals(notificacion.getParaTodos())) {
            notificacion.setUsuarioDestino(null);
        } else {
            Long usuarioDestinoId = request.getUsuarioDestinoId();
            if (usuarioDestinoId == null) {
                throw new IllegalArgumentException("usuarioDestinoId es obligatorio cuando paraTodos es false");
            }
            Users destinatario = usersRepository.findById(usuarioDestinoId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario destino no encontrado"));
            notificacion.setUsuarioDestino(destinatario);
        }

        if (principal != null) {
            // Obtener el usuario desde la base de datos
            Users creador = usersRepository.findByUsername(principal.getName());
            notificacion.setUsuarioCreador(creador);
        }

        Notificacion guardada = notificacionService.crear(notificacion);
        NotificacionResponse response = convertToResponse(guardada);
        authNotifController.broadcast(convertToAuthDTO(guardada));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<NotificacionResponse> actualizar(@PathVariable Long id, @RequestBody NotificacionRequest request) {
        Notificacion datos = new Notificacion();
        datos.setTitulo(request.getTitulo());
        datos.setMensaje(request.getMensaje());
        datos.setTipo(request.getTipo());
        datos.setFechaPublicacion(request.getFechaPublicacion());
        datos.setFechaExpiracion(request.getFechaExpiracion());
        datos.setPrioridad(request.getPrioridad());
        datos.setUrlDestino(request.getUrlDestino());
        datos.setParaTodos(request.getParaTodos());
        datos.setActivo(request.getActivo());
        if (Boolean.TRUE.equals(request.getParaTodos())) {
            datos.setUsuarioDestino(null);
        } else if (request.getUsuarioDestinoId() != null) {
            Users destinatario = usersRepository.findById(request.getUsuarioDestinoId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario destino no encontrado"));
            datos.setUsuarioDestino(destinatario);
        } else if (Boolean.FALSE.equals(request.getParaTodos())) {
            throw new IllegalArgumentException("usuarioDestinoId es obligatorio cuando paraTodos es false");
        }

        Notificacion actualizada = notificacionService.actualizar(id, datos);
        if (actualizada == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToResponse(actualizada));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        notificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publicar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<NotificacionResponse> publicar(@PathVariable Long id) {
        System.out.println("[NotificacionController] POST /notificaciones/" + id + "/publicar called");
        Notificacion notificacion = notificacionService.publicar(id);
        if (notificacion == null) {
            System.out.println("[NotificacionController] Notification " + id + " not found for publish");
            return ResponseEntity.notFound().build();
        }
        authNotifController.broadcast(convertToAuthDTO(notificacion));
        System.out.println("[NotificacionController] Notification " + id + " published: activo=" + notificacion.getActivo()
                + ", paraTodos=" + notificacion.getParaTodos()
                + ", fechaPublicacion=" + notificacion.getFechaPublicacion()
                + ", fechaExpiracion=" + notificacion.getFechaExpiracion());
        return ResponseEntity.ok(convertToResponse(notificacion));
    }

    @PostMapping("/{id}/despublicar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<NotificacionResponse> despublicar(@PathVariable Long id) {
        Notificacion notificacion = notificacionService.despublicar(id);
        if (notificacion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToResponse(notificacion));
    }

    private NotificacionResponse convertToResponse(Notificacion n) {
        NotificacionResponse r = new NotificacionResponse();
        r.setId(n.getId());
        r.setTitulo(n.getTitulo());
        r.setMensaje(n.getMensaje());
        r.setTipo(n.getTipo() != null ? n.getTipo().name() : null);
        r.setFechaCreacion(n.getFechaCreacion());
        r.setFechaPublicacion(n.getFechaPublicacion());
        r.setFechaExpiracion(n.getFechaExpiracion());
        r.setActivo(n.getActivo());
        r.setPrioridad(n.getPrioridad());
        r.setUrlDestino(n.getUrlDestino());
        r.setParaTodos(n.getParaTodos());
        if (n.getUsuarioCreador() != null) {
            r.setUsuarioCreadorUsername(n.getUsuarioCreador().getUsername());
        }
        if (n.getUsuarioDestino() != null) {
            r.setUsuarioDestinoUsername(n.getUsuarioDestino().getUsername());
        }
        r.setLeido(n.getLeido() != null ? n.getLeido() : false);
        return r;
    }

    private NotificacionAuthDTO convertToAuthDTO(Notificacion n) {
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
}
