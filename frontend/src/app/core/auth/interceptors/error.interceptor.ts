import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  console.log('[ErrorInterceptor] Interceptando petición a:', req.url);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('[ErrorInterceptor] Error capturado:', error.status, error.message, '| URL:', req.url);

      // Detectar si es un endpoint público
      const isPublicEndpoint =
        req.url.includes('/api/auth/') ||
        req.url.includes('/api/tipos-tramite/publico') ||
        req.url.includes('/api/tramites/publico') ||
        req.url.includes('/api/tramites/buscar/enriquecidos') ||
        req.url.includes('/api/tramites/enriquecidos') ||
        req.url.includes('/api/rutas/buscar') ||
        req.url.includes('/api/empresas') ||
        req.url.includes('/api/puntos') ||
        req.url.includes('/api/publico/') ||
        req.url.includes('/api/fichas-inspeccion/') ||
        req.url.includes('/actuator/') ||
        req.url.includes('/swagger-ui') ||
        req.url.includes('/v3/api-docs');

      // Manejar errores de conexión (0) - logout inmediato
      // 401 y 403 son manejados por authInterceptor (refresh token)
      if (error.status === 0) {
        if (!isPublicEndpoint) {
          console.log('[ErrorInterceptor] Error de conexión (0), cerrando sesión');
          authService.logout();
          router.navigate(['/auth/login']);
        }
      }

      // Propagar el error original sin modificarlo
      return throwError(() => error);
    })
  );
};