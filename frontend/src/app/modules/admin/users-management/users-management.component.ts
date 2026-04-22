import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { UserService, Role, CreateUserRequest, UpdateUserRequest } from '../../../core/auth/services/user.service';
import { NotificationService } from '../../../shared/services/notification.service';

interface UserData {
  id: number;
  username: string;
  email: string;
  departamento?: {
    id: number;
    nombre: string;
  };
  role: any;
  active: boolean;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {
  authState = inject(AuthStateService);
  userService = inject(UserService);
  private notificationService = inject(NotificationService);

  // Datos
  usuarios = signal<UserData[]>([]);
  roles = signal<Role[]>([]);
  loading = signal(true);

  // Modal
  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingUserId = signal<number | null>(null);

   // Formulario
   formData = {
     username: '',
     email: '',
     password: '',
     confirmPassword: '',
     roleId: 0 as number | null,
     activo: true
   };

  // Alias for template compatibility
  get formulario() { return this.formData; }
  get mostrarModal() { return this.showModal(); }
  get modoCreacion() { return this.modalMode() === 'create'; }
  get cerrarModal() { return this.closeModal.bind(this); }
  get guardarUsuario() { return this.saveUser.bind(this); }
  
  // Pagination aliases
  get page() { return this.currentPage(); }
  get totalElements() { return this.filteredUsers.length; }
  get cambiarPagina() { return this.cambiarPaginaFn.bind(this); }
  
  // More aliases
  get cargando() { return this.loading(); }
  get getUsuariosFiltrados() { return () => this.filteredUsers; }
  get puedeEliminar(): boolean { return this.authState.hasRole('SUPER_ADMIN'); }
  
  // Current user
  get usuarioActual() { return this.authState['user'](); }
  
  // Alias properties for template
  get rolesList(): Role[] { return this.roles(); }
  
  // Filtered list showing only active roles for dropdown
  get activeRolesList(): Role[] {
    return this.roles().filter(role => role.enabled !== false);
  }
  
  // New aliases for template compatibility
  get terminoBusqueda(): string { return this.searchTerm(); }
  set terminoBusqueda(value: string) { this.searchTerm.set(value); }
  
  get cargarUsuarios() { return this.loadUsers.bind(this); }
  get totalUsuarios(): number { return this.usuarios().length; }
  get usuariosInactivos(): number { return this.usuarios().filter(u => !u.active).length; }
  get tuRol(): string { return this.rolActual; }

  // Filtros
  filtroRol = '';
  filtroActivo = '';

  // Helper properties
  get esAdmin(): boolean { return this.authState.hasRole('ADMIN') || this.authState.hasRole('SUPER_ADMIN'); }
  get esManager(): boolean { return this.authState.hasRole('MANAGER'); }
  get rolActual(): string { const u = this.authState['user'](); return u?.role?.name || 'Usuario'; }
  get puedeGestionar(): boolean { return this.authState.canManageUsers(); }

  // Búsqueda
  searchTerm = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = 10;

  usuariosActivos: number = 0;

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  cambiarPaginaFn(page: number): void {
    this.currentPage.set(page + 1);
  }

   loadUsers(): void {
     this.loading.set(true);
     
     this.userService.getAllUsers().subscribe({
       next: (response) => {
         if (response.success && response.users) {
            this.usuarios.set(response.users.map(u => ({
              id: u.id!,
              username: u.username,
              email: u.email || '',
              departamento: u.departamento,
              role: u.role as any,
              active: u.active ?? true
            })));
           this.calcularUsuariosActivos();
         }
         this.loading.set(false);
       },
       error: (err) => {
         console.error('Error cargando usuarios:', err);
         this.notificationService.error('Error al cargar usuarios', 'Error');
         this.loading.set(false);
       }
     });
   }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success && response.roles) {
          this.roles.set(response.roles);
          if (response.roles.length > 0) {
            this.formData.roleId = response.roles[0].id;
          }
        }
      },
      error: (err) => {
        console.error('Error cargando roles:', err);
        this.notificationService.error('Error al cargar roles', 'Error');
      }
    });
  }

  get filteredUsers(): UserData[] {
    const term = this.searchTerm().toLowerCase();
    let filtered = this.usuarios();
    
    if (term) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (typeof u.role === 'string' ? u.role : u.role.name).toLowerCase().includes(term)
      );
    }
    
    if (this.filtroRol) {
      filtered = filtered.filter(u => {
        const roleName = typeof u.role === 'string' ? u.role : u.role.name;
        return roleName === this.filtroRol;
      });
    }
    
    if (this.filtroActivo) {
      const activo = this.filtroActivo === 'activo';
      filtered = filtered.filter(u => u.active === activo);
    }
    
    return filtered;
  }

  get paginatedUsers(): UserData[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  calcularUsuariosActivos(): void {
    this.usuariosActivos = this.usuarios().filter(u => u.active).length;
  }

   // Abrir modal para crear
   openCreateModal(): void {
     this.modalMode.set('create');
     this.editingUserId.set(null);
     this.formData = {
       username: '',
       email: '',
       password: '',
       confirmPassword: '',
       roleId: this.roles().length > 0 ? this.roles()[0].id : null,
       activo: true
     };
     this.showModal.set(true);
   }

   // Abrir modal para editar
   openEditModal(user: UserData): void {
     this.modalMode.set('edit');
     this.editingUserId.set(user.id);
     const roleId = typeof user.role === 'string' ? 0 : user.role.id;
     this.formData = {
       username: user.username,
       email: user.email,
       password: '',
       confirmPassword: '',
       roleId: roleId,
       activo: user.active
     };
     this.showModal.set(true);
   }

   // Cerrar modal
   closeModal(): void {
     this.showModal.set(false);
     this.formData = {
       username: '',
       email: '',
       password: '',
       confirmPassword: '',
       roleId: null,
       activo: true
     };
   }

   // Guardar usuario (crear o editar)
   saveUser(): void {
     if (!this.formData.username || !this.formData.email || !this.formData.roleId) {
       this.notificationService.error('Por favor complete todos los campos requeridos', 'Validación');
       return;
     }

     if (this.modalMode() === 'create') {
       if (!this.formData.password) {
         this.notificationService.error('La contraseña es requerida para nuevos usuarios', 'Validación');
         return;
       }
       if (this.formData.password !== this.formData.confirmPassword) {
         this.notificationService.error('Las contraseñas no coinciden', 'Validación');
         return;
       }
       this.createUser();
     } else {
       this.updateUser();
     }
   }

  createUser(): void {
    const request: CreateUserRequest = {
      username: this.formData.username,
      email: this.formData.email,
      password: this.formData.password,
      roleId: this.formData.roleId!
    };

    this.userService.createUser(request).subscribe({
      next: (response) => {
        this.notificationService.success('Usuario creado exitosamente', 'Éxito');
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        this.notificationService.error('Error al crear usuario: ' + (err.error?.message || err.message), 'Error');
      }
    });
  }

  updateUser(): void {
    const id = this.editingUserId();
    if (!id) return;

    const request: UpdateUserRequest = {
      username: this.formData.username,
      email: this.formData.email,
      roleId: this.formData.roleId || undefined,
      active: this.formData.activo
    };

    if (this.formData.password) {
      request.password = this.formData.password;
    }

    this.userService.updateUser(id, request).subscribe({
      next: (response) => {
        this.notificationService.success('Usuario actualizado exitosamente', 'Éxito');
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error actualizando usuario:', err);
        this.notificationService.error('Error al actualizar usuario: ' + (err.error?.message || err.message), 'Error');
      }
    });
  }

  // Cambiar estado del usuario
  toggleUserStatus(user: UserData): void {
    const originalState = user.active;
    // Optimistic update: change state immediately
    user.active = !originalState;
    this.calcularUsuariosActivos();
    
    this.userService.toggleUserStatus(user.id).subscribe({
      next: () => {
        const estado = user.active ? 'activado' : 'desactivado';
        this.notificationService.success(`Usuario ${estado} exitosamente`, 'Éxito');
      },
      error: (err) => {
        // Revert on error
        user.active = originalState;
        this.calcularUsuariosActivos();
        console.error('Error cambiando estado:', err);
        this.notificationService.error('Error al cambiar estado del usuario', 'Error');
      }
    });
  }

  // Eliminar usuario
  deleteUser(user: UserData): void {
    if (!confirm(`¿Está seguro de eliminar al usuario "${user.username}"?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.notificationService.success(`Usuario "${user.username}" eliminado exitosamente`, 'Éxito');
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error eliminando usuario:', err);
        this.notificationService.error('Error al eliminar usuario: ' + (err.error?.message || err.message), 'Error');
      }
    });
  }

  // Cambiar rol
  changeRole(user: UserData, newRoleId: number): void {
    this.userService.changeUserRole(user.id, newRoleId).subscribe({
      next: () => {
        this.notificationService.success('Rol actualizado exitosamente', 'Éxito');
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error cambiando rol:', err);
        this.notificationService.error('Error al cambiar rol del usuario', 'Error');
      }
    });
  }

  // Paginación
  nextPage(): void {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

   // Helper para obtener el nombre del rol
   getRoleName(role: Role | string | any): string {
     if (!role) return 'Sin rol';
     if (typeof role === 'string') return role;
     return role.name || 'Sin rol';
   }

  // Verificar si puede gestionar usuarios
  canManageUsers(): boolean {
    return this.authState.canManageUsers();
  }

  // Verificar si es SUPER_ADMIN
  isSuperAdmin(): boolean {
    return this.authState.hasRole('SUPER_ADMIN');
  }
}
