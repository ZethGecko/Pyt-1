import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-gestion-constancias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Constancias</h1>
            <p class="page-subtitle">Gestión de constancias vehiculares</p>
          </div>
        </div>
        <button class="btn btn-primary">
          <app-icon name="plus" size="sm"></app-icon>
          Nueva Constancia
        </button>
      </div>

      <!-- Content -->
      <div class="table-card">
        <div class="p-6 text-center text-gray-500">
          <app-icon name="file" size="lg" customClass="text-gray-400 mb-4"></app-icon>
          <h3 class="text-lg font-medium mb-2">Funcionalidad en desarrollo</h3>
          <p class="text-sm">La gestión de constancias estará disponible próximamente.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .header-content { display: flex; align-items: center; gap: 12px; }
    .page-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0 0; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #2563eb; color: white; }
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  `]
})
export class GestionConstanciasComponent implements OnInit {

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.info('Vista de constancias en desarrollo', 'Información');
  }
}