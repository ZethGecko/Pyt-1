import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  let isRefreshing = false;
  let refreshTokenSubject = new BehaviorSubject<string | null>(null);

  const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  const handle401Error = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
    // Only handle refresh for non-auth endpoints
    if (request.url.includes('/auth/')) {
      // For auth endpoints, just throw error on 401
      return throwError(() => new HttpErrorResponse({ error: 'Unauthorized', status: 401, statusText: 'Unauthorized' }));
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          const token = response.token;
          refreshTokenSubject.next(token);

          return next(addToken(request, token));
        }),
        catchError(error => {
          isRefreshing = false;
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next(addToken(request, token!));
        })
      );
    }
  };

   if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
     return next(req);
   }

  const token = tokenService.getToken();
  
  if (token) {
    const authReq = addToken(req, token);
    return next(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return handle401Error(req, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  return next(req);
};