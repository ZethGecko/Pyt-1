 package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

      @PostMapping("/login")
      public ResponseEntity<?> createAuthenticationToken(@RequestBody Map<String, String> credentials) {
          String username = credentials.get("username");
          String password = credentials.get("password");

          if (username == null || password == null) {
              return ResponseEntity.badRequest().body(Map.of(
                  "success", false,
                  "message", "Usuario y contraseña requeridos"
              ));
          }

          try {
              authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
          } catch (Exception e) {
              return ResponseEntity.status(401).body(Map.of(
                  "success", false,
                  "message", "Credenciales inválidas"
              ));
          }

          // Obtener el usuario completo para extraer id y rol
          Users user = usersRepository.findByUsername(username);
          if (user == null) {
              return ResponseEntity.status(401).body(Map.of(
                  "success", false,
                  "message", "Usuario no encontrado"
              ));
          }

          // Build role object matching UserProfile expectations
          Map<String, Object> roleMap = new HashMap<>();
          if (user.getRole() != null) {
              roleMap.put("id", user.getRole().getId());
              roleMap.put("name", user.getRole().getName());
              roleMap.put("description", user.getRole().getDescription());
              roleMap.put("level", user.getRole().getHierarchyLevel());
          } else {
              roleMap.put("name", "USER");
              roleMap.put("level", 100);
          }

          // Build departamento object if exists
          Map<String, Object> departamentoMap = null;
          if (user.getDepartamento() != null) {
              departamentoMap = new HashMap<>();
              departamentoMap.put("id", user.getDepartamento().getIdDepartamento());
              departamentoMap.put("nombre", user.getDepartamento().getNombre());
              departamentoMap.put("descripcion", user.getDepartamento().getDescripcion());
              departamentoMap.put("activo", user.getDepartamento().getActivo());
          }

          // Build user response matching UserProfile
          Map<String, Object> userResponse = new HashMap<>();
          userResponse.put("id", user.getIdUsuarios());
          userResponse.put("username", user.getUsername());
          userResponse.put("email", user.getEmail() != null ? user.getEmail() : "");
          userResponse.put("active", user.getActive());
          userResponse.put("role", roleMap);
          if (departamentoMap != null) {
              userResponse.put("departamento", departamentoMap);
          }

            String roleName = user.getRole() != null ? user.getRole().getName() : "USER";
            Integer tokenVersion = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
            final String token = jwtUtil.generateToken(username, user.getIdUsuarios(), roleName, tokenVersion);

          return ResponseEntity.ok(Map.of(
                  "success", true,
                  "token", token,
                  "user", userResponse
          ));
      }

      @PostMapping("/refresh")
      public ResponseEntity<?> refreshToken(@RequestHeader(value = "X-Refresh-Token", required = false) String refreshTokenHeader) {
          String refreshToken = refreshTokenHeader;
          if (refreshToken == null) {
              return ResponseEntity.status(401).body(Map.of(
                  "success", false,
                  "message", "Refresh token requerido"
              ));
          }
          String username = jwtUtil.extractUsername(refreshToken);
          try {
              Users user = usersRepository.findByUsername(username);
              if (user == null) {
                  return ResponseEntity.status(401).body(Map.of(
                      "success", false,
                      "message", "Usuario no encontrado"
                  ));
              }
              Integer tokenVersion = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
              if (!jwtUtil.validateToken(refreshToken, tokenVersion)) {
                  return ResponseEntity.status(401).body(Map.of(
                      "success", false,
                      "message", "Refresh token inválido o expirado"
                  ));
              }
          } catch (Exception e) {
              return ResponseEntity.status(401).body(Map.of(
                  "success", false,
                  "message", "Refresh token inválido"
              ));
          }
          Users user = usersRepository.findByUsername(username);
          if (user == null) {
              return ResponseEntity.status(401).body(Map.of(
                  "success", false,
                  "message", "Usuario no encontrado"
              ));
          }
           String role = user.getRole() != null ? user.getRole().getName() : "USER";
           Integer tokenVersion = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
           String newAccessToken = jwtUtil.generateToken(username, user.getIdUsuarios(), role, tokenVersion);
          return ResponseEntity.ok(Map.of(
              "success", true,
              "token", newAccessToken,
              "refreshToken", refreshToken
          ));
      }

     @PostMapping("/logout")
     public ResponseEntity<?> logout() {
         return ResponseEntity.ok(Map.of(
             "success", true,
             "message", "Logout exitoso"
         ));
     }

      @GetMapping("/validate")
      public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
          if (authHeader == null || !authHeader.startsWith("Bearer ")) {
              return ResponseEntity.status(401).body(Map.of("valid", false));
          }
          String token = authHeader.substring(7);
          try {
              String username = jwtUtil.extractUsername(token);
              Users user = usersRepository.findByUsername(username);
              if (user == null) {
                  return ResponseEntity.status(401).body(Map.of("valid", false));
              }
              Integer tokenVersion = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
              boolean isValid = jwtUtil.validateToken(token, tokenVersion);
              return ResponseEntity.ok(Map.of("valid", isValid));
          } catch (Exception e) {
              return ResponseEntity.status(401).body(Map.of("valid", false));
          }
      }
 }

