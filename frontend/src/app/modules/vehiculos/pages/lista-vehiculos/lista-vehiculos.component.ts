import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-vehiculos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Vehículos</h1>
      <p class="text-gray-600">Gestión de flota vehicular.</p>
    </div>
  `
})
export class ListaVehiculosComponent {}
