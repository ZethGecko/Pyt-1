export interface User {
  id: number;
  username: string;
  email: string;
  active: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  departamentoId?: number;
  departamento?: {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  };
  role: Role;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  hierarchyLevel: number;
  isSystem: boolean;
  enabled: boolean;
  createdAt: string;
  canManageUsers: boolean;
  canManageAllData: boolean;
  canViewAllData: boolean;
  canEditOwnData: boolean;
  canCreateData: boolean;
  canDeleteData: boolean;
  tablePermissions: Map<string, TablePermissions>;
}

export interface TablePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManage: boolean;
  fieldPermissions?: Map<string, boolean>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  refreshToken?: string;
  tokenType?: string;
  user: UserProfile;
  expiresAt?: string;
  expiresIn?: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  active: boolean;
  lastLogin: string;
  createdAt: string;
  departamento?: {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  };
  role: {
    id: number;
    name: string;
    description: string;
    level: number;
  };
}

export interface TokenInfo {
  sub: string;
  userId?: number;
  role?: string;
  exp: number;
  iat: number;
}