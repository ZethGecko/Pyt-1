import { Routes } from '@angular/router';
import { publicGuard } from '../../core/auth/guards/public.guard';
import { authGuard } from '../../core/auth/guards/auth.guard';

export const TRAMITES_ROUTES: Routes = [
  // ========== RUTA PÚBLICA (sin auth) ==========
  // /tramites → vista pública (solo consulta)
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () => import('../../public/pages/tramites-publicos/tramites-publicos.component')
      .then(m => m.TramitesPublicosComponent),
    data: { title: 'Trámites' }
  },

  // ========== RUTAS PRIVADAS (con auth) ==========
  {
    path: 'gestion',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/gestion-tramites.component')
      .then(m => m.GestionTramitesComponent),
    data: { title: 'Gestión de Trámites' }
  },
  // Detalle público (ambas vistas lo usan)
  {
    path: 'detalle/:id',
    loadComponent: () => import('./pages/tramite-detalle.component')
      .then(m => m.TramiteDetalleComponent)
  },
  // Ver (alias)
  {
    path: 'ver/:id',
    loadComponent: () => import('./pages/tramite-detalle.component')
      .then(m => m.TramiteDetalleComponent)
  },
  // Consulta pública
  {
    path: 'consulta',
    loadComponent: () => import('./pages/consulta-publica/consulta-publica.component')
      .then(m => m.ConsultaPublicaComponent)
  },
  // Mis documentos (privado)
  {
    path: 'mis-documentos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mis-documentos.component')
      .then(m => m.MisDocumentosComponent)
  },
  // Pendientes de revisión (privado)
  {
    path: 'pendientes-revision',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/pendientes-revision.component')
      .then(m => m.PendientesRevisionComponent)
  },
  // Estadísticas (privado)
  {
    path: 'estadisticas-documentos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/estadisticas-documentos.component')
      .then(m => m.EstadisticasDocumentosComponent)
  },
  // Dashboard (privado)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  }
];
