import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthStateService } from '../state/auth.state';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
   private apiUrl = 'http://localhost:8080/api';

  getUserPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/profile`).pipe(
      map((response: any) => response.profile || {})
    );
  }

  hasTablePermission(table: string, action: string): boolean {
    if (!this.authState.isLoggedIn()) return false;

    const role = this.authState.userRole();
    
    switch (role) {
      case 'SUPER_ADMIN':
        return true;
      case 'ADMIN':
        return action !== 'manage_users';
      case 'MANAGER':
        return ['view', 'create', 'edit'].includes(action);
      case 'USER':
        return action === 'view';
      default:
        return false;
    }
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => 
      this.hasTablePermission(permission, 'view')
    );
  }

  canManageUsers(): boolean {
    return this.authState.canManageUsers();
  }

  canCreateData(): boolean {
    return this.authState.canCreateData();
  }

  canDeleteData(): boolean {
    return this.authState.canDeleteData();
  }
}