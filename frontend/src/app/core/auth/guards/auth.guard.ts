import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStateService } from '../state/auth.state';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const authService = inject(AuthService);

  // Si no hay token o no está logueado, redirigir al login
  if (!authState.isLoggedIn()) {
    console.log('[AuthGuard] No authentication found, redirecting to login');
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  }

  // Intentar validar token con el backend
  return authService.validateToken().pipe(
    map(() => {
      console.log('[AuthGuard] Token validation successful');
      return true;
    }),
    catchError((error: any) => {
      console.log('[AuthGuard] Token validation failed:', error);

      // Si hay error de conexión (status 0), permitir acceso temporal si el token local es válido
      // Esto permite que la app funcione parcialmente cuando el backend está caído
      if (error.status === 0) {
        console.log('[AuthGuard] Backend unavailable, allowing access with local token validation');
        const tokenService = inject(TokenService);
        if (tokenService.isTokenValid()) {
          console.log('[AuthGuard] Local token is valid, allowing access');
          return of(true);
        }
      }

      // Para otros errores (401, 403, etc.), logout y redirect
      console.log('[AuthGuard] Authentication failed, redirecting to login');
      authService.logout();
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    })
  );
};