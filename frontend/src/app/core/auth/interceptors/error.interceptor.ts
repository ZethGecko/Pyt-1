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

      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        const backendMessage = typeof error.error === 'object' && error.error ?
          (error.error as any).message || (error.error as any).error || error.error.toString() :
          error.error || error.message;

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
          req.url.includes('/api/grupos-presentacion/') ||
          req.url.includes('/api/parametros-inspeccion/') ||
          req.url.includes('/api/fichas-inspeccion/') ||
          req.url.includes('/actuator/') ||
          req.url.includes('/swagger-ui') ||
          req.url.includes('/v3/api-docs');

        switch (error.status) {
          case 0:
            errorMessage = 'Error de conexión con el servidor';
            // No redirigir al login para endpoints públicos
            if (!isPublicEndpoint) {
              console.log('[ErrorInterceptor] Connection failed for protected request, logging out');
              authService.logout();
              router.navigate(['/auth/login']);
            }
            break;
          case 400:
            errorMessage = backendMessage || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = backendMessage || 'No autorizado';
            // No redirigir al login para endpoints públicos
            if (!isPublicEndpoint) {
              console.log('[ErrorInterceptor] 401 on protected endpoint, logging out');
              authService.logout();
              router.navigate(['/auth/login']);
            }
            break;
          case 403:
            errorMessage = 'No tiene permisos para acceder a este recurso';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }

      console.error('HTTP Error:', errorMessage, error);

      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        originalError: error
      }));
    })
  );
};