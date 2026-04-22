import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile } from '../models/user.model';

export interface UserResponse {
  success: boolean;
  users?: UserProfile[];
  user?: UserProfile;
  count?: number;
  message?: string;
}

export interface RoleResponse {
  success: boolean;
  roles?: Role[];
  role?: Role;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  hierarchyLevel?: number;
  level?: number;
  isSystem?: boolean;
  enabled?: boolean;
  tablePermissions?: TablePermissionsMap;
  canManageUsers?: boolean;
  canManageAllData?: boolean;
  canViewAllData?: boolean;
  canEditOwnData?: boolean;
  canCreateData?: boolean;
  canDeleteData?: boolean;
  createdAt?: string;
}

export interface TablePermissionsMap {
  [tableName: string]: TablePermissions;
}

export interface TablePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManage: boolean;
  fieldPermissions?: {
    [fieldName: string]: boolean;
  };
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  hierarchyLevel: number;
  tablePermissions?: TablePermissionsMap;
  canManageUsers?: boolean;
  canManageAllData?: boolean;
  canViewAllData?: boolean;
  canEditOwnData?: boolean;
  canCreateData?: boolean;
  canDeleteData?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  hierarchyLevel?: number;
  tablePermissions?: TablePermissionsMap;
  canManageUsers?: boolean;
  canManageAllData?: boolean;
  canViewAllData?: boolean;
  canEditOwnData?: boolean;
  canCreateData?: boolean;
  canDeleteData?: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
   private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // User methods
  createUser(userData: CreateUserRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/users`, userData);
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  toggleUserStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/toggle-status`, {});
  }

  changeUserRole(id: number, roleId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/role/${roleId}`, {});
  }

  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/${id}`);
  }

  getAllUsers(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users`);
  }

  listarPorDepartamento(departamentoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/departamento/${departamentoId}`)
      .pipe(
        map((response: any) => response.users || [])
      );
  }

  getAllRoles(): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/roles`);
  }

  // Role management methods
  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  createRole(roleData: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, roleData);
  }

  updateRole(id: number, roleData: UpdateRoleRequest): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, roleData);
  }

  toggleRoleStatus(id: number, enabled: boolean): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/roles/${id}/estado?enabled=${enabled}`, {});
  }

  updateTablePermissions(roleId: number, tableName: string, permissions: TablePermissions): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${roleId}/tablas/${tableName}`, permissions);
  }

  copyPermissions(targetRoleId: number, sourceRoleId: number): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles/${targetRoleId}/copiar-permisos/${sourceRoleId}`, {});
  }
}