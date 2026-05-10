import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  // No interceptar endpoints de autenticación que no requieren token
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Read token directly from localStorage to avoid circular dependency
  const token = localStorage.getItem('access_token');

  if (token) {
    const authReq = addToken(req, token);
    return next(authReq).pipe(
      catchError((error: any) => {
        const status = error?.status;
        if (status === 401 || status === 403) {
          console.log('[AuthInterceptor] 401/403 received, logging out');
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};