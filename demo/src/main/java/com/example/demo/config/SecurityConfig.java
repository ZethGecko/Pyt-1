package com.example.demo.config;

import com.example.demo.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:4200", "http://localhost:3000", "http://localhost", "http://localhost:80", "http://127.0.0.1:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization");
            }
        };
    }

    @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .cors()  // Enable CORS support
                .and()
                .csrf().disable()
                  .authorizeHttpRequests(auth -> auth
                       .requestMatchers("/api/auth/login").permitAll()
                       .requestMatchers("/api/auth/refresh").permitAll()
                       .requestMatchers("/api/auth/logout").permitAll()
                       .requestMatchers("/api/auth/validate").permitAll()
                        .requestMatchers("/api/auth/notificaciones/**").permitAll()
                         .requestMatchers(HttpMethod.GET, "/api/publicaciones", "/api/publicaciones/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/publicaciones").hasAnyRole("ADMIN", "SUPER_ADMIN")
                       .requestMatchers("/api/tipos-tramite/publico").permitAll()
                      .requestMatchers("/api/tramites/publico/**").permitAll()
                      .requestMatchers("/api/tramites/buscar/enriquecidos").permitAll()
                      .requestMatchers("/api/tramites/enriquecidos").permitAll()
                       .requestMatchers("/api/rutas/buscar").permitAll()
                       .requestMatchers("/api/rutas/debug/**").permitAll()
                       .requestMatchers("/api/puntos").permitAll()
                       .requestMatchers("/api/puntos/**").permitAll()
                       .requestMatchers("/api/empresas").permitAll()
                       .requestMatchers("/api/empresas/**").permitAll()
                        .requestMatchers("/api/expedientes").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/expedientes/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/instancias-tramite/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/documentos-tramite/**").hasAnyRole("ADMIN", "SUPER_ADMIN", "INSPECTOR", "TRAMITES")
                        .requestMatchers("/api/grupos-presentacion/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/configuracion-examen/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/inscripcion-examen/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/inspecciones/publico", "/api/inspecciones/publico/**", "/api/inspecciones/{inspeccionId}/vehiculos").permitAll()
                        .requestMatchers("/api/inspecciones/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/fichas-inspeccion/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/formatos-inspeccion/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/parametros-inspeccion/**").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/imagenes-sitio/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/imagenes-sitio/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/imagenes-sitio/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/actuator/**").permitAll()
                      .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                      // Auditoría - solo para SUPER_ADMIN
                      .requestMatchers("/api/audit/**").hasRole("SUPER_ADMIN")
                      // Recursos estáticos del frontend
                      .requestMatchers("/", "/index.html", "/favicon.ico", "/manifest.json", "/assets/**").permitAll()
                      .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                      .anyRequest().authenticated()
                  )
               .sessionManagement(session -> session
                   .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
               );

           http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

           return http.build();
       }
}
