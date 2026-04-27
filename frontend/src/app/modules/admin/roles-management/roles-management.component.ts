import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, Role, TablePermissions, CreateRoleRequest, TablePermissionsMap } from '../../../core/auth/services/user.service';
import { NotificationService } from '../../../shared/services/notification.service';

interface RoleWithPermissions extends Role {
  tablePermissionsObj?: TablePermissionsMap;
}

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './roles-management.component.html',
  styleUrls: ['./roles-management.component.scss']
})
export class RolesManagementComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  // Signals
  roles = signal<RoleWithPermissions[]>([]);
  loading = signal<boolean>(false);
  selectedRole = signal<RoleWithPermissions | null>(null);
  showModal = signal<boolean>(false);
  showPermissionsModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  
  // 🎯 PAGINACIÓN
  currentPage = 0;
  pageSize = 10;
  
  get page(): number { return this.currentPage; }
  get totalPages(): number { return Math.ceil(this.roles().length / this.pageSize); }
  get totalElements(): number { return this.roles().length; }
  get cambiarPaginaFn(): (p: number) => void { return this.cambiarPagina.bind(this); }
  
  cambiarPagina(page: number): void {
    this.currentPage = page;
  }
  
  // 🎯 Getter para roles paginados
  get rolesPaginados(): RoleWithPermissions[] {
    const start = this.currentPage * this.pageSize;
    return this.roles().slice(start, start + this.pageSize);
  }
  
  // Form data
  formData = signal<CreateRoleRequest>({
    name: '',
    description: '',
    hierarchyLevel: 2,
    tablePermissions: {},
    canManageUsers: false,
    canManageAllData: false,
    canViewAllData: true,
    canEditOwnData: true,
    canCreateData: false,
    canDeleteData: false
  });

  // Available tables for permissions
  availableTables = [
    { name: 'categoria_transporte', label: 'Categorías de Transporte' },
    { name: 'tipo_transporte', label: 'Tipos de Transporte' },
    { name: 'subtipo_transporte', label: 'Subtipos de Transporte' },
    { name: 'empresa', label: 'Empresas' },
     { name: 'vehiculo', label: 'Vehículos' },
     { name: 'tuc', label: 'TUCs' },
     { name: 'tupac', label: 'TUPAC' },
     { name: 'requisito', label: 'Requisitos' },
     { name: 'tramite', label: 'Trámites' },
     { name: 'expediente', label: 'Expedientes' },
     { name: 'inspeccion', label: 'Inspecciones' },
     { name: 'publicacion', label: 'Publicaciones' },
     { name: 'formato', label: 'Formatos' },
     { name: 'usuario', label: 'Usuarios' },
     { name: 'rol', label: 'Roles' },
     { name: 'departamento', label: 'Departamentos' }
  ];

  // Hierarchy levels (Nivel 1 is system-only, not creatable)
  hierarchyLevels = [
    { value: 2, label: 'Nivel 2 - Administrador' },
    { value: 3, label: 'Nivel 3 - Gerente' },
    { value: 50, label: 'Nivel 50 - Operador' },
    { value: 100, label: 'Nivel 100 - Usuario Básico' }
  ];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.userService.getAllRoles().subscribe({
      next: (response) => {
        const rolesData = response.roles || [];
        this.roles.set(rolesData.map(r => ({
          ...r,
          tablePermissionsObj: r.tablePermissions || {}
        })));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.notificationService.error('Error al cargar roles', 'Error');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formData.set({
      name: '',
      description: '',
      hierarchyLevel: 2,
      tablePermissions: {},
      canManageUsers: false,
      canManageAllData: false,
      canViewAllData: true,
      canEditOwnData: true,
      canCreateData: false,
      canDeleteData: false
    });
    this.showModal.set(true);
  }

  openEditModal(role: RoleWithPermissions): void {
    this.isEditing.set(true);
    this.selectedRole.set(role);
    this.formData.set({
      name: role.name,
      description: role.description || '',
      hierarchyLevel: role.hierarchyLevel || 100,
      tablePermissions: role.tablePermissions || {},
      canManageUsers: role.canManageUsers || false,
      canManageAllData: role.canManageAllData || false,
      canViewAllData: role.canViewAllData ?? true,
      canEditOwnData: role.canEditOwnData ?? true,
      canCreateData: role.canCreateData || false,
      canDeleteData: role.canDeleteData || false
    });
    this.showModal.set(true);
  }

  openPermissionsModal(role: RoleWithPermissions): void {
    this.selectedRole.set(role);
    // Initialize table permissions if not exists
    if (!role.tablePermissions) {
      role.tablePermissions = {};
    }
    this.showPermissionsModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedRole.set(null);
  }

  closePermissionsModal(): void {
    this.showPermissionsModal.set(false);
  }

  saveRole(): void {
    const data = this.formData();
    
    // Transformar nombre a mayúsculas con guiones bajos
    if (data.name) {
      data.name = data.name.toUpperCase().replace(/\s+/g, '_');
    }
    
    if (this.isEditing()) {
      const role = this.selectedRole();
      if (!role) return;
      
      this.userService.updateRole(role.id, data).subscribe({
        next: () => {
          this.notificationService.success('Rol actualizado exitosamente', 'Éxito');
          this.loadRoles();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating role:', err);
          const errorMsg = err.error?.message || 'Error al actualizar rol';
          this.notificationService.error(errorMsg, 'Error');
        }
      });
    } else {
      this.userService.createRole(data).subscribe({
        next: (createdRole) => {
          this.notificationService.success('Rol creado exitosamente', 'Éxito');
          // Agregar el nuevo rol a la lista actual sin necesidad de recargar
          const currentRoles = this.roles();
          // Convertir a RoleWithPermissions y agregar
          const newRoleWithPermissions: RoleWithPermissions = {
            ...createdRole,
            tablePermissionsObj: createdRole.tablePermissions || {}
          };
          this.roles.set([...currentRoles, newRoleWithPermissions].sort(
            (a, b) => (a.hierarchyLevel || 0) - (b.hierarchyLevel || 0)
          ));
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating role:', err);
          const errorMsg = err.error?.message || 'Error al crear rol';
          this.notificationService.error(errorMsg, 'Error');
        }
      });
    }
  }

  toggleRoleStatus(role: RoleWithPermissions): void {
    const newStatus = !role.enabled;
    this.userService.toggleRoleStatus(role.id, newStatus).subscribe({
      next: () => {
        this.loadRoles();
        const estado = newStatus ? 'activado' : 'desactivado';
        this.notificationService.success(`Rol ${estado} exitosamente`, 'Éxito');
      },
      error: (err) => {
        console.error('Error toggling role status:', err);
        this.notificationService.error('Error al cambiar estado del rol', 'Error');
      }
    });
  }

  getTablePermission(role: RoleWithPermissions, tableName: string): TablePermissions {
    return role.tablePermissions?.[tableName] || {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      canManage: false
    };
  }

  updateTablePermission(tableName: string, permission: string, value: boolean): void {
    const role = this.selectedRole();
    if (!role) return;
    
    if (!role.tablePermissions) {
      role.tablePermissions = {};
    }
    
    if (!role.tablePermissions[tableName]) {
      role.tablePermissions[tableName] = {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canManage: false
      };
    }
    
    (role.tablePermissions[tableName] as any)[permission] = value;
  }

  saveTablePermissions(): void {
    const role = this.selectedRole();
    if (!role || !role.tablePermissions) return;

    // Save each table permission
    const savePromises = Object.entries(role.tablePermissions).map(([tableName, permissions]) =>
      this.userService.updateTablePermissions(role.id, tableName, permissions).toPromise()
    );

    Promise.all(savePromises).then(() => {
      this.loadRoles();
      this.closePermissionsModal();
      this.notificationService.success('Permisos de tabla guardados exitosamente', 'Éxito');
    }).catch(err => {
      console.error('Error saving permissions:', err);
      this.notificationService.error('Error al guardar permisos de tabla', 'Error');
    });
  }

  getHierarchyLabel(level: number | undefined): string {
    const found = this.hierarchyLevels.find(h => h.value === level);
    return found ? found.label : `Nivel ${level}`;
  }

  getStatusClass(enabled: boolean | undefined): string {
    return enabled ? 'badge-success' : 'badge-danger';
  }

  getStatusText(enabled: boolean | undefined): string {
    return enabled ? 'Activo' : 'Inactivo';
  }

  clearMessages(): void {
    // Método mantenido por compatibilidad pero no hace nada ya que usamos NotificationService
  }

  isSystemRole(role: RoleWithPermissions): boolean {
    return role.isSystem || false;
  }
}
