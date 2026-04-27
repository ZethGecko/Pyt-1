package com.example.demo.dto;

public class UserProfile {
    private Long id;
    private String username;
    private String email;
    private Boolean active;
    private String lastLogin;
    private String createdAt;
    private String updatedAt;
    private DepartamentoResponseDTO departamento;
    private RolResponseDTO role;

    public UserProfile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public DepartamentoResponseDTO getDepartamento() {
        return departamento;
    }

    public void setDepartamento(DepartamentoResponseDTO departamento) {
        this.departamento = departamento;
    }

    public RolResponseDTO getRole() {
        return role;
    }

    public void setRole(RolResponseDTO role) {
        this.role = role;
    }
}
