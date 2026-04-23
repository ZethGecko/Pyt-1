package com.example.demo.dto;

import com.example.demo.model.Roles;

public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private Integer hierarchyLevel;
    private Integer level;
    private Boolean isSystem;
    private Boolean enabled;
    private Boolean canManageUsers;
    private Object tablePermissions;

    public RoleDTO() {
    }

    public RoleDTO(Roles role) {
        this.id = role.getId();
        this.name = role.getName();
        this.description = role.getDescription();
        this.hierarchyLevel = role.getHierarchyLevel();
        this.isSystem = role.getIsSystem();
        this.enabled = role.getEnabled();
        this.canManageUsers = role.getCanManageUsers();
        this.tablePermissions = role.getTablePermissions();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getHierarchyLevel() {
        return hierarchyLevel;
    }

    public void setHierarchyLevel(Integer hierarchyLevel) {
        this.hierarchyLevel = hierarchyLevel;
    }

    public Integer getLevel() {
        return level != null ? level : hierarchyLevel;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Boolean getIsSystem() {
        return isSystem;
    }

    public void setIsSystem(Boolean isSystem) {
        this.isSystem = isSystem;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Boolean getCanManageUsers() {
        return canManageUsers;
    }

    public void setCanManageUsers(Boolean canManageUsers) {
        this.canManageUsers = canManageUsers;
    }

    public Object getTablePermissions() {
        return tablePermissions;
    }

    public void setTablePermissions(Object tablePermissions) {
        this.tablePermissions = tablePermissions;
    }
}
