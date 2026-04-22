import { Routes } from '@angular/router';
import { GestionPersonasNaturalesComponent } from './pages/gestion-personas-naturales.component';

export const PERSONAS_NATURALES_ROUTES: Routes = [
  {
    path: '',
    component: GestionPersonasNaturalesComponent
  },
  {
    path: 'nuevo',
    component: GestionPersonasNaturalesComponent
  },
  {
    path: ':id',
    component: GestionPersonasNaturalesComponent
  },
  {
    path: ':id/editar',
    component: GestionPersonasNaturalesComponent
  }
];
