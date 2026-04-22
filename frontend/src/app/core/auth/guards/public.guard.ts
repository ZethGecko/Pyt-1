import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStateService } from '../state/auth.state';

export const publicGuard: CanActivateFn = (route, state) => {
  // Permitir acceso a todos (autenticados y no autenticados) a las páginas públicas
  return true;
};