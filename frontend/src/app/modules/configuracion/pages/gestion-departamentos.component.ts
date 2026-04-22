import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DepartamentoService, DepartamentoService as DepartamentoServiceType, UsuarioResumen } from '../services/departamento.service';
import { Departamento } from '../models/departamento.model';
import { UserService } from '../../../core/auth/services/user.service';
import { User, UserProfile } from '../../../core/auth/models/user.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-gestion-departamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
            <div class="header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div class="header-text">
              <h1 class="page-title">Departamentos</h1>
              <p class="page-subtitle">Gestiona los departamentos del sistema</p>
            </div>
          </div>
          <button (click)="abrirModal()" class="btn btn-primary">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Departamento
          </button>
        </div>
  
        <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ departamentos.length }}</span>
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
            <label class="filter-label">Buscar</label>
            <input type="text" [(ngModel)]="filtro" placeholder="Buscar por nombre..." class="filter-input">
          </div>
          <div class="filter-actions">
            <button class="btn btn-secondary" (click)="cargarDepartamentos()">
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
          <span>Cargando...</span>
        </div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (dept of getDepartamentosFiltrados(); track dept.id) {
               <tr>
                 <td>{{ dept.nombre }}</td>
                 <td>{{ dept.descripcion }}</td>
                  <td>
                    <span [class]="'status-badge ' + (dept.activo ? 'status-active' : 'status-inactive')">
                      {{ dept.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                   <td>
                     <div class="action-buttons">
                       <button class="btn-icon btn-edit" (click)="editar(dept)" title="Editar">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                         </svg>
                       </button>
                       @if (dept.activo) {
                         <button class="btn-icon btn-toggle-inactive" (click)="desactivar(dept)" title="Desactivar">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                           </svg>
                         </button>
                       } @else {
                         <button class="btn-icon btn-toggle-active" (click)="activar(dept)" title="Activar">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                           </svg>
                         </button>
                       }
                       <button class="btn-icon btn-delete" (click)="eliminar(dept)" title="Eliminar">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                         </svg>
                       </button>
                       <button class="btn-icon btn-users" (click)="abrirModalUsuarios(dept)" title="Gestionar Usuarios">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                         </svg>
                       </button>
                     </div>
                   </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <p>No se encontraron departamentos</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal -->
    @if (mostrarModal) {
      <div class="modal-overlay" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="!modoEditar" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                <path *ngIf="modoEditar" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ modoEditar ? 'Editar' : 'Nuevo' }} Departamento
            </h2>
            <button class="modal-close" (click)="cerrarModal()">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" [(ngModel)]="form.nombre" class="form-input" placeholder="Ej: Revisión Documental">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="form.descripcion" class="form-input" rows="3" placeholder="Descripción del departamento"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardar()">
              {{ modoEditar ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    }
    
    <!-- Modal Gestión de Usuarios -->
    @if (mostrarModalUsuarios) {
      <div class="modal-overlay" (click)="cerrarModalUsuarios()">
        <div class="modal-content modal-users" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Gestionar Usuarios - {{ departamentoGestionando?.nombre }}
            </h2>
            <button class="modal-close" (click)="cerrarModalUsuarios()">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <!-- Filtro de usuarios -->
            <div class="filter-section">
              <input type="text" [(ngModel)]="filtroUsuarios" class="filter-input" placeholder="Buscar usuario por nombre o email...">
            </div>
            
            @if (cargandoUsuarios) {
              <div class="loading-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>Cargando usuarios...</span>
              </div>
            } @else {
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of getUsuariosFiltrados(); track user.id) {
                      <tr>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.role.name || 'N/A' }}</td>
                         <td>
                           <span [class]="'status-badge ' + (user.activo ? 'status-active' : 'status-inactive')">
                             {{ user.activo ? 'Activo' : 'Inactivo' }}
                           </span>
                         </td>
                         <td>
                           @if (estaAsignadoAlDepartamento(user)) {
                            <button class="btn-action btn-remove" (click)="desasignarUsuario(user.id)" title="Desasignar del departamento">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                              Desasignar
                            </button>
                          } @else {
                            <button class="btn-action btn-add" (click)="asignarUsuario(user.id)" title="Asignar al departamento">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                              </svg>
                              Asignar
                            </button>
                          }
                        </td>
                      </tr>
                    }
                    @empty {
                      <tr>
                        <td colspan="5" class="empty-state">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                          </svg>
                          <p>No se encontraron usuarios</p>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalUsuarios()">Cerrar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .header-content { display: flex; align-items: center; gap: 12px; }
    .header-back { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #f3f4f6; color: #6b7280; }
    .header-back:hover { background: #e5e7eb; }
    .header-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); display: flex; align-items: center; justify-content: center; color: #16a34a; }
    .page-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0 0; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: #2563eb; color: white; border: 1px solid #1d4ed8; }
    .btn-primary:hover { background: #1d4ed8; border-color: #1e40af; }
    .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }
    .btn-secondary:hover { background: #f9fafb; border-color: #9ca3af; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.blue { background: #dbeafe; color: #2563eb; }
    .stat-icon.green { background: #dcfce7; color: #16a34a; }
    .stat-label { font-size: 13px; color: #6b7280; }
    .stat-value { font-size: 24px; font-weight: 700; color: #111827; }
    .filters-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .filters-row { display: flex; gap: 16px; align-items: flex-end; }
    .filter-group { flex: 1; }
    .filter-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .filter-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; }
    .data-table td { padding: 12px 16px; border-top: 1px solid #e5e7eb; }
    .code-badge { font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
    .status-badge { padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .status-active { background: #dcfce7; color: #16a34a; }
    .status-inactive { background: #fee2e2; color: #dc2626; }
     .action-buttons {
       display: flex;
       gap: 0.5rem;
       align-items: center;
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

       &.btn-edit {
         background-color: #dbeafe;
         color: #2563eb;
         border: 1px solid transparent;

         &:hover:not(:disabled) {
           background-color: #2563eb;
           color: white;
           border-color: #1d4ed8;
         }
       }

       &.btn-toggle-inactive {
         background-color: #fef3c7;
         color: #d97706;
         border: 1px solid transparent;

         &:hover:not(:disabled) {
           background-color: #fde68a;
           color: #92400e;
           border-color: #fcd34d;
         }
       }

       &.btn-toggle-active {
         background-color: #dcfce7;
         color: #16a34a;
         border: 1px solid transparent;

         &:hover:not(:disabled) {
           background-color: #16a34a;
           color: white;
           border-color: #15803d;
         }
       }

       &.btn-delete {
         background-color: #fee2e2;
         color: #dc2626;
         border: 1px solid transparent;

         &:hover:not(:disabled) {
           background-color: #dc2626;
           color: white;
           border-color: #b91c1c;
         }
       }

       &:disabled {
         opacity: 0.5;
         cursor: not-allowed;
       }
     }
    .empty-state { text-align: center; padding: 40px; color: #6b7280; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: #6b7280; }
    .alert { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; border-left: 3px solid; }
     .modal-body .alert { margin-bottom: 12px; }
     .alert-error { background: #fef2f2; color: #dc2626; border-left-color: #dc2626; }
     .alert-success { background: #f0fdf4; color: #16a34a; border-left-color: #16a34a; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
    .modal-content { background: white; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { display: flex; align-items: center; font-size: 18px; font-weight: 600; margin: 0; }
    .modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; }
    .modal-close:hover { background: #f3f4f6; }
    .modal-body { padding: 20px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    
    /* Modal Users Styles */
    .modal-users { max-width: 800px; }
    .filter-section { margin-bottom: 16px; }
    .table-container { overflow-x: auto; max-height: 400px; overflow-y: auto; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 600px; }
    .data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; position: sticky; top: 0; z-index: 10; }
    .data-table td { padding: 12px 16px; border-top: 1px solid #e5e7eb; }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      
      svg { width: 14px; height: 14px; }
      
      &.btn-add {
        background: #dcfce7;
        color: #16a34a;
        
        &:hover { background: #16a34a; color: white; }
      }
      
      &.btn-remove {
        background: #fee2e2;
        color: #dc2626;
        
        &:hover { background: #dc2626; color: white; }
      }
    }
  `]
})
export class GestionDepartamentosComponent implements OnInit {
  departamentos: Departamento[] = [];
  cargando = false;
  filtro = '';
  mostrarModal = false;
  modoEditar = false;
  departamentoEditando: Departamento | null = null;
  form = { nombre: '', descripcion: '' };
  
   // Gestión de usuarios
   mostrarModalUsuarios = false;
   departamentoGestionando: Departamento | null = null;
   usuariosAsignados: UsuarioResumen[] = [];
   todosLosUsuarios: UsuarioResumen[] = [];
   cargandoUsuarios = false;
   filtroUsuarios = '';

  constructor(
    private departamentoService: DepartamentoServiceType,
    private userService: UserService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarDepartamentos();
  }

  cargarDepartamentos() {
    this.cargando = true;

    this.departamentoService.listarTodos().subscribe({
      next: (departamentos) => {
        this.departamentos = departamentos;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.error(
          'Error al cargar departamentos',
          'Error',
          5000
        );
        console.error('Error cargando departamentos:', err);
      }
    });
  }

  getDepartamentosFiltrados() {
    return this.departamentos.filter(d =>
      !this.filtro || d.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  getActivos() {
    return this.departamentos.filter(d => d.activo).length;
  }

  abrirModal() {
    this.modoEditar = false;
    this.departamentoEditando = null;
    this.form = { nombre: '', descripcion: '' };
    this.mostrarModal = true;
  }

  editar(dept: Departamento) {
    this.modoEditar = true;
    this.departamentoEditando = dept;
    this.form = { nombre: dept.nombre, descripcion: dept.descripcion || '' };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (!this.form.nombre) {
      this.notificationService.warning(
        'El nombre es requerido',
        'Validación',
        3000
      );
      return;
    }

    if (this.modoEditar && this.departamentoEditando) {
      // Actualizar departamento existente
      this.departamentoService.actualizar(this.departamentoEditando.id, this.form).subscribe({
        next: (departamentoActualizado) => {
          this.cargarDepartamentos(); // Recargar datos
          this.notificationService.success(
            'Departamento actualizado correctamente',
            'Éxito',
            3000
          );
          this.cerrarModal();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Error al actualizar departamento';
          this.notificationService.error(errorMessage, 'Error', 5000);
          console.error('Error actualizando departamento:', err);
        }
      });
    } else {
      // Crear nuevo departamento
      this.departamentoService.crear(this.form).subscribe({
        next: (nuevoDepartamento) => {
          this.cargarDepartamentos(); // Recargar datos
          this.notificationService.success(
            `Departamento "${nuevoDepartamento.nombre}" creado exitosamente`,
            'Éxito',
            3000
          );
          this.cerrarModal();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Error al crear departamento';
          this.notificationService.error(errorMessage, 'Error', 5000);
          console.error('Error creando departamento:', err);
        }
      });
    }
  }

  activar(dept: Departamento) {
    this.departamentoService.activar(dept.id).subscribe({
      next: () => {
        this.cargarDepartamentos();
        this.notificationService.success(
          `Departamento "${dept.nombre}" activado correctamente`,
          'Éxito',
          3000
        );
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Error al activar departamento';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error activando departamento:', err);
      }
    });
  }

  desactivar(dept: Departamento) {
    this.departamentoService.desactivar(dept.id).subscribe({
      next: () => {
        this.cargarDepartamentos();
        this.notificationService.success(
          `Departamento "${dept.nombre}" desactivado correctamente`,
          'Éxito',
          3000
        );
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Error al desactivar departamento';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error desactivando departamento:', err);
      }
    });
  }

  eliminar(dept: Departamento) {
    if (!confirm(`¿Está seguro de eliminar el departamento "${dept.nombre}"?`)) {
      return;
    }

    this.departamentoService.eliminar(dept.id).subscribe({
      next: () => {
        this.cargarDepartamentos();
        this.notificationService.success(
          `Departamento "${dept.nombre}" eliminado correctamente`,
          'Éxito',
          3000
        );
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Error al eliminar departamento';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error eliminando departamento:', err);
      }
    });
  }

  // ========== GESTIÓN DE USUARIOS ==========
  
  abrirModalUsuarios(dept: Departamento) {
    this.departamentoGestionando = dept;
    this.mostrarModalUsuarios = true;
    this.filtroUsuarios = '';
    this.cargarUsuarios();
  }

  cerrarModalUsuarios() {
    this.mostrarModalUsuarios = false;
    this.departamentoGestionando = null;
    this.usuariosAsignados = [];
    this.todosLosUsuarios = [];
    this.filtroUsuarios = '';
  }

  cargarUsuarios() {
    if (!this.departamentoGestionando) return;
    
    this.cargandoUsuarios = true;
    
    // Cargar todos los usuarios activos con flag de asignación
    this.departamentoService.obtenerUsuarios(this.departamentoGestionando.id).subscribe({
      next: (usuarios) => {
        // Separar usuarios asignados y no asignados
        this.usuariosAsignados = usuarios.filter(u => u.asignado);
        this.todosLosUsuarios = usuarios;
        this.cargandoUsuarios = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando usuarios del departamento:', err);
        this.notificationService.error(
          'Error al cargar usuarios del departamento',
          'Error',
          5000
        );
        this.cargandoUsuarios = false;
      }
    });
  }

  getUsuariosFiltrados(): UsuarioResumen[] {
    // Si no hay filtro, mostrar solo los asignados (si hay 2 o menos)
    // Si hay más de 2 asignados, mostrar todos los asignados
    if (!this.filtroUsuarios) {
      return this.usuariosAsignados;
    }
    
    // Con filtro: buscar en TODOS los usuarios (asignados y no asignados)
    const filtroLower = this.filtroUsuarios.toLowerCase();
    const todosFiltrados = this.todosLosUsuarios.filter(u =>
      u.username.toLowerCase().includes(filtroLower) ||
      u.email.toLowerCase().includes(filtroLower) ||
      (u.role?.name?.toLowerCase().includes(filtroLower))
    );
    
    return todosFiltrados;
  }
  
  estaAsignadoAlDepartamento(usuario: UsuarioResumen): boolean {
    return usuario.asignado;
  }

  asignarUsuario(usuarioId: number) {
    if (!this.departamentoGestionando) return;

    this.departamentoService.asignarUsuario(this.departamentoGestionando.id, usuarioId).subscribe({
      next: () => {
        this.notificationService.success(
          'Usuario asignado correctamente al departamento',
          'Éxito',
          3000
        );
        // Actualizar flag localmente
        const usuario = this.todosLosUsuarios.find(u => u.id === usuarioId);
        if (usuario) {
          usuario.asignado = true;
          // Agregar a la lista de asignados si no está
          if (!this.usuariosAsignados.find(u => u.id === usuarioId)) {
            this.usuariosAsignados.push(usuario);
          }
        }
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Error al asignar usuario';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error asignando usuario:', err);
      }
    });
  }

  desasignarUsuario(usuarioId: number) {
    if (!this.departamentoGestionando) return;
    
    if (!confirm('¿Está seguro de desasignar este usuario del departamento?')) {
      return;
    }
    
    this.departamentoService.desasignarUsuario(this.departamentoGestionando.id, usuarioId).subscribe({
      next: () => {
        this.notificationService.success(
          'Usuario desasignado correctamente del departamento',
          'Éxito',
          3000
        );
        // Actualizar flag localmente
        const usuario = this.todosLosUsuarios.find(u => u.id === usuarioId);
        if (usuario) {
          usuario.asignado = false;
          // Remover de la lista de asignados
          this.usuariosAsignados = this.usuariosAsignados.filter(u => u.id !== usuarioId);
        }
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Error al desasignar usuario';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error desasignando usuario:', err);
      }
    });
  }
}
