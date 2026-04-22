import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RequisitoTUPACService, RequisitoTUPAC, RequisitoTUPACEnriquecidoProjection } from '../services/requisito-tupac.service';
import { TUPACService } from '../services/tupac.service';
import { TUPAC } from '../models/tupac.model';
import { TIPOS_DOCUMENTO } from '../models/requisito-tupac.model';
import { RequisitoFormModalComponent } from '../components/requisito-form-modal/requisito-form-modal.component';
import { FormatoService } from '../services/formato.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TipoTramiteService } from '../services/tipo-tramite.service';
import { TipoTramite, TipoTramiteEnriquecido } from '../models/tipo-tramite.model';

@Component({
  selector: 'app-gestion-requisitos-tupac',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RequisitoFormModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <a routerLink="/app/configuracion" class="header-back">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </a>
          <div class="header-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div class="header-text">
            <h1 class="page-title">Requisitos TUPA</h1>
            <p class="page-subtitle">Gestiona los requisitos del Texto Único de Procedimientos Administrativos</p>
          </div>
        </div>
        <button (click)="abrirModalCrear()" class="btn btn-primary" [disabled]="!puedeCrear">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Requisito
        </button>
      </div>

      <!-- Error/Success Messages -->
      @if (error) {
        <div class="alert alert-error">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ error }}
          <button (click)="error = null">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
      @if (success) {
        <div class="alert alert-success">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ success }}
          <button (click)="success = null">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ requisitos.length }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Activos</span>
            <span class="stat-value">{{ getActivos() }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">TUPA</label>
            <select [(ngModel)]="tupacFiltro" (change)="filtrarPorTUPAC()" class="form-select">
              <option [ngValue]="null">Todos los TUPAs</option>
              @for (tupac of tupacs; track tupac.id) {
                <option [ngValue]="tupac.id">{{ tupac.codigo }} - {{ tupac.descripcion }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Tipo</label>
            <select [(ngModel)]="tipoDocumentoFiltro" (change)="filtrarPorTipoDocumento()" class="filter-select">
              <option [ngValue]="null">Todos</option>
              @for (tipo of TIPOS_DOCUMENTO; track $index) {
                <option [ngValue]="tipo.value">{{ tipo.label }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Estado</label>
            <select [(ngModel)]="estadoFiltro" (change)="filtrarPorEstado()" class="filter-select">
              <option [ngValue]="null">Todos</option>
              <option [ngValue]="true">Activos</option>
              <option [ngValue]="false">Inactivos</option>
            </select>
          </div>
          <div class="filter-group flex-1">
            <label class="filter-label">Buscar</label>
            <input type="text" [(ngModel)]="terminoBusqueda" (input)="buscar()" class="filter-input" placeholder="Código o descripción...">
          </div>
          <div class="filter-actions">
            <button class="btn btn-secondary" (click)="cargarDatosIniciales()">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      @if (cargando) {
        <div class="loading-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span>Cargando requisitos...</span>
        </div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>TUPA</th>
                <th>Tipo</th>
                <th>Formato</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (requisito of requisitosPaginados; track requisito.id) {
                <tr [class.highlight-row]="requisitoDestacadoId === requisito.id">
                  <td>
                    <span class="code-badge">{{ requisito.codigo }}</span>
                  </td>
                  <td class="descripcion-column">
                    <div class="descripcion-cell">
                      <span>{{ requisito.descripcion }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="category-badge">{{ requisito.tupac ? requisito.tupac.codigo : 'N/A' }}</span>
                  </td>
                  <td>
                    <span class="tipo-badge">{{ requisito.tipoDocumento }}</span>
                  </td>
                  <td>
                    @if (requisito.formato && requisito.formato.id) {
                      <span class="formato-badge" title="{{ requisito.formato.descripcion }}">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        {{ requisito.formato.descripcion || 'Formato' }}
                      </span>
                    } @else {
                      <span class="no-formato-badge">Sin formato</span>
                    }
                  </td>
                  <td>
                    <span [class]="'status-badge ' + (requisito.activo ? 'status-active' : 'status-inactive')">
                      {{ requisito.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                   <td>
                     <div class="action-buttons">
                       @if (requisito.formato && requisito.formato.id) {
                         <button class="btn-icon btn-view" (click)="verFormato(requisito)" title="Ver formato">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                           </svg>
                         </button>
                       } @else {
                         <button class="btn-icon" disabled title="Sin formato">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                           </svg>
                         </button>
                       }
                       <button class="btn-icon btn-edit" (click)="abrirModalEditar(requisito)" title="Editar requisito">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                         </svg>
                       </button>
                       @if (requisito.activo) {
                         <button class="btn-icon btn-toggle-inactive" (click)="desactivarRequisito(requisito)" title="Desactivar requisito">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                           </svg>
                         </button>
                       } @else {
                         <button class="btn-icon btn-toggle-active" (click)="activarRequisito(requisito)" title="Activar requisito">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                           </svg>
                         </button>
                       }
                       <button class="btn-icon btn-delete" (click)="eliminar(requisito)" title="Eliminar requisito">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                         </svg>
                       </button>
                     </div>
                   </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p>No hay requisitos registrados</p>
                    @if (tupacFiltro) {
                      <p class="empty-state-hint">No hay requisitos para el TUPA seleccionado</p>
                      <button class="btn btn-primary" (click)="abrirModalCrearParaTUPAC()">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Crear requisito para este TUPA
                      </button>
                    } @else {
                      <button class="btn btn-primary" (click)="abrirModalCrear()">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Crear primer requisito
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <!-- PAGINACIÓN -->
        @if (paginasTotales > 1) {
          <div class="pagination">
            <button (click)="cambiarPagina(paginaActual - 1)"
                    [disabled]="paginaActual === 1"
                    class="btn btn-outline btn-sm">
              Anterior
            </button>
            
            <span class="pagination-info">
              Página {{paginaActual}} de {{paginasTotales}}
              ({{getRequisitosFiltrados().length}} registros)
            </span>
            
            <button (click)="cambiarPagina(paginaActual + 1)"
                    [disabled]="paginaActual === paginasTotales"
                    class="btn btn-outline btn-sm">
              Siguiente
            </button>
          </div>
        }
      }
    </div>

    <!-- Modal Requisito (Componente reutilizable) -->
    <app-requisito-form-modal
      [mostrar]="mostrarModalRequisito"
      [tupac]="tupacSeleccionado"
      [requisito]="requisitoSeleccionado"
      (cerrar)="cerrarModalRequisito()"
      (guardado)="onRequisitoGuardado()">
    </app-requisito-form-modal>
  `,
  styles: [`
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    @media (min-width: 768px) {
      .page-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-back {
      display: flex;
      padding: 0.5rem;
      border-radius: 9999px;
      transition: background-color 0.2s;
    }
    .header-back:hover {
      background-color: #f3f4f6;
    }

    .header-icon {
      display: flex;
      padding: 0.75rem;
      border-radius: 9999px;
    }
    .header-icon.blue {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .header-text {
      display: flex;
      flex-direction: column;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .alert-error {
      background-color: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background-color: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid #e5e7eb;
    }

    .stat-icon {
      display: flex;
      padding: 0.75rem;
      border-radius: 9999px;
    }
    .stat-icon.blue {
      background-color: #dbeafe;
      color: #2563eb;
    }
    .stat-icon.green {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .filters-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      padding: 1rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e5e7eb;
    }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
    }

    .filter-group {
      flex: 1;
      min-width: 150px;
    }

    .filter-group.flex-1 {
      flex: 1;
    }

    .filter-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .filter-input, .filter-select, .form-select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      outline: none;
      transition: all 0.2s;
    }

    .filter-input:focus, .filter-select:focus, .form-select:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
      border-color: #3b82f6;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: background-color 0.2s;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background-color: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1d4ed8;
    }

    .btn-secondary {
      background-color: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background-color: #d1d5db;
    }

    .table-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      padding: 0.5rem 1rem;
      background-color: #f3f4f6;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #d1d5db;
    }

    .data-table td {
      padding: 0.5rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    .data-table tr {
      transition: background-color 0.15s;
    }

    .data-table tr:hover {
      background-color: #eff6ff;
    }

    .code-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: #e9d5ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
    }

    .tipo-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: #e0e7ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
    }

    .formato-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
      max-width: 150px;
      white-space: normal;
      word-wrap: break-word;
    }

    .no-formato-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: #f3f4f6;
      color: #4b5563;
      border: 1px solid #e5e7eb;
      font-style: italic;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-active {
      background-color: #dcfce7;
      color: #16a34a;
      border: 1px solid #bbf7d6;
    }

    .status-inactive {
      background-color: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: nowrap;
    }

     .btn-icon {
       width: 36px;
       height: 36px;
       border-radius: 0.5rem;
       border: none;
       cursor: pointer;
       display: flex;
       align-items: center;
       justify-content: center;
       transition: all 0.2s;
       padding: 0;

       svg {
         width: 16px;
         height: 16px;
       }

       &.btn-view {
         background-color: #dcfce7;
         color: #16a34a;

         &:hover:not(:disabled) {
           background-color: #bbf7d6;
         }
       }

       &.btn-edit {
         background-color: #dbeafe;
         color: #2563eb;

         &:hover:not(:disabled) {
           background-color: #bfdbfe;
         }
       }

       &.btn-deactivate {
         background-color: #fef3c7;
         color: #d97706;

         &:hover:not(:disabled) {
           background-color: #fde047;
         }
       }

       &.btn-activate {
         background-color: #dcfce7;
         color: #16a34a;

         &:hover:not(:disabled) {
           background-color: #bbf7d6;
         }
       }

       &.btn-delete {
         background-color: #fee2e2;
         color: #dc2626;

         &:hover:not(:disabled) {
           background-color: #fecaca;
         }
       }

       &:disabled {
         opacity: 0.5;
         cursor: not-allowed;
         background-color: #f3f4f6;
         color: #9ca3af;
       }
     }

    .descripcion-column {
      max-width: 180px;
      width: 180px;
    }

    .descripcion-cell {
      white-space: normal;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .highlight-row {
      background-color: #fef3c7;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .empty-state-hint {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      color: #6b7280;
    }

    .highlight-row {
      animation: highlight-pulse 1s ease-in-out 3;
      background-color: #fef3c7 !important;
    }

    @keyframes highlight-pulse {
      0%, 100% {
        background-color: #fef3c7;
      }
      50% {
        background-color: #fde68a;
      }
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
    }

    .modal-content {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 32rem;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.modal-large {
      max-width: 90%;
      width: 1200px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-close {
      padding: 0.25rem;
      color: #9ca3af;
      transition: color 0.2s;
      background: none;
      border: none;
      cursor: pointer;
    }

    .modal-close:hover {
      color: #4b5563;
    }

    .modal-body {
      padding: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      outline: none;
      transition: all 0.2s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
      border-color: #3b82f6;
    }

    .form-textarea {
      resize: none;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
      background-color: #f9fafb;
    }

    /* Columna descripción con ancho fijo para que los botones quepan en una línea */
    .descripcion-column {
      max-width: 150px;
      width: 150px;
    }

    .descripcion-cell {
      white-space: normal;
      word-wrap: break-word;
    }

    .formato-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: #dcfce7;
      color: #166534;
      max-width: 150px;
      white-space: normal;
      word-wrap: break-word;
    }
  `]
})
export class GestionRequisitosTUPACComponent implements OnInit {
  requisitos: RequisitoTUPAC[] = [];
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 15;
  get paginasTotales(): number {
    const requisitosFiltrados = this.getRequisitosFiltrados();
    return Math.ceil(requisitosFiltrados.length / this.itemsPorPagina);
  }
  get requisitosPaginados(): RequisitoTUPAC[] {
    const requisitosFiltrados = this.getRequisitosFiltrados();
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return requisitosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }
  
  tupacs: TUPAC[] = [];
   
  TIPOS_DOCUMENTO = TIPOS_DOCUMENTO;
   
  cargando = false;
  error: string | null = null;
  success: string | null = null;
   
  tupacFiltro: number | null = null;
  tipoDocumentoFiltro: string | null = null;
  estadoFiltro: boolean | null = null;
  terminoBusqueda: string = '';
   
  mostrarModalRequisito = false;
  tupacSeleccionado: TUPAC | null = null;
  requisitoSeleccionado: RequisitoTUPAC | null = null;

  puedeCrear = true;
  puedeEliminar = true;

  requisitoDestacadoId: number | null = null;

  constructor(
    private requisitoService: RequisitoTUPACService,
    private tupacService: TUPACService,
    private tipoTramiteService: TipoTramiteService,
    private formatoService: FormatoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['tupacId']) {
        const tupacId = Number(params['tupacId']);
        this.tupacFiltro = tupacId;
        this.filtrarPorTUPAC();
        
        if (params['requisitoId']) {
          const requisitoId = Number(params['requisitoId']);
          this.requisitoDestacadoId = requisitoId;
          
          setTimeout(() => {
            const requisito = this.requisitos.find(r => r.id === requisitoId);
            if (requisito) {
              this.abrirModalEditar(requisito);
              this.destacarRequisito(requisitoId);
            }
          }, 500);
        } else {
          // Si no hay requisitoId, destacar el primer requisito del TUPA filtrado
          setTimeout(() => {
            const primerRequisito = this.requisitos.find(r => r.tupac && r.tupac.id === tupacId);
            if (primerRequisito && primerRequisito.id) {
              this.destacarRequisito(primerRequisito.id);
            }
          }, 500);
        }
      }
    });
  }

  cargarDatosIniciales() {
    this.cargando = true;
    this.error = null;

    forkJoin({
      tupacs: this.tupacService.listarTodos(),
      requisitos: this.requisitoService.listarTodosEnriquecidos()
    }).subscribe({
      next: (resultado) => {
        this.tupacs = resultado.tupacs;
        this.requisitos = this.transformarProyeccionesARequisitos(resultado.requisitos);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'Error al cargar datos iniciales';
        console.error('Error cargando datos:', err);
      }
    });
  }
  
  private transformarProyeccionesARequisitos(proyecciones: RequisitoTUPACEnriquecidoProjection[]): RequisitoTUPAC[] {
    return proyecciones.map(proj => {
      const requisito: RequisitoTUPAC = {
        id: proj.id,
        codigo: proj.codigo,
        descripcion: proj.descripcion,
        obligatorio: proj.obligatorio,
        tipoDocumento: proj.tipoDocumento,
        esExamen: proj.esExamen,
        observaciones: proj.observaciones,
        activo: proj.activo,
        diasValidez: proj.diasValidez,
        tupac: {
          id: proj.tupacId,
          codigo: proj.tupacCodigo,
          nombre: proj.tupacDescripcion
        },
        formato: proj.formatoId ? {
          id: proj.formatoId,
          descripcion: proj.formatoDescripcion || '',
          archivoRuta: proj.formatoArchivoRuta || ''
        } : null,
        formatoId: proj.formatoId || null
      };
      return requisito;
    });
  }

  getRequisitosFiltrados(): RequisitoTUPAC[] {
    return this.requisitos.filter(requisito => {
      const coincideTUPAC = this.tupacFiltro === null ||
        (requisito.tupac && requisito.tupac.id === this.tupacFiltro);
      
      const coincideTipo = this.tipoDocumentoFiltro === null ||
        requisito.tipoDocumento.toLowerCase() === this.tipoDocumentoFiltro.toLowerCase();
      
      const coincideEstado = this.estadoFiltro === null ||
        requisito.activo === this.estadoFiltro;
      
      const coincideBusqueda = !this.terminoBusqueda ||
        requisito.codigo.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        requisito.descripcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      return coincideTUPAC && coincideTipo && coincideEstado && coincideBusqueda;
    });
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
  }

  getActivos(): number {
    return this.requisitos.filter(r => r.activo).length;
  }

  abrirModalCrear() {
    this.tupacSeleccionado = null;
    this.requisitoSeleccionado = null;
    this.mostrarModalRequisito = true;
  }

  abrirModalCrearParaTUPAC() {
    if (!this.tupacFiltro) {
      this.abrirModalCrear();
      return;
    }
    
    const tupac = this.tupacs.find(t => t.id === this.tupacFiltro);
    this.tupacSeleccionado = tupac ? {
      id: tupac.id,
      codigo: tupac.codigo,
      descripcion: tupac.descripcion,
      categoria: tupac.categoria,
      estado: tupac.estado
    } : null;
    this.requisitoSeleccionado = null;
    this.mostrarModalRequisito = true;
  }

  abrirModalEditar(requisito: RequisitoTUPAC) {
    this.tupacSeleccionado = requisito.tupac ? {
      id: requisito.tupac.id,
      codigo: requisito.tupac.codigo,
      descripcion: requisito.tupac.nombre,
      categoria: '',
      estado: 'vigente'
    } : null;
    this.requisitoSeleccionado = { ...requisito };
    this.mostrarModalRequisito = true;
  }

  cerrarModalRequisito() {
    this.mostrarModalRequisito = false;
    this.tupacSeleccionado = null;
    this.requisitoSeleccionado = null;
  }

  onRequisitoGuardado() {
    this.cargarDatosIniciales();
    this.cerrarModalRequisito();
    this.notificationService.success('Requisito guardado correctamente', 'Éxito');
  }

  toggleActivo(requisito: RequisitoTUPAC) {
    const nuevoEstado = !requisito.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Estás seguro de ${accion} el requisito ${requisito.codigo}?`)) {
      return;
    }

    const observable = nuevoEstado
      ? this.requisitoService.activar(requisito.id!)
      : this.requisitoService.desactivar(requisito.id!);

    observable.subscribe({
      next: () => {
        this.notificationService.success(`Requisito ${accion}do correctamente`, 'Éxito');
        this.cargarDatosIniciales();
      },
      error: (err: any) => {
        console.error(`Error ${accion}ando requisito:`, err);
        this.notificationService.error(err.error?.message || `Error al ${accion} requisito`, 'Error');
      }
    });
  }

  activarRequisito(requisito: RequisitoTUPAC) {
    if (!confirm(`¿Estás seguro de activar el requisito ${requisito.codigo}?`)) {
      return;
    }

    this.requisitoService.activar(requisito.id!).subscribe({
      next: () => {
        this.notificationService.success('Requisito activado correctamente', 'Éxito');
        this.cargarDatosIniciales();
      },
      error: (err: any) => {
        console.error('Error activando requisito:', err);
        this.notificationService.error(err.error?.message || 'Error al activar requisito', 'Error');
      }
    });
  }

  desactivarRequisito(requisito: RequisitoTUPAC) {
    if (!confirm(`¿Estás seguro de desactivar el requisito ${requisito.codigo}?`)) {
      return;
    }

    this.requisitoService.desactivar(requisito.id!).subscribe({
      next: () => {
        this.notificationService.success('Requisito desactivado correctamente', 'Éxito');
        this.cargarDatosIniciales();
      },
      error: (err: any) => {
        console.error('Error desactivando requisito:', err);
        this.notificationService.error(err.error?.message || 'Error al desactivar requisito', 'Error');
      }
    });
  }

  verFormato(requisito: RequisitoTUPAC) {
    if (!requisito.formato || !requisito.formato.id) {
      this.error = 'Este requisito no tiene formato asociado';
      setTimeout(() => this.error = null, 3000);
      return;
    }

    this.formatoService.download(requisito.formato.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.open(url, '_blank');
        if (!a) {
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = requisito.formato?.descripcion || 'formato.pdf';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(downloadLink);
          this.success = 'Descarga iniciada';
          setTimeout(() => this.success = null, 2000);
        } else {
          this.success = 'Formato abierto en nueva ventana';
          setTimeout(() => this.success = null, 2000);
        }
      },
      error: (err) => {
        this.error = 'Error al abrir el formato';
        console.error('Error abriendo formato:', err);
      }
    });
  }

   eliminar(requisito: RequisitoTUPAC) {
     if (!confirm(`¿Estás seguro de eliminar el requisito ${requisito.codigo}?`)) {
       return;
     }

     this.requisitoService.eliminar(requisito.id!).subscribe({
       next: () => {
         this.notificationService.success('Requisito eliminado correctamente', 'Éxito');
         this.cargarDatosIniciales();
       },
       error: (err: any) => {
         console.error('Error eliminando requisito:', err);
         this.notificationService.error(err.error?.message || 'Error al eliminar requisito', 'Error');
       }
     });
   }

  filtrarPorTUPAC() {}
  filtrarPorTipoDocumento() {}
  filtrarPorEstado() {}
  buscar() {}

  public destacarRequisito(requisitoId: number) {
    this.requisitoDestacadoId = requisitoId;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.requisitoDestacadoId = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}

/*
 ============================================
 EXPLICACIÓN DE LOS BOTONES DE ACCIÓN
 ============================================

Estructura HTML de un botón:
---------------------------------------
<button class="action-btn view" (click)="verFormato(requisito)" title="Ver formato">
  <app-icon name="eye" size="sm"></app-icon>
  <span class="btn-text">Ver</span>
</button>

Clases CSS principales:
---------------------------------------
1. .action-btn (base):
   - display: inline-flex → layout flexible en línea
   - align-items: center → centra verticalmente icono y texto
   - gap: 0.25rem → espacio pequeño entre icono y texto
   - padding: 0.375rem 0.75rem → tamaño cómodo para clic
   - border-radius: 0.5rem → bordes redondeados
   - border: 1px solid transparent → borde invisible por defecto
   - cursor: pointer → cambia a manita
   - transition: all 0.2s → animación suave en cambios

2. Variantes por tipo (ej: .action-btn.view):
   - background-color: color de fondo pastel
   - color: color del texto e icono
   - border-color: color del borde (igual que fondo pero más oscuro)
   - &:hover → color más intenso

3. .btn-text:
   - font-size: 0.75rem → texto pequeño (12px)

Colores por acción:
---------------------------------------
• view (Ver): verde (#dcfce7 fondo, #166534 texto)
• edit (Editar): azul (#dbeafe fondo, #2563eb texto)
• delete (Eliminar): rojo (#fee2e2 fondo, #dc2626 texto)
• toggle-active (Desactivar): amarillo (#fef9c3 fondo, #ca8a04 texto)
• toggle-inactive (Activar): verde (igual que view)
• view-disabled: gris claro, cursor not-allowed

Cómo usar en otros componentes:
---------------------------------------
1. Copiar las clases CSS de .action-btn y sus variantes
2. Usar la estructura: <button class="action-btn [tipo]">
3. Incluir <app-icon> y <span class="btn-text">Texto</span>
4. Asegurar que el botón tenga (click) para la acción
5. Para botones deshabilitados, agregar [disabled] y clase view-disabled

Responsividad:
---------------------------------------
- .action-buttons tiene flex-wrap: wrap → los botones saltan a nueva línea si no caben
- Esto asegura que siempre se vean bien en cualquier tamaño de pantalla
*/