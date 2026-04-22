import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Configuración</h1>
      <p class="text-gray-600">Configuración del sistema.</p>
    </div>
  `
})
export class ConfiguracionComponent {}
