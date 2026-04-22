import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Rutas
import { TRAMITES_ROUTES } from './tramites.routes';

// Componentes
import { GestionTramitesComponent } from './pages/gestion-tramites.component';
import { TramiteDetalleComponent } from './pages/tramite-detalle.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(TRAMITES_ROUTES),
    // Componentes standalone (Angular 14+)
    GestionTramitesComponent,
    TramiteDetalleComponent
  ],
  providers: []
})
export class TramitesModule { }