package com.example.demo.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsersRepository usersRepository;

    private static final String HEADER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        boolean hasAuthorizationHeader = authorizationHeader != null && !authorizationHeader.isBlank();
        System.out.println("[JwtRequestFilter] Path: " + request.getServletPath() + ", Method: " + request.getMethod() + ", Authorization header present: " + hasAuthorizationHeader);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith(HEADER_PREFIX)) {
            jwt = authorizationHeader.substring(HEADER_PREFIX.length());
        } else if (pathAllowsTokenQuery(request.getServletPath(), request.getMethod())) {
            String tokenParam = request.getParameter("token");
            if (tokenParam != null && !tokenParam.isBlank()) {
                jwt = tokenParam;
            }
        }

        if (jwt != null && !jwt.isBlank()) {
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("[JwtRequestFilter] Token válido extraído, username: " + username);
            } catch (Exception e) {
                System.out.println("[JwtRequestFilter] Error extrayendo username del token: " + e.getMessage());
            }
        } else {
            System.out.println("[JwtRequestFilter] No hay token Bearer");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Users user = usersRepository.findByUsername(username);
                if (user == null) {
                    System.out.println("[JwtRequestFilter] Usuario no encontrado: " + username);
                    return;
                }
                if (!Boolean.TRUE.equals(user.getActive())) {
                    System.out.println("[JwtRequestFilter] Usuario inactivo: " + username);
                    return;
                }
                Integer tokenVersion = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
                System.out.println("[JwtRequestFilter] Usuario encontrado: " + user.getUsername() + ", Role: " + user.getRole().getName() + ", TokenVersion DB: " + tokenVersion);
                
                // Validar token con tokenVersion de la DB
                if (jwtUtil.validateToken(jwt, tokenVersion)) {
                    System.out.println("[JwtRequestFilter] Token validado correctamente, estableciendo autenticación");
                 // Construir UserDetails a partir del usuario
                     UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                             user.getUsername(),
                             user.getPassword(),
                             Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().getName()))
                     );
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    System.out.println("[JwtRequestFilter] Autenticación establecida para: " + username + " con roles: " + userDetails.getAuthorities());
                } else {
                    System.out.println("[JwtRequestFilter] Token inválido o expirado (tokenVersion mismatch)");
                }
            } catch (Exception e) {
                System.out.println("[JwtRequestFilter] Error en validación de token: " + e.getMessage());
                e.printStackTrace();
            }
        } else if (username == null) {
            System.out.println("[JwtRequestFilter] Username es null, no se establecerá autenticación");
        } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
            System.out.println("[JwtRequestFilter] Autenticación ya existente: " + SecurityContextHolder.getContext().getAuthentication());
        }
        chain.doFilter(request, response);
    }

    private boolean pathAllowsTokenQuery(String path, String method) {
        return "/api/auth/notificaciones/stream".equals(path) && "GET".equalsIgnoreCase(method);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
            String path = request.getServletPath();
            String method = request.getMethod();
            System.out.println("[JwtRequestFilter] Checking shouldNotFilter for path: " + path + ", method: " + method);
            // Permitir acceso a endpoints públicos sin token, preflight OPTIONS y recursos estáticos.
            // Importante: /api/auth/notificaciones/** NO se excluye aquí — si el cliente envía
            // un token Bearer, el filtro JWT DEBE procesarlo para establecer Authentication.
            if ("OPTIONS".equalsIgnoreCase(method) ||
                path.startsWith("/actuator") ||
                path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") ||
                // Auth público (NO incluye /notificaciones aquí para que el JWT se procese)
                path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/auth/logout") ||
                path.startsWith("/api/auth/validate") ||
                // Recursos públicos
                path.startsWith("/api/tipos-tramite/publico") ||
                path.startsWith("/api/tramites/publico/") ||
                path.startsWith("/api/tramites/buscar/enriquecidos") ||
                path.startsWith("/api/tramites/enriquecidos") ||
                path.startsWith("/api/rutas/buscar") ||
                ((path.equals("/api/empresas") || path.startsWith("/api/empresas/")) && "GET".equalsIgnoreCase(method)) ||
                path.startsWith("/api/puntos") ||
                // Recursos públicos de publicaciones (GET público; POST protegido por SecurityConfig)
                (path.startsWith("/api/publicaciones") && "GET".equalsIgnoreCase(method)) ||
                // Recursos estáticos
                path.equals("/") || path.startsWith("/index.html") || path.startsWith("/assets/") ||
                path.startsWith("/manifest.json") || path.startsWith("/favicon.ico")) {
                System.out.println("[JwtRequestFilter] Path " + path + " should NOT be filtered (public endpoint)");
                return true;
            }
            System.out.println("[JwtRequestFilter] Path " + path + " SHOULD be filtered (JWT required or will be checked if token present)");
            return false;
        }
}
