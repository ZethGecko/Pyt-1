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
        // El error.error puede ser string o objeto
        const backendMessage = typeof error.error === 'object' && error.error ?
          (error.error as any).message || (error.error as any).error || error.error.toString() :
          error.error || error.message;
          
          switch (error.status) {
            case 0:
              // Error de conexión - tratar como problema de autenticación si no es auth endpoint
              errorMessage = 'Error de conexión con el servidor';
              const isAuthRequest = req.url.includes('/api/auth/');
              if (!isAuthRequest) {
                console.log('[ErrorInterceptor] Connection failed for non-auth request, logging out');
                authService.logout();
                router.navigate(['/auth/login']);
              }
              break;
            case 400:
              errorMessage = backendMessage || 'Solicitud incorrecta';
              break;
            case 401:
              errorMessage = backendMessage || 'Sesión expirada o no autenticado. Por favor inicie sesión.';
              // Cerrar sesión y redirigir al login para CUALQUIER 401 (excepto login/register)
              if (!req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
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