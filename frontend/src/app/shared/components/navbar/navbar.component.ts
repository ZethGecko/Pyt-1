import { AuthStateService } from './../../../core/auth/state/auth.state';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PermissionService } from '../../../core/auth/services/permission.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private AuthStateService = inject(AuthStateService);
  private router = inject(Router);

  // Usar signals para reactividad
  user = this.AuthStateService.username;
  isLoggedIn = this.AuthStateService.isLoggedIn;
  canManageUsers = this.AuthStateService.canManageUsers;
  canManageAllData = this.AuthStateService.canManageAllData;

  // Menú dinámico basado en permisos
  get menuItems() {
    return [
      {
        label: 'Dashboard',
        route: '/dashboard',
        icon: 'home',
        visible: this.isLoggedIn()
      },
      {
        label: 'Trámites',
        route: '/tramites',
        icon: 'file-text',
        visible: this.permissionService.hasTablePermission('tramite', 'view')
      },
      {
        label: 'Empresas',
        route: '/empresas',
        icon: 'building',
        visible: this.permissionService.hasTablePermission('empresa', 'view')
      },
      {
        label: 'Vehículos',
        route: '/vehiculos',
        icon: 'truck',
        visible: this.permissionService.hasTablePermission('vehiculo', 'view')
      },
      {
        label: 'Inspecciones',
        route: '/inspecciones',
        icon: 'clipboard-check',
        visible: this.permissionService.hasTablePermission('inspeccion', 'view')
      },
      {
        label: 'Administración',
        icon: 'settings',
        visible: this.canManageAllData(),
        children: [
          {
            label: 'Usuarios',
            route: '/admin/usuarios',
            visible: this.canManageUsers()
          },
          {
            label: 'Roles',
            route: '/admin/roles',
            visible: this.permissionService.hasTablePermission('rol', 'manage')
          },
          {
            label: 'Configuración',
            route: '/admin/configuracion',
            visible: this.permissionService.hasTablePermission('configuracion', 'manage')
          }
        ]
      }
    ].filter(item => item.visible);
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(): void {
    this.router.navigate(['/perfil']);
  }
}