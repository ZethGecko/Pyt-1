package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "roles")
public class Roles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50, unique = true)
    private String name;

    @Column(name = "description", length = 200)
    private String description;

    @Column(name = "hierarchy_level", nullable = false)
    private Integer hierarchyLevel;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    @Column(name = "can_view_all_data", nullable = false)
    private Boolean canViewAllData = false;

    @Column(name = "can_manage_all_data", nullable = false)
    private Boolean canManageAllData = false;

    @Column(name = "can_edit_own_data", nullable = false)
    private Boolean canEditOwnData = false;

    @Column(name = "can_create_data", nullable = false)
    private Boolean canCreateData = false;

    @Column(name = "can_delete_data", nullable = false)
    private Boolean canDeleteData = false;

    @Column(name = "can_manage_users", nullable = false)
    private Boolean canManageUsers = false;

     @Column(name = "table_permissions", columnDefinition = "jsonb")
     @JdbcTypeCode(SqlTypes.JSON)
     private Map<String, Object> tablePermissions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Relación con Users
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Users> users;

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

    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }

    public Boolean getCanViewAllData() { return canViewAllData; }
    public void setCanViewAllData(Boolean canViewAllData) { this.canViewAllData = canViewAllData; }

    public Boolean getCanManageAllData() { return canManageAllData; }
    public void setCanManageAllData(Boolean canManageAllData) { this.canManageAllData = canManageAllData; }

    public Boolean getCanEditOwnData() { return canEditOwnData; }
    public void setCanEditOwnData(Boolean canEditOwnData) { this.canEditOwnData = canEditOwnData; }

    public Boolean getCanCreateData() { return canCreateData; }
    public void setCanCreateData(Boolean canCreateData) { this.canCreateData = canCreateData; }

    public Boolean getCanDeleteData() { return canDeleteData; }
    public void setCanDeleteData(Boolean canDeleteData) { this.canDeleteData = canDeleteData; }

    public Boolean getCanManageUsers() { return canManageUsers; }
    public void setCanManageUsers(Boolean canManageUsers) { this.canManageUsers = canManageUsers; }

    public Map<String, Object> getTablePermissions() { return tablePermissions; }
    public void setTablePermissions(Map<String, Object> tablePermissions) { this.tablePermissions = tablePermissions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Users> getUsers() { return users; }
    public void setUsers(List<Users> users) { this.users = users; }
}
