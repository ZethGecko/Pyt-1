import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { publicGuard } from '../../core/auth/guards/public.guard';

export const TRAMITES_ROUTES: Routes = [
  // Ruta principal - PÚBLICA (lista de tipos de trámite y requisitos)
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () => import('../../public/pages/tramites-publicos/tramites-publicos.component')
      .then(m => m.TramitesPublicosComponent),
    data: { title: 'Trámites' }
  },
  // Detalle de trámite - PÚBLICO
  {
    path: 'detalle/:id',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/tramite-detalle.component')
      .then(m => m.TramiteDetalleComponent),
    data: { title: 'Detalle de Trámite' }
  },
  // Ver trámite (alias) - PÚBLICO
  {
    path: 'ver/:id',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/tramite-detalle.component')
      .then(m => m.TramiteDetalleComponent),
    data: { title: 'Detalle de Trámite' }
  },
  // Consulta pública - PÚBLICA
  {
    path: 'consulta',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/consulta-publica/consulta-publica.component')
      .then(m => m.ConsultaPublicaComponent),
    data: { title: 'Consulta de Trámite' }
  },

  // ========== RUTAS PRIVADAS (requieren autenticación) ==========
  {
    path: 'mis-documentos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mis-documentos.component')
      .then(m => m.MisDocumentosComponent),
    data: { title: 'Mis Documentos' }
  },
  {
    path: 'pendientes-revision',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/pendientes-revision.component')
      .then(m => m.PendientesRevisionComponent),
    data: { title: 'Pendientes de Revisión' }
  },
  {
    path: 'estadisticas-documentos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/estadisticas-documentos.component')
      .then(m => m.EstadisticasDocumentosComponent),
    data: { title: 'Estadísticas de Documentos' }
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    data: { title: 'Mi Dashboard' }
  }
];