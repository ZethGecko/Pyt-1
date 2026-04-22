import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-empresas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Empresas</h1>
      <p class="text-gray-600">Gestión de empresas de transporte.</p>
    </div>
  `
})
export class ListaEmpresasComponent {}
