package com.example.demo.dto;

public class RolResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Integer hierarchyLevel;
    private Boolean enabled;
    private Boolean canManageUsers;

    public RolResponseDTO() {
    }

    public RolResponseDTO(Long id, String name, String description, Integer hierarchyLevel, Boolean enabled, Boolean canManageUsers) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.hierarchyLevel = hierarchyLevel;
        this.enabled = enabled;
        this.canManageUsers = canManageUsers;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getHierarchyLevel() { return hierarchyLevel; }
    public void setHierarchyLevel(Integer hierarchyLevel) { this.hierarchyLevel = hierarchyLevel; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Boolean getCanManageUsers() { return canManageUsers; }
    public void setCanManageUsers(Boolean canManageUsers) { this.canManageUsers = canManageUsers; }
}
