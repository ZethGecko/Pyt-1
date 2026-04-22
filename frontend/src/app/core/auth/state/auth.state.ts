import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { TokenService } from '../services/token.service';

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
  userRole = computed(() => this.user()?.role?.name || null);
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
    const role = this.userRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
  }

  canManageAllData(): boolean {
    const role = this.userRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
  }

  canCreateData(): boolean {
    const role = this.userRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER';
  }

  canDeleteData(): boolean {
    const role = this.userRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.userRole();
    return userRole ? roles.includes(userRole) : false;
  }

  hasRole(role: string): boolean {
    return this.userRole() === role;
  }
}