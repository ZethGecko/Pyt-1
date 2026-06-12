import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout, throwError, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from '../models/user.model';
import { TokenService } from './token.service';
import { AuthStateService } from '../state/auth.state';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private authState = inject(AuthStateService);
   private apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('[AuthService] login() llamado con:', credentials.username);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('[AuthService] tap response:', response);
        if (response.success) {
          this.tokenService.saveToken(response.token);
          if (response.refreshToken) {
            this.tokenService.saveRefreshToken(response.refreshToken);
          }
          this.authState.setUser(response.user);
        }
      }),
      timeout(10000), // 10 segundos máximo
      catchError((error: any) => {
        console.log('[AuthService] catchError:', error);
        if (error.name === 'TimeoutError') {
          return throwError(() => ({
            message: 'La solicitud ha tardado demasiado tiempo. Verifica tu conexión.',
            status: 0
          }));
        }
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.success) {
          this.tokenService.saveToken(response.token);
          if (response.refreshToken) {
            this.tokenService.saveRefreshToken(response.refreshToken);
          }
          this.authState.setUser(response.user);
        }
      })
    );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.authState.clearUser();
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    console.log('[AuthService] refreshToken() called. Refresh token from storage:', refreshToken ? 'present' : 'NULL/EMPTY');
    return this.http.post(`${this.apiUrl}/refresh`, {}, {
      headers: {
        'X-Refresh-Token': refreshToken || ''
      }
    }).pipe(
        tap((response: any) => {
          console.log('[AuthService] refreshToken response:', response);
          if (response.token) {
            this.tokenService.saveToken(response.token);
          }
          if (response.refreshToken) {
            this.tokenService.saveRefreshToken(response.refreshToken);
          }
        }),
        catchError((err) => {
          console.error('[AuthService] refreshToken error:', err);
          return throwError(() => err);
        })
    );
  }

  validateToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate`);
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }
}