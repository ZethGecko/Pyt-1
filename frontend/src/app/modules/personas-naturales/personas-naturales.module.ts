import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GestionPersonasNaturalesComponent } from './pages/gestion-personas-naturales.component';
import { PERSONAS_NATURALES_ROUTES } from './personas-naturales.routes';

@NgModule({
  declarations: [
    GestionPersonasNaturalesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(PERSONAS_NATURALES_ROUTES)
  ]
})
export class PersonasNaturalesModule { }
