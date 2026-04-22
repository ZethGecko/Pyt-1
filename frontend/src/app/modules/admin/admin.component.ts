// modules/admin/admin.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Panel de Administración</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600">Contenido de administración aquí...</p>
      </div>
    </div>
  `
})
export class AdminComponent {}