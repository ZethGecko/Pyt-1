import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { TUPACService } from '../services/tupac.service';
import { TUPAC, EstadoTUPAC } from '../models/tupac.model';
import { RequisitoTUPACService, RequisitoTUPAC } from '../services/requisito-tupac.service';
import { RequisitoTUPACEnriquecidoProjection, RequisitoTUPACCreateRequest, RequisitoTUPACUpdateRequest, TIPOS_DOCUMENTO } from '../models/requisito-tupac.model';
import { RequisitoFormModalComponent } from '../components/requisito-form-modal/requisito-form-modal.component';
import { FormatoService } from '../services/formato.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TipoTramiteService } from '../services/tipo-tramite.service';
import { TipoTramite, TipoTramiteEnriquecido } from '../models/tipo-tramite.model';

@Component({
  selector: 'app-gestion-tupac',
  standalone: true,
  imports: [CommonModule, FormsModule, RequisitoFormModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">TUPA</h1>
            <p class="page-subtitle">Tablas de Requisitos Únicos de Procedimientos</p>
          </div>
        </div>
        <button (click)="abrirModal()" class="btn btn-primary">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo TUPA
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Buscar</label>
            <input type="text" [(ngModel)]="filtro" placeholder="Buscar por código o nombre..." class="filter-input">
          </div>
          <div class="filter-group">
            <label class="filter-label">Categoría</label>
            <select [(ngModel)]="filtroCategoria" class="filter-select">
              <option value="">Todas</option>
              <option value="Licencia">Licencia</option>
              <option value="TUC">TUC</option>
              <option value="Constancia">Constancia</option>
              <option value="Permiso de Operaciones">Permiso de Operaciones</option>
            </select>
          </div>
          <div class="filter-actions">
            <button class="btn btn-secondary" (click)="cargarTupacs()">
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
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (tupac of tupacsPaginados; track tupac.id) {
                <tr>
                  <td><span class="code-badge">{{ tupac.codigo }}</span></td>
                  <td>{{ tupac.descripcion }}</td>
                  <td><span class="category-badge">{{ tupac.categoria }}</span></td>
                  <td class="descripcion-cell">{{ tupac.descripcion }}</td>
                  <td>
                    <span [class]="'status-badge ' + (tupac.estado === 'vigente' ? 'status-active' : 'status-inactive')">
                      {{ tupac.estado === 'vigente' ? 'Vigente' : tupac.estado === 'en_revision' ? 'En Revisión' : 'Archivado' }}
                    </span>
                  </td>
                   <td>
                     <div class="action-buttons">
                        <button class="btn-icon btn-view" (click)="abrirModalRequisitos(tupac)" title="Ver Requisitos">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button class="btn-icon btn-view" (click)="abrirModalTiposTramite(tupac)" title="Ver Tipos de Trámite">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                        </button>
                       <button class="btn-icon btn-edit" (click)="editar(tupac)" title="Editar">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                         </svg>
                       </button>
                       @if (tupac.estado === 'vigente') {
                         <button class="btn-icon btn-toggle-inactive" (click)="desactivar(tupac)" title="Archivar">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                           </svg>
                         </button>
                       } @else {
                         <button class="btn-icon btn-toggle-active" (click)="activar(tupac)" title="Activar">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                           </svg>
                         </button>
                       }
                       <button class="btn-icon btn-delete" (click)="eliminar(tupac)" title="Eliminar">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                         </svg>
                       </button>
                     </div>
                   </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p>No se encontraron TUPAs</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal TUPA -->
    @if (mostrarModal) {
      <div class="modal-overlay" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="!modoEditar" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                <path *ngIf="modoEditar" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ modoEditar ? 'Editar' : 'Nuevo' }} TUPA
            </h2>
            <button class="modal-close" (click)="cerrarModal()">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Código *</label>
              <input type="text" [(ngModel)]="form.codigo" class="form-input" placeholder="Ej: TUPA-001">
            </div>
            <div class="form-group">
              <label>Descripción *</label>
              <textarea [(ngModel)]="form.descripcion" class="form-input" rows="3" placeholder="Descripción del TUPA"></textarea>
            </div>
            <div class="form-group">
              <label>Categoría *</label>
              <select [(ngModel)]="form.categoria" class="form-select">
                <option value="">Seleccionar categoría</option>
                <option value="Licencia">Licencia</option>
                <option value="TUC">TUC</option>
                <option value="Constancia">Constancia</option>
                <option value="Permiso de Operaciones">Permiso de Operaciones</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select [(ngModel)]="form.estado" class="form-input">
                <option value="vigente">Vigente</option>
                <option value="en_revision">En Revisión</option>
                <option value="archivado">Archivado</option>
              </select>
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

    <!-- Modal Requisitos TUPA -->
    @if (tupacSeleccionado) {
      <div class="modal-overlay" (click)="cerrarModalRequisito()">
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <button type="button" class="modal-back-icon-only" (click)="cerrarModalRequisito()" title="Volver atrás">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <div class="requisitos-title">
              <h2>Requisitos de: {{ tupacSeleccionado.codigo }} - {{ tupacSeleccionado.descripcion }}</h2>
            </div>
            <button class="modal-close" (click)="cerrarModalRequisito()">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <!-- Botón Nuevo Requisito -->
            <div class="requisito-actions" style="margin-bottom: 1rem; text-align: right;">
              <button class="btn btn-primary btn-sm" (click)="abrirModalCrearRequisito()">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nuevo Requisito
              </button>
            </div>

            <!-- Tabla de Requisitos -->
            @if (cargandoRequisitos) {
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
                      <th>Tipo</th>
                      <th>Formato</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (requisito of requisitos; track requisito.id) {
                      <tr [class.highlight-row]="requisitoDestacadoId === requisito.id">
                        <td><span class="code-badge">{{ requisito.codigo }}</span></td>
                        <td class="descripcion-column">
                          <div class="descripcion-cell">
                            <span>{{ requisito.descripcion }}</span>
                          </div>
                        </td>
                        <td>
                          <span class="tipo-badge">{{ requisito.tipoDocumento || 'N/A' }}</span>
                        </td>
                        <td>
                          @if (requisito.formatoId) {
                            <span class="formato-badge" title="Formato ID: {{ requisito.formatoId }}">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                              Formato #{{ requisito.formatoId }}
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
                             @if (requisito.formatoId) {
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
                             <button class="btn-icon btn-edit" (click)="abrirModalEditarRequisito(requisito)" title="Editar requisito">
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
                             <button class="btn-icon btn-delete" (click)="eliminarRequisito(requisito)" title="Eliminar requisito">
                               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                               </svg>
                             </button>
                           </div>
                         </td>
                       </tr>
                     } @empty {
                       <tr>
                         <td colspan="6" class="empty-state">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                           </svg>
                           <p>No hay requisitos registrados para este TUPA</p>
                           <button class="btn btn-primary btn-sm" (click)="abrirModalCrearRequisito()" style="margin-top: 1rem;">
                             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                             </svg>
                             Crear primer requisito
                           </button>
                         </td>
                       </tr>
                     }
                   </tbody>
                 </table>
               </div>
             }
             
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
                   ({{getTupacsFiltrados().length}} registros)
                 </span>
                 
                 <button (click)="cambiarPagina(paginaActual + 1)"
                         [disabled]="paginaActual === paginasTotales"
                         class="btn btn-outline btn-sm">
                   Siguiente
                 </button>
               </div>
             }
           </div>
         </div>
       </div>
     }

    <!-- Modal Requisito (Componente reutilizable) -->
    <app-requisito-form-modal
      [mostrar]="mostrarModalRequisito"
      [tupac]="tupacSeleccionado"
      [requisito]="requisitoSeleccionado"
      (cerrar)="cerrarModalRequisito()"
      (guardado)="onRequisitoGuardado()">
    </app-requisito-form-modal>

    <!-- Modal Tipos de Trámite -->
    @if (mostrarModalTiposTramite) {
    <div class="modal-overlay" (click)="mostrarModalTiposTramite = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">
            Tipos de Trámite del TUPA
            <span class="badge">{{ tupacSeleccionadoParaTipos?.codigo }}</span>
          </h2>
          <button class="modal-close" (click)="mostrarModalTiposTramite = false">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          @if (cargandoTiposTramite) {
            <div class="loading-state">
              <span>Cargando tipos de trámite...</span>
            </div>
          } @else if (tiposTramite.length === 0) {
            <div class="empty-state">
              <p>No hay tipos de trámite asociados a este TUPA</p>
            </div>
          } @else {
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Días Descargo</th>
                    <th>TUPAC</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tipo of tiposTramite; track tipo.id) {
                    <tr>
                      <td><span class="code-badge">{{ tipo.codigo }}</span></td>
                      <td>{{ tipo.descripcion }}</td>
                      <td>{{ tipo.diasDescargo || '-' }}</td>
                      <td>
                        <span class="code-badge">{{ tipo.tupacCodigo }}</span>
                        <small class="text-muted">{{ tipo.tupacDescripcion }}</small>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
    }
  `,
    styles: [`    :host {
      display: block;
    }

    /* Modal grande para tipos de trámite */
    :host ::ng-deep .modal-large {
      max-width: 900px;
      width: 90%;
    }

    /* Grid de estadísticas */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    /* Tarjeta de estadística */
    .stat-card {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid #e5e7eb;
      transition: box-shadow 0.2s;
    }

    .stat-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .stat-icon {
      padding: 0.75rem;
      border-radius: 9999px;
      flex-shrink: 0;
    }

    .stat-icon.purple {
      background-color: #e9d5ff;
      color: #7c3aed;
    }

    .stat-icon.green {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .stat-icon.blue {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .stat-icon.small {
      padding: 0.5rem;
      width: 40px;
      height: 40px;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    /* Filtros */
    .filters-card {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      padding: 1.25rem;
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
      min-width: 200px;
    }

    .filter-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .filter-input, .filter-select {
      width: 100%;
      padding: 0.625rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background-color: white;
      transition: all 0.2s;
    }

    .filter-input:focus, .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Tabla */
    .table-card {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      padding: 0.75rem 1rem;
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
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    .data-table tr {
      transition: background-color 0.15s;
    }

    .data-table tr:hover {
      background-color: #eff6ff;
    }

    .descripcion-cell {
      white-space: normal;
      word-wrap: break-word;
      max-width: 180px;
      line-height: 1.5;
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

    /* Botones de acción */
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: nowrap;
    }

     /* Botones de acción - Estilo icon-only */
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
       }
     }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
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

    /* Modal TUPA */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      border: 1px solid #e5e7eb;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 2px solid #f3f4f6;
      background-color: #fafafa;
      border-radius: 12px 12px 0 0;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background-color: #f3f4f6;
      color: #111827;
    }

    .modal-back-icon-only {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background-color: white;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      width: 36px;
      height: 36px;

      &:hover {
        background-color: #f9fafb;
        border-color: #9ca3af;
      }
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #374151;
        font-size: 0.875rem;
      }
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: #374151;
      background-color: white;
      transition: all 0.2s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 2px solid #f3f4f6;
      background-color: #fafafa;
      border-radius: 0 0 12px 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 100px;

      &.btn-sm {
        padding: 0.375rem 0.75rem;
        min-width: auto;
        font-size: 0.75rem;

        svg {
          width: 14px;
          height: 14px;
        }
      }
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
      border-color: #2563eb;

      &:hover:not(:disabled) {
        background-color: #2563eb;
        border-color: #1d4ed8;
      }
    }

    .btn-secondary {
      background-color: white;
      color: #6b7280;
      border-color: #d1d5db;

      &:hover:not(:disabled) {
        background-color: #f9fafb;
        border-color: #9ca3af;
        color: #374151;
      }
    }

    /* Modal grande para lista de requisitos */
    .modal-large {
      max-width: 90%;
      width: 1200px;
      max-height: 90vh;
    }

    .modal-large .modal-body {
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }

    .highlight-row {
      background-color: #f0f9ff !important;
    }

     .tipo-badge {
       display: inline-block;
       padding: 0.25rem 0.75rem;
       border-radius: 0.375rem;
       font-size: 0.75rem;
       font-weight: 600;
       background-color: #f3f4f6;
       color: #374151;
       border: 1px solid #e5e7eb;
     }

     .formato-badge {
       display: inline-flex;
       align-items: center;
       gap: 0.25rem;
       padding: 0.25rem 0.75rem;
       border-radius: 0.375rem;
       font-size: 0.75rem;
       font-weight: 500;
       background-color: #dcfce7;
       color: #16a34a;
       border: 1px solid #bbf7d6;
     }

     .no-formato-badge {
       display: inline-block;
       padding: 0.25rem 0.75rem;
       border-radius: 0.375rem;
       font-size: 0.75rem;
       font-weight: 500;
       background-color: #f3f4f6;
       color: #6b7280;
       border: 1px solid #e5e7eb;
     }

      .btn-icon:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: #f3f4f6;
        color: #9ca3af;
      }

      @media (max-width: 640px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .filters-row {
          flex-direction: column;
        }

        .filter-group {
          min-width: 100%;
        }

        .data-table {
          display: block;
          overflow-x: auto;
        }

        .action-buttons {
          flex-wrap: wrap;
        }
      }
    `]
})
export class GestionTUPACComponent implements OnInit {
  tupacs: TUPAC[] = [];
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 15;
  get paginasTotales(): number {
    const tupacsFiltrados = this.getTupacsFiltrados();
    return Math.ceil(tupacsFiltrados.length / this.itemsPorPagina);
  }
  get tupacsPaginados(): TUPAC[] {
    const tupacsFiltrados = this.getTupacsFiltrados();
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return tupacsFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }
  
  cargando = false;
  filtro = '';
  filtroCategoria = '';

  // Modal TUPA
  mostrarModal = false;
  modoEditar = false;
  tupacEditando: TUPAC | null = null;
  form = { codigo: '', descripcion: '', categoria: '', estado: 'vigente' as EstadoTUPAC };

  // Gestión de Requisitos
  tupacSeleccionado: TUPAC | null = null;
  requisitos: RequisitoTUPACEnriquecidoProjection[] = [];
  cargandoRequisitos = false;
  requisitoDestacadoId: number | null = null;

  requisitoSeleccionado: RequisitoTUPAC | null = null;

  // Modal Requisito (Componente reutilizable)
  mostrarModalRequisito = false;

  // Gestión de Tipos de Trámite
  tiposTramite: TipoTramiteEnriquecido[] = [];
  tupacSeleccionadoParaTipos: TUPAC | null = null;
  cargandoTiposTramite = false;
  mostrarModalTiposTramite = false;

  constructor(
    private router: Router,
    private tupacService: TUPACService,
    private requisitoService: RequisitoTUPACService,
    private formatoService: FormatoService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private tipoTramiteService: TipoTramiteService
  ) {}

  ngOnInit() {
    this.cargarTupacs();
  }

  cargarTupacs() {
    this.cargando = true;

    this.tupacService.listarTodos().subscribe({
      next: (data: TUPAC[]) => {
        this.tupacs = data;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando TUPACs:', err);
        this.notificationService.error('Error al cargar los TUPACs', 'Error');
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getTupacsFiltrados() {
    return this.tupacs.filter(t => {
      const coincideBusqueda = !this.filtro ||
        t.codigo.toLowerCase().includes(this.filtro.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(this.filtro.toLowerCase());
      const coincideCategoria = !this.filtroCategoria || t.categoria === this.filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
  }

  getActivos() {
    return this.tupacs.filter(t => t.estado === 'vigente').length;
  }

  getRequisitosActivos(): number {
    return this.requisitos.filter(r => r.activo).length;
  }

  abrirModalRequisitos(tupac: TUPAC) {
    this.tupacSeleccionado = tupac;
    this.cargarRequisitos(tupac.id!);
  }

  abrirModalTiposTramite(tupac: TUPAC) {
    this.tupacSeleccionadoParaTipos = tupac;
    this.mostrarModalTiposTramite = true;
    this.cargarTiposTramite(tupac.id!);
  }

  cargarTiposTramite(tupacId: number) {
    this.cargandoTiposTramite = true;
    this.tipoTramiteService.listarTodos().subscribe({
      next: (data: TipoTramiteEnriquecido[]) => {
        this.tiposTramite = data.filter(tt => tt.tupacId === tupacId);
        this.cargandoTiposTramite = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tipos de trámite:', error);
        this.cargandoTiposTramite = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // ==== Métodos TUPAC ====
  abrirModal() {
    this.modoEditar = false;
    this.tupacEditando = null;
    this.form = { codigo: '', descripcion: '', categoria: '', estado: 'vigente' };
    this.mostrarModal = true;
  }

  editar(tupac: TUPAC) {
    this.modoEditar = true;
    this.tupacEditando = tupac;
    this.form = {
      codigo: tupac.codigo,
      descripcion: tupac.descripcion,
      categoria: tupac.categoria,
      estado: tupac.estado as EstadoTUPAC || 'vigente'
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (!this.form.codigo.trim()) {
      this.notificationService.error('El código es requerido', 'Validación');
      return;
    }
    if (!this.form.descripcion.trim()) {
      this.notificationService.error('La descripción es requerida', 'Validación');
      return;
    }
    if (!this.form.categoria) {
      this.notificationService.error('La categoría es requerida', 'Validación');
      return;
    }

    if (this.modoEditar && this.tupacEditando) {
      this.tupacService.actualizar(this.tupacEditando.id!, {
        codigo: this.form.codigo.trim(),
        descripcion: this.form.descripcion.trim(),
        categoria: this.form.categoria,
        estado: this.form.estado
      }).subscribe({
        next: () => {
          this.cargarTupacs();
          this.notificationService.success('TUPAC actualizado correctamente', 'Éxito');
          this.cerrarModal();
        },
        error: (err: any) => {
          console.error('Error actualizando TUPA:', err);
          this.notificationService.error(err.error?.message || 'Error al actualizar el TUPA', 'Error');
        }
      });
    } else {
      this.tupacService.crear({
        codigo: this.form.codigo.trim(),
        descripcion: this.form.descripcion.trim(),
        categoria: this.form.categoria,
        estado: this.form.estado
      }).subscribe({
        next: () => {
          this.cargarTupacs();
          this.notificationService.success('TUPA creado correctamente', 'Éxito');
          this.cerrarModal();
        },
        error: (err: any) => {
          console.error('Error creando TUPA:', err);
          this.notificationService.error(err.error?.message || 'Error al crear el TUPA', 'Error');
        }
      });
    }
  }

  activar(tupac: TUPAC) {
    this.tupacService.ponerVigente(tupac.id!).subscribe({
      next: () => {
        this.cargarTupacs();
        this.notificationService.success('TUPA activado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error activando TUPA:', err);
        this.notificationService.error(err.error?.message || 'Error al activar el TUPA', 'Error');
      }
    });
  }

  desactivar(tupac: TUPAC) {
   this.tupacService.archivar(tupac.id!).subscribe({
     next: () => {
       this.cargarTupacs();
       this.notificationService.success('TUPA archivado correctamente', 'Éxito');
     },
     error: (err: any) => {
       console.error('Error archivando TUPA:', err);
       this.notificationService.error(err.error?.message || 'Error al archivar el TUPA', 'Error');
     }
   });
 }

  eliminar(tupac: TUPAC) {
    if (!confirm('⚠️ ADVERTENCIA: Al eliminar este TUPA se eliminarán TODOS los datos relacionados:\n\n• Requisitos del TUPA\n• Tipos de trámite asociados\n• Trámites y documentos generados\n\nEsta acción NO se puede deshacer.\n\n¿Está seguro que desea eliminar este TUPA?')) {
      return;
    }

   this.tupacService.eliminar(tupac.id!).subscribe({
     next: () => {
       this.cargarTupacs();
       this.notificationService.success('TUPA eliminado correctamente', 'Éxito');
     },
     error: (err: any) => {
       console.error('Error eliminando TUPA:', err);
       this.notificationService.error(err.error?.message || 'Error al eliminar el TUPA', 'Error');
     }
   });
 }

 // ==== Métodos Requisitos ====
  cargarRequisitos(tupacId: number) {
    this.cargandoRequisitos = true;
    this.requisitoDestacadoId = null;

    this.requisitoService.listarEnriquecidosPorTupac(tupacId).subscribe({
      next: (data: RequisitoTUPACEnriquecidoProjection[]) => {
        this.requisitos = data;
        this.cargandoRequisitos = false;

        // Si hay requisitos y no hay uno destacado, destacar el primero
        if (this.requisitos.length > 0 && !this.requisitoDestacadoId) {
          this.requisitoDestacadoId = this.requisitos[0].id;
        }

        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando requisitos:', err);
        this.notificationService.error('Error al cargar los requisitos', 'Error');
        this.cargandoRequisitos = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  abrirModalCrearRequisito() {
    this.requisitoSeleccionado = null;
    this.mostrarModalRequisito = true;
  }

  abrirModalEditarRequisito(requisito: RequisitoTUPACEnriquecidoProjection) {
    // Convertir la proyección en un objeto RequisitoTUPAC para el formulario
    const requisitoCompleto: RequisitoTUPAC = {
      id: requisito.id,
      codigo: requisito.codigo,
      descripcion: requisito.descripcion,
      tipoDocumento: requisito.tipoDocumento || '',
      obligatorio: requisito.obligatorio,
      esExamen: requisito.esExamen,
      activo: requisito.activo,
      diasValidez: requisito.diasValidez,
      tupac: {
        id: requisito.tupacId,
        codigo: requisito.tupacCodigo,
        nombre: requisito.tupacDescripcion
      },
      formato: requisito.formatoId && requisito.formatoArchivoRuta ? {
        id: requisito.formatoId,
        descripcion: requisito.formatoDescripcion || '',
        archivoRuta: requisito.formatoArchivoRuta
      } : null
    };
    this.requisitoSeleccionado = requisitoCompleto;
    this.mostrarModalRequisito = true;
  }

  cerrarModalRequisito() {
    this.mostrarModalRequisito = false;
    this.tupacSeleccionado = null;
    this.requisitoSeleccionado = null;
  }

  onRequisitoGuardado() {
    this.cargarRequisitos(this.tupacSeleccionado!.id!);
    this.notificationService.success('Requisito guardado correctamente', 'Éxito');
    this.cerrarModalRequisito();
  }

  eliminarRequisito(requisito: RequisitoTUPACEnriquecidoProjection) {
    if (!confirm('¿Está seguro que desea eliminar este requisito?')) {
      return;
    }

    this.requisitoService.eliminar(requisito.id).subscribe({
      next: () => {
        this.cargarRequisitos(this.tupacSeleccionado!.id!);
        this.notificationService.success('Requisito eliminado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error eliminando requisito:', err);
        this.notificationService.error(err.error?.message || 'Error al eliminar el requisito', 'Error');
      }
    });
  }

  activarRequisito(requisito: RequisitoTUPACEnriquecidoProjection) {
    this.requisitoService.activar(requisito.id).subscribe({
      next: () => {
        this.cargarRequisitos(this.tupacSeleccionado!.id!);
        this.notificationService.success('Requisito activado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error activando requisito:', err);
        this.notificationService.error(err.error?.message || 'Error al activar el requisito', 'Error');
      }
    });
  }

  desactivarRequisito(requisito: RequisitoTUPACEnriquecidoProjection) {
    this.requisitoService.desactivar(requisito.id).subscribe({
      next: () => {
        this.cargarRequisitos(this.tupacSeleccionado!.id!);
        this.notificationService.success('Requisito desactivado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error desactivando requisito:', err);
        this.notificationService.error(err.error?.message || 'Error al desactivar el requisito', 'Error');
      }
    });
  }

  verFormato(requisito: RequisitoTUPACEnriquecidoProjection) {
    if (!requisito.formatoId) {
      this.notificationService.error('El requisito no tiene un formato asociado', 'Error');
      return;
    }

    this.formatoService.download(requisito.formatoId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.open(url, '_blank');
        if (!a) {
          this.notificationService.error('No se pudo abrir el archivo. Por favor, verifique la configuración del navegador.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error al descargar formato:', err);
        this.notificationService.error('Error al descargar el formato. Por favor, intente nuevamente.', 'Error');
      }
    });
  }
}
