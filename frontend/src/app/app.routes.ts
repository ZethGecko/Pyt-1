import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { publicGuard } from './core/auth/guards/public.guard';

export const routes: Routes = [
  // Públicas
  {
    path: 'auth',
    loadChildren: () => import('./core/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./public/pages/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'publicaciones',
    canActivate: [publicGuard],
    loadComponent: () => import('./public/pages/publicaciones/publicaciones.component').then(m => m.PublicacionesComponent)
  },
  {
    path: 'busqueda-rutas',
    canActivate: [publicGuard],
    loadComponent: () => import('./public/pages/busqueda-rutas/busqueda-rutas.component').then(m => m.BusquedaRutasComponent)
  },
  {
    path: 'seguimiento',
    canActivate: [publicGuard],
    loadComponent: () => import('./public/pages/seguimiento/seguimiento.component').then(m => m.SeguimientoComponent)
  },

  // Privadas - Dashboard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./private/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Módulo Trámites (algunas rutas públicas, otras privadas - se definen en el módulo)
  {
    path: 'tramites',
    loadChildren: () => import('./modules/tramites/tramites.module').then(m => m.TramitesModule)
  },

  // Privadas - Admin
  {
    path: 'admin/users',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/admin/users-management/users-management.component').then(m => m.UsersManagementComponent)
  },
  {
    path: 'admin/roles',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/admin/roles-management/roles-management.component').then(m => m.RolesManagementComponent)
  },

  // Privadas - Empresas
  {
    path: 'empresas',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/empresas/pages/gestion-empresas.component').then(m => m.GestionEmpresasComponent)
  },

  // Privadas - Vehículos
  {
    path: 'vehiculos',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/vehiculos/pages/gestion-vehiculos.component').then(m => m.GestionVehiculosComponent)
  },

  // Privadas - Expedientes
  {
    path: 'expedientes',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/expedientes/pages/gestion-expedientes.component').then(m => m.GestionExpedientesComponent)
  },

  // Privadas - Inspecciones
  {
    path: 'inspecciones',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/inspecciones/pages/gestion-inspecciones.component').then(m => m.GestionInspeccionesComponent)
  },
    {
      path: 'inspecciones/realizar/:id',
      canActivate: [authGuard],
      loadComponent: () => import('./modules/inspecciones/pages/canvas-inspeccion.component').then(m => m.CanvasInspeccionComponent)
    },

  // Privadas - Exámenes
  {
    path: 'examenes',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/examenes/pages/gestion-examenes.component').then(m => m.GestionExamenesComponent)
  },

  // Privadas - Perfil
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/perfil/pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },

   // Privadas - Configuración
   {
     path: 'configuracion',
     canActivate: [authGuard],
     loadComponent: () => import('./modules/configuracion/pages/configuracion.component').then(m => m.ConfiguracionComponent)
   },
  {
    path: 'tipos-transporte',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/configuracion/pages/gestion-tipos-transporte.component').then(m => m.GestionTiposTransporteComponent)
  },
  {
    path: 'tupac',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/configuracion/pages/gestion-tupac.component').then(m => m.GestionTUPACComponent)
  },
  {
    path: 'departamentos',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/configuracion/pages/gestion-departamentos.component').then(m => m.GestionDepartamentosComponent)
  },
  {
    path: 'puntos-ruta',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/empresas/pages/gestion-puntos-ruta.component').then(m => m.GestionPuntosRutaComponent)
  },
  // {
  //   path: 'tipo-tramite-solicitante',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./modules/configuracion/pages/gestion-tipo-tramite-solicitante.component').then(m => m.GestionTipoTramiteSolicitanteComponent)
  // },
  {
    path: 'tipos-tramite',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/configuracion/pages/gestion-tipos-tramite.component').then(m => m.GestionTiposTramiteComponent)
  },
  {
    path: 'requisitos-tupac',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/configuracion/pages/gestion-requisitos-tupac.component').then(m => m.GestionRequisitosTUPACComponent)
  },

   // Privadas - Tipo Trámite Solicitante
   {
     path: 'tipo-tramite-solicitante',
     canActivate: [authGuard],
     loadComponent: () => import('./modules/configuracion/pages/gestion-tipo-tramite-solicitante.component').then(m => m.GestionTipoTramiteSolicitanteComponent)
   },

  // Privadas - Personas Naturales
  {
    path: 'personas-naturales',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/personas-naturales/personas-naturales.routes').then(m => m.PERSONAS_NATURALES_ROUTES)
  },

  // Redirecciones
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
