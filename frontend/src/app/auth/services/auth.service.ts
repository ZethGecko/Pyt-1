import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {
    // Simular usuario logueado para desarrollo
    this.currentUserSubject.next({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      roles: ['ROLE_ADMIN']
    });
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
  
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }
  
  // Simulación de permisos de tabla (Nivel 1)
  canCreate(table: string): boolean {
    // Por ahora, permitir todo en desarrollo
    return true;
  }
  
  canRead(table: string): boolean {
    return true;
  }
  
  canUpdate(table: string): boolean {
    return true;
  }
  
  canDelete(table: string): boolean {
    return true;
  }
  
  canManage(table: string): boolean {
    return true;
  }
  
  logout(): void {
    this.currentUserSubject.next(null);
  }
}
