import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FichaInspeccionService, FichaInspeccion, FichaInspeccionResponse } from '../services/ficha-inspeccion.service';

@Component({
  selector: 'app-gestion-fichas-inspeccion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="gestion-fichas">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Gestión de Fichas de Inspección</h1>
          <p class="page-subtitle">Administra las fichas de inspección vehicular</p>
        </div>
        <button class="btn btn-primary" (click)="cargarFichas()">
          <svg class="btn-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Mensajes -->
      <div class="messages" *ngIf="error || exito">
        <div class="alert alert-error" *ngIf="error" (click)="error = null">
          <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ error }}
        </div>
        <div class="alert alert-success" *ngIf="exito" (click)="exito = null">
          <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ exito }}
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="cargando">
        <div class="spinner"></div>
        <span class="loading-text">Cargando fichas de inspección...</span>
      </div>

      <!-- Tabla -->
      <div class="table-container" *ngIf="!cargando && fichas.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Inspección</th>
              <th>Vehículo</th>
              <th>Estado</th>
              <th>Resultado</th>
              <th>Fecha Inspección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ficha of fichas">
              <td>
                <span class="codigo-badge">{{ ficha.id }}</span>
              </td>
              <td>
                <span>{{ ficha.inspeccionId || 'Sin asignar' }}</span>
              </td>
              <td>
                <span>{{ ficha.vehiculo?.placa || 'Sin asignar' }}</span>
              </td>
              <td>
                <span class="badge" [class.badge-success]="ficha.estado" [class.badge-danger]="!ficha.estado">
                  {{ ficha.estado ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-success]="ficha.resultado === 'APROBADO'" [class.badge-danger]="ficha.resultado === 'RECHAZADO'" [class.badge-warning]="ficha.resultado === 'OBSERVADO'" [class.badge-secondary]="!ficha.resultado">
                  {{ ficha.resultado || 'Sin resultado' }}
                </span>
              </td>
              <td>
                <span>{{ ficha.fechaInspeccion || '-' }}</span>
              </td>
              <td class="actions">
                <button class="btn-icon btn-view" [routerLink]="['/inspecciones', ficha.inspeccionId, 'realizar']" title="Ver detalle">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sin resultados -->
      <div class="empty-container" *ngIf="!cargando && fichas.length === 0">
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p>No se encontraron fichas de inspección</p>
          <span class="empty-hint">Las fichas de inspección se generan automáticamente al crear inspecciones</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gestion-fichas {
      padding: 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: #1f2937;
    }
    .page-subtitle {
      color: #6b7280;
      margin: 0.25rem 0 0 0;
    }
    .messages {
      margin-bottom: 1rem;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }
    .spinner {
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loading-text {
      margin-top: 1rem;
      color: #6b7280;
    }
    .table-container {
      overflow-x: auto;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      background: #f9fafb;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-table tr:hover {
      background: #f9fafb;
    }
    .codigo-badge {
      background: #e5e7eb;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-secondary {
      background: #f3f4f6;
      color: #6b7280;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .btn-icon svg {
      width: 1rem;
      height: 1rem;
    }
    .btn-view {
      background: #eff6ff;
      color: #2563eb;
    }
    .btn-view:hover {
      background: #dbeafe;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-primary:hover {
      background: #2563eb;
    }
    .btn-icon-svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    .empty-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
    .empty-state {
      text-align: center;
      color: #6b7280;
    }
    .empty-state svg {
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      color: #9ca3af;
    }
    .empty-hint {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #9ca3af;
    }
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .alert-error {
      background: #fee2e2;
      color: #991b1b;
    }
    .alert-success {
      background: #d1fae5;
      color: #065f46;
    }
    .alert-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }
  `]
})
export class GestionFichasInspeccionComponent implements OnInit {
  fichas: FichaInspeccion[] = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  constructor(private fichaInspeccionService: FichaInspeccionService) {}

  ngOnInit(): void {
    this.cargarFichas();
  }

  cargarFichas(): void {
    this.cargando = true;
    this.error = null;

    this.fichaInspeccionService.getAll(0, 100).subscribe({
      next: (response: FichaInspeccionResponse) => {
        this.fichas = response.content || [];
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar fichas de inspección: ' + (err.message || 'Error desconocido');
        this.cargando = false;
        console.error('Error cargando fichas:', err);
      }
    });
  }
}
