import { Routes } from '@angular/router';

export const TRAMITES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/gestion-tramites.component')
      .then(m => m.GestionTramitesComponent),
    data: { title: 'Gestión de Trámites' }
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./pages/tramite-detalle.component')
      .then(m => m.TramiteDetalleComponent),
    data: { title: 'Detalle de Trámite' }
  },
  {
    path: 'ver/:id',
    loadComponent: () => import('./pages/gestion-tramites.component')
      .then(m => m.GestionTramitesComponent),
    data: { title: 'Detalle de Trámite' }
  },
  {
    path: 'mis-documentos',
    loadComponent: () => import('./pages/mis-documentos.component')
      .then(m => m.MisDocumentosComponent),
    data: { title: 'Mis Documentos' }
  },
  {
    path: 'pendientes-revision',
    loadComponent: () => import('./pages/pendientes-revision.component')
      .then(m => m.PendientesRevisionComponent),
    data: { title: 'Pendientes de Revisión' }
  },
  {
    path: 'estadisticas-documentos',
    loadComponent: () => import('./pages/estadisticas-documentos.component')
      .then(m => m.EstadisticasDocumentosComponent),
    data: { title: 'Estadísticas de Documentos' }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    data: { title: 'Mi Dashboard' }
  },
  {
    path: 'consulta',
    loadComponent: () => import('./pages/consulta-publica/consulta-publica.component')
      .then(m => m.ConsultaPublicaComponent),
    data: { title: 'Consulta de Trámite' }
  }
];