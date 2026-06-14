import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { TokenService } from '../services/token.service';

export const normalizeRoleName = (role: string | null | undefined): string | null => {
  if (!role) return null;
  const normalized = role.trim().toUpperCase();
  return normalized.startsWith('ROLE_') ? normalized.slice(5) : normalized;
};

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private user = signal<UserProfile | null>(null);
  private tokenService = inject(TokenService);

  isLoggedIn = computed(() => {
    const tokenValid = this.tokenService.isTokenValid();
    const hasUser = this.user() !== null;
    return tokenValid && hasUser;
  });

  currentUser = computed(() => this.user());
  userRole = computed(() => normalizeRoleName(this.user()?.role?.name));
  username = computed(() => this.user()?.username || null);

  constructor() {
    const savedUser = this.tokenService.getUserData();
    if (savedUser && this.tokenService.isTokenValid()) {
      this.user.set(savedUser);
    }
  }

  setUser(user: UserProfile): void {
    this.user.set(user);
    this.tokenService.saveUserData(user);
  }

  clearUser(): void {
    this.user.set(null);
    this.tokenService.clearTokens();
  }

  canManageUsers(): boolean {
    return this.hasRole('SUPER_ADMIN') || this.hasRole('ADMIN');
  }

  canManageAllData(): boolean {
    return this.hasRole('SUPER_ADMIN') || this.hasRole('ADMIN');
  }

  canCreateData(): boolean {
    return this.hasRole('SUPER_ADMIN') || this.hasRole('ADMIN') || this.hasRole('MANAGER');
  }

  canDeleteData(): boolean {
    return this.hasRole('SUPER_ADMIN') || this.hasRole('ADMIN');
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.userRole();
    return userRole ? roles.map(normalizeRoleName).includes(userRole) : false;
  }

  hasRole(role: string): boolean {
    return this.userRole() === normalizeRoleName(role);
  }
}