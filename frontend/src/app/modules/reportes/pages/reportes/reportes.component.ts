import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/ui/icon.component';
import { NotificationService } from '../../../../shared/services/notification.service';

interface Reporte {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
  disponible: boolean;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Reportes</h1>
            <p class="page-subtitle">Sistema de reportes y estadísticas del sistema</p>
          </div>
        </div>
      </div>

      <!-- Reportes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (reporte of reportes; track reporte.id) {
          <div class="reporte-card" [class.disabled]="!reporte.disponible">
            <div class="card-header">
              <div class="card-icon">
                <app-icon [name]="reporte.icono" size="lg" customClass="text-blue-600"></app-icon>
              </div>
              <div class="card-actions">
                @if (reporte.disponible) {
                  <button class="btn-action" title="Generar Reporte">
                    <app-icon name="download" size="sm"></app-icon>
                  </button>
                } @else {
                  <span class="badge-disabled">Próximamente</span>
                }
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ reporte.nombre }}</h3>
              <p class="card-description">{{ reporte.descripcion }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Filtros -->
      <div class="filters-card mt-6">
        <h3 class="text-lg font-semibold mb-4">Filtros de Reportes</h3>
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Fecha Desde</label>
            <input type="date" class="filter-input">
          </div>
          <div class="filter-group">
            <label class="filter-label">Fecha Hasta</label>
            <input type="date" class="filter-input">
          </div>
          <div class="filter-group">
            <label class="filter-label">Tipo</label>
            <select class="filter-select">
              <option value="">Todos</option>
              <option value="tramites">Trámites</option>
              <option value="inspecciones">Inspecciones</option>
              <option value="examenes">Exámenes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .header-content { display: flex; align-items: center; gap: 12px; }
    .page-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0 0; }

    .reporte-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s; }
    .reporte-card:hover:not(.disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .reporte-card.disabled { opacity: 0.6; cursor: not-allowed; }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .card-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #eff6ff; border-radius: 8px; }
    .btn-action { padding: 8px; border-radius: 6px; border: none; background: #f3f4f6; color: #6b7280; cursor: pointer; transition: all 0.2s; }
    .btn-action:hover { background: #e5e7eb; color: #374151; }
    .badge-disabled { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }

    .card-content h3 { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px; }
    .card-content p { font-size: 14px; color: #6b7280; line-height: 1.4; }

    .filters-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .filters-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { flex: 1; min-width: 200px; }
    .filter-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .filter-input, .filter-select { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; }
  `]
})
export class ReportesComponent implements OnInit {

  reportes: Reporte[] = [
    {
      id: 'tramites',
      nombre: 'Reportes de Trámites',
      descripcion: 'Estadísticas y reportes detallados sobre trámites procesados en el sistema.',
      icono: 'file-text',
      ruta: '/reportes/tramites',
      disponible: false
    },
    {
      id: 'inspecciones',
      nombre: 'Reportes de Inspecciones',
      descripcion: 'Análisis de inspecciones vehiculares realizadas y sus resultados.',
      icono: 'clipboard-check',
      ruta: '/reportes/inspecciones',
      disponible: false
    },
    {
      id: 'examenes',
      nombre: 'Reportes de Exámenes',
      descripcion: 'Estadísticas de exámenes teóricos y prácticos realizados.',
      icono: 'calendar',
      ruta: '/reportes/examenes',
      disponible: false
    },
    {
      id: 'empresas',
      nombre: 'Reportes de Empresas',
      descripcion: 'Información sobre empresas registradas y su actividad.',
      icono: 'building',
      ruta: '/reportes/empresas',
      disponible: false
    },
    {
      id: 'vehiculos',
      nombre: 'Reportes de Vehículos',
      descripcion: 'Estadísticas sobre vehículos registrados y su estado.',
      icono: 'truck',
      ruta: '/reportes/vehiculos',
      disponible: false
    },
    {
      id: 'dashboard',
      nombre: 'Dashboard Ejecutivo',
      descripcion: 'Vista general del estado del sistema con métricas clave.',
      icono: 'chart-bar',
      ruta: '/reportes/dashboard',
      disponible: false
    }
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.info('Sistema de reportes en desarrollo', 'Información');
  }
}
