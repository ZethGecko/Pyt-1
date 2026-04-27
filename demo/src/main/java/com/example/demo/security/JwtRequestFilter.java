package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;

import java.io.IOException;
import java.util.Collections;

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
        System.out.println("[JwtRequestFilter] Path: " + request.getServletPath() + ", Method: " + request.getMethod() + ", Authorization header: " + authorizationHeader);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith(HEADER_PREFIX)) {
            jwt = authorizationHeader.substring(HEADER_PREFIX.length());
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

      @Override
      protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
          String path = request.getServletPath();
          String method = request.getMethod();
          System.out.println("[JwtRequestFilter] Checking shouldNotFilter for path: " + path + ", method: " + method);
          // Permitir acceso a endpoints públicos, preflight OPTIONS y recursos estáticos
          if ("OPTIONS".equalsIgnoreCase(method) ||
              path.startsWith("/actuator") ||
              path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") ||
              // Públicos
              path.startsWith("/api/auth/") ||
              path.startsWith("/api/tipos-tramite/publico") ||
              path.startsWith("/api/tramites/publico/") ||
              path.startsWith("/api/tramites/buscar/enriquecidos") ||
              path.startsWith("/api/tramites/enriquecidos") ||
              path.startsWith("/api/rutas/buscar") ||
              path.startsWith("/api/empresas") ||
              path.startsWith("/api/puntos") ||
              path.startsWith("/api/grupos-presentacion/") ||
              path.startsWith("/api/parametros-inspeccion/") ||
              path.startsWith("/api/fichas-inspeccion/") ||
              // Recursos estáticos
              path.equals("/") || path.startsWith("/index.html") || path.startsWith("/assets/") ||
              path.startsWith("/manifest.json") || path.startsWith("/favicon.ico")) {
              System.out.println("[JwtRequestFilter] Path " + path + " should NOT be filtered");
              return true;
          }
          System.out.println("[JwtRequestFilter] Path " + path + " SHOULD be filtered");
          return false;
      }
}
