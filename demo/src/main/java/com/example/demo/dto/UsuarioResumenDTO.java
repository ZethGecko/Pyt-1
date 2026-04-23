package com.example.demo.dto;

public class UsuarioResumenDTO {
    private Long id;
    private String username;
    private String email;
    private RolResponseDTO role;
    private Boolean activo;
    private Boolean asignado;

    public UsuarioResumenDTO() {}

    public UsuarioResumenDTO(Long id, String username, String email, RolResponseDTO role, Boolean activo, Boolean asignado) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.activo = activo;
        this.asignado = asignado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public RolResponseDTO getRole() { return role; }
    public void setRole(RolResponseDTO role) { this.role = role; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Boolean getAsignado() { return asignado; }
    public void setAsignado(Boolean asignado) { this.asignado = asignado; }
}
