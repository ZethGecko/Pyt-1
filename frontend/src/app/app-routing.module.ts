// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './private/dashboard/dashboard.component';
import { publicGuard } from './core/auth/guards/public.guard';
import { authGuard } from './core/auth/guards/auth.guard';

const routes: Routes = [
  // === RUTAS PÚBLICAS (sin autenticación) ===
  {
    path: '',
    canActivate: [publicGuard],
    loadChildren: () => import('./public/public.module').then(m => m.AppModule)
  },
  
  // === RUTAS DE AUTENTICACIÓN ===
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./core/auth/auth.module').then(m => m.AuthModule)
  },
  
  // === RUTAS PRIVADAS (con autenticación) ===
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent
  },
  
  // === RUTAS DE GESTIÓN ===
  {
    path: 'tramites',
    canActivate: [authGuard],
    loadChildren: () => import('./private/gestion-tramites/gestion-tramites.module').then(m => m.GestionTramitesModule)
  },
  {
    path: 'empresas',
    canActivate: [authGuard],
    loadChildren: () => import('./private/gestion-empresas/gestion-empresas.module').then(m => m.GestionEmpresasModule)
  },
  {
    path: 'vehiculos',
    canActivate: [authGuard],
    loadChildren: () => import('./private/gestion-vehiculos/gestion-vehiculos.module').then(m => m.GestionVehiculosModule)
  },
  {
    path: 'expedientes',
    canActivate: [authGuard],
    loadChildren: () => import('./private/gestion-expedientes/gestion-expedientes.module').then(m => m.GestionExpedientesModule)
  },
  {
    path: 'inspecciones',
    canActivate: [authGuard],
    loadChildren: () => import('./private/gestion-inspecciones/gestion-inspecciones.module').then(m => m.GestionInspeccionesModule)
  },
  {
    path: 'examenes',
    canActivate: [authGuard],
    loadChildren: () => import('./private/gestion-examenes/gestion-examenes.module').then(m => m.GestionExamenesModule)
  },
  
  // === RUTAS DE CONFIGURACIÓN ===
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadChildren: () => import('./private/configuracion/configuracion.module').then(m => m.ConfiguracionModule)
  },
  {
    path: 'tipos-transporte',
    canActivate: [authGuard],
    loadChildren: () => import('./private/tipos-transporte/tipos-transporte.module').then(m => m.TiposTransporteModule)
  },
  {
    path: 'tupac',
    canActivate: [authGuard],
    loadChildren: () => import('./private/tupac/tupac.module').then(m => m.TUPACModule)
  },
  {
    path: 'departamentos',
    canActivate: [authGuard],
    loadChildren: () => import('./private/departamentos/departamentos.module').then(m => m.DepartamentosModule)
  },
  {
    path: 'admin/users',
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'SUPER_ADMIN'] },
    loadChildren: () => import('./private/admin/users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'admin/roles',
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'SUPER_ADMIN'] },
    loadChildren: () => import('./private/admin/roles/roles.module').then(m => m.RolesModule)
  },
  {
    path: 'tipo-tramite-solicitante',
    canActivate: [authGuard],
    loadChildren: () => import('./private/tipo-tramite-solicitante/tipo-tramite-solicitante.module').then(m => m.TipoTramiteSolicitanteModule)
  },
  {
    path: 'config-duracion-tuc',
    canActivate: [authGuard],
    loadChildren: () => import('./private/config-duracion-tuc/config-duracion-tuc.module').then(m => m.ConfiguracionDuracionTUCModule)
  },
  
  // === RUTAS DIRECTAS ===
  {
    path: 'constancias',
    canActivate: [authGuard],
    loadChildren: () => import('./private/constancias/constancias.module').then(m => m.ConstanciasModule)
  },
  {
    path: 'notificaciones',
    canActivate: [authGuard],
    loadChildren: () => import('./private/notificaciones/notificaciones.module').then(m => m.NotificacionesModule)
  },
  {
    path: 'solicitantes',
    canActivate: [authGuard],
    loadChildren: () => import('./private/solicitantes/solicitantes.module').then(m => m.SolicitantesModule)
  },
  {
    path: 'puntos-ruta',
    canActivate: [authGuard],
    loadChildren: () => import('./private/puntos-ruta/puntos-ruta.module').then(m => m.PuntosRutaModule)
  },
  {
    path: 'reportes',
    canActivate: [authGuard],
    loadChildren: () => import('./private/reportes/reportes.module').then(m => m.ReportesModule)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadChildren: () => import('./private/perfil/perfil.module').then(m => m.PerfilModule)
  },
  
  // Redirección por defecto
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }