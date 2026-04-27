import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { GrupoPresentacionService, GrupoPresentacionCreateRequest, GrupoPresentacionUpdateRequest } from '../services/grupo-presentacion.service';
import { InscripcionExamenService, PersonaNatural } from '../services/inscripcion-examen.service';
import { InscripcionStateService } from '../services/inscripcion-state.service';
import { PersonaNaturalService } from '../services/persona-natural.service';
import { RequisitoTUPACService } from '../../configuracion/services/requisito-tupac.service';
import { TramiteService } from '../../tramites/services/tramite.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TipoTramiteService } from '../../configuracion/services/tipo-tramite.service';

interface Examen {
  id: number;
  codigo: string;
  nombre?: string;
  descripcion?: string;
  requisitoExamenId?: number;
  requisitoExamen?: {
    id: number;
    descripcion?: string;
  };
  fecha: string | Date;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  capacidadMaxima?: number;
  cuposDisponibles: number;
  estado: string;
  tipoExamen?: string;
  activo: boolean;
  categoria?: string; // Se deriva automáticamente del examen
}

interface DiaCalendario {
  fecha: Date;
  exams: Examen[];
  esHoy: boolean;
  esLaborable: boolean;
}

@Component({
  selector: 'app-gestion-examenes',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <app-icon name="calendar" size="md"></app-icon>
          </div>
          <div class="header-text">
            <h1 class="page-title">Gestión de Exámenes</h1>
            <p class="page-subtitle">Administra los grupos de exámenes y presentaciones</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <app-icon name="plus" size="sm"></app-icon>
            Nuevo Grupo
          </button>
          <button class="btn btn-secondary" (click)="openResultadosRecientesModal()">
            <app-icon name="clipboard-list" size="sm"></app-icon>
            Ver Resultados Recientes
          </button>
        </div>
      </div>

      <!-- Error message -->
      @if (error()) {
        <div class="error-banner">
          <app-icon name="alert-circle" size="sm" customClass="mr-2"></app-icon>
          {{ error() }}
          <button class="close-btn" (click)="error.set(null)">
            <app-icon name="x" size="sm"></app-icon>
          </button>
        </div>
      }

      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <app-icon name="calendar" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Grupos</p>
            <p class="stat-value">{{ examenes().length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <app-icon name="check-circle" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Programados</p>
            <p class="stat-value">{{ getCountByEstado('PROGRAMADO') }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">
            <app-icon name="clock" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">En Curso</p>
            <p class="stat-value">{{ getCountByEstado('EN_CURSO') }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <app-icon name="users" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Cupos Disponibles</p>
            <p class="stat-value">{{ getTotalCuposDisponibles() }}</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Buscar</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar por código..."
              class="filter-input">
          </div>
          <div class="filter-group">
            <label class="filter-label">Estado</label>
            <select [(ngModel)]="filterEstado" class="filter-select">
              <option value="">Todos</option>
              <option value="PROGRAMADO">Programado</option>
              <option value="EN_CURSO">En Curso</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Tipo</label>
            <select [(ngModel)]="filterTipoExamen" class="filter-select">
              <option value="">Todos</option>
              <option value="TEORICO">Teórico</option>
              <option value="PRACTICO">Práctico</option>
              <option value="PSICOLOGICO">Psicológico</option>
              <option value="MEDICO">Médico</option>
            </select>
          </div>
          <div class="filter-actions">
            <button class="btn btn-secondary" (click)="loadExamenes()">
              <app-icon name="refresh" size="sm"></app-icon>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div class="calendar-section">
        <div class="calendar-header">
          <button class="calendar-nav" (click)="previousMonth()">
            <app-icon name="chevron-left" size="md"></app-icon>
          </button>
          <h2 class="calendar-title">{{ getMonthYear() }}</h2>
          <button class="calendar-nav" (click)="nextMonth()">
            <app-icon name="chevron-right" size="md"></app-icon>
          </button>
         </div>

         <div class="calendar-weekdays">
           @for (day of diasSemana; track day) {
             <div class="weekday">{{ day }}</div>
           }
         </div>

         <div class="calendar-grid">
          @for (day of calendarDays(); track day.fecha) {
            <div 
              class="calendar-day" 
              [class.today]="day.esHoy"
              [class.no-exams]="day.exams.length === 0"
              [class.selected]="selectedDateValue && isSameDate(day.fecha, selectedDateValue)"
              (click)="selectDate(day)">
              <span class="day-number">{{ day.fecha.getDate() }}</span>
              @if (day.exams.length > 0) {
                <div class="day-exams">
                  @for (exam of day.exams.slice(0, 2); track exam.id) {
                    <div class="exam-dot" [class]="getExamStateClass(exam.estado)"></div>
                  }
                  @if (day.exams.length > 2) {
                    <span class="more-exams">+{{ day.exams.length - 2 }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Selected Day Details -->
      @if (selectedDateValue) {
        <div class="selected-day-section">
          <div class="section-header">
               <h3 class="section-title">
                 <app-icon name="calendar" size="sm" customClass="mr-2"></app-icon>
                 Exámenes del {{ selectedDateValue | date:'dd MMMM yyyy' }}
               </h3>
          </div>
          
          @if (selectedDayExamsList.length === 0) {
            <div class="empty-state">
              <app-icon name="calendar" size="sm" customClass="text-gray-400"></app-icon>
              <p>No hay exámenes programados para esta fecha</p>
            </div>
          } @else {
            <div class="exams-grid">
               @for (exam of selectedDayExamsList; track exam.id) {
                 <div class="exam-card">
                   <div class="exam-header">
                     <span class="exam-code">{{ getNombreExamen(exam) }}</span>
                     <span class="exam-state" [class]="getExamStateClass(exam.estado)">
                       {{ getEstadoFormateado(exam.estado) }}
                     </span>
                   </div>
                  <div class="exam-body">
                    <div class="exam-info">
                      <app-icon name="clock" size="sm" customClass="text-gray-500 mr-2"></app-icon>
                      <span>{{ exam.horaInicio }} - {{ exam.horaFin }}</span>
                    </div>
                    <div class="exam-info">
                      <app-icon name="users" size="sm" customClass="text-gray-500 mr-2"></app-icon>
                      <span>{{ exam.capacidad - exam.cuposDisponibles }} / {{ exam.capacidad }}-inscritos</span>
                    </div>
                  </div>
                    <div class="exam-actions">
                       <button class="btn btn-sm btn-secondary" (click)="viewExamDetails(exam)">
                         <app-icon name="eye" size="sm"></app-icon>
                         Ver
                       </button>
                       @if (exam.estado === 'PROGRAMADO') {
                         <button class="btn btn-sm"
                                 [class.btn-success]="puedeInscribirse(exam)"
                                 [class.btn-secondary]="!puedeInscribirse(exam)"
                                 [disabled]="!puedeInscribirse(exam)"
                                 [title]="getTooltipInscripcion(exam)"
                                 (click)="openInscripcionModalForExam(exam)">
                           <app-icon name="user-plus" size="sm"></app-icon>
                           Inscribir
                         </button>
                       }
                     </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- All Exams Table -->
      <div class="table-section">
        <div class="table-header">
          <h3 class="section-title">
            <app-icon name="list" size="sm" customClass="mr-2"></app-icon>
            Todos los Grupos
          </h3>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
               <tr>
                 <th>Examen</th>
                 <th>Fecha</th>
                 <th>Horario</th>
                 <th>Cupos</th>
                 <th>Estado</th>
                 <th class="text-right">Acciones</th>
               </tr>
            </thead>
            <tbody>
              @for (exam of filteredExamenes; track exam.id) {
                <tr class="hover-row">
                    <td>
                      <span class="code-badge">{{ getNombreExamen(exam) }}</span>
                    </td>
                  <td>{{ exam.fecha | date:'dd/MM/yyyy' }}</td>
                  <td>{{ exam.horaInicio }} - {{ exam.horaFin }}</td>
                  <td>
                    <div class="progress-cell">
                      <div class="progress-bar">
                        <div 
                          class="progress-fill" 
                          [style.width.%]="((exam.capacidad - exam.cuposDisponibles) / exam.capacidad) * 100">
                        </div>
                      </div>
                      <span class="progress-text">{{ exam.cuposDisponibles }}/{{ exam.capacidad }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="state-badge" [class]="getExamStateClass(exam.estado)">
                      {{ getEstadoFormateado(exam.estado) }}
                    </span>
                  </td>
                    <td class="text-right">
                      <div class="action-buttons">
                        <button class="btn-icon btn-view" title="Ver" (click)="viewExamDetails(exam)">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button class="btn-icon btn-edit" title="Editar" (click)="editExam(exam)">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        @if (exam.estado === 'PROGRAMADO') {
                          <button class="btn-icon btn-delete" title="Eliminar" (click)="cancelExam(exam)">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>
                @if (modalMode() === 'create') {
                  <app-icon name="calendar-plus" size="md" customClass="mr-2"></app-icon>
                  Nuevo Grupo de Examen
                } @else {
                  <app-icon name="calendar-check" size="md" customClass="mr-2"></app-icon>
                  Editar Grupo
                }
              </h2>
              <button class="modal-close" (click)="closeModal()">
                <app-icon name="x" size="sm"></app-icon>
              </button>
            </div>
            <div class="modal-body">
              <!-- Código del Grupo -->
              <div class="form-group">
                <label for="codigo">Código del Grupo *</label>
                <input type="text" id="codigo" [(ngModel)]="formData.codigo" (blur)="validateField('codigo')" class="form-input" placeholder="Ej: EXAM-001">
                @if (fieldErrors().codigo) {
                  <div class="text-red-500 text-sm mt-1">{{ fieldErrors().codigo }}</div>
                }
              </div>
              <!-- Selector de Requisito de Examen -->
              <div class="form-group">
                <label for="requisitoExamen">Examen *</label>
                <select
                  id="requisitoExamen"
                  [(ngModel)]="formData.requisitoExamenId"
                  class="form-input"
                  (change)="onRequisitoChange($event)"
                  (blur)="validateField('requisitoExamenId')">
                  <option [ngValue]="null">Seleccione un examen</option>
                  @for (req of requisitos(); track req.id) {
                    <option [ngValue]="req.id">{{ req.codigo }} - {{ req.descripcion }}</option>
                  }
                </select>
                @if (fieldErrors().requisitoExamenId) {
                  <div class="text-red-500 text-sm mt-1">{{ fieldErrors().requisitoExamenId }}</div>
                }
               </div>
                <div class="form-group">
                  <label for="fecha">Fecha *</label>
                  <input type="date" id="fecha" [(ngModel)]="formData.fecha" (blur)="validateField('fecha')" class="form-input">
                  @if (fieldErrors().fecha) {
                    <div class="text-red-500 text-sm mt-1">{{ fieldErrors().fecha }}</div>
                  }
                </div>
               <div class="form-row">
                 <div class="form-group">
                   <label for="horaInicio">Hora Inicio *</label>
                   <input type="time" id="horaInicio" [(ngModel)]="formData.horaInicio" (blur)="validateField('horaInicio')" class="form-input">
                   @if (fieldErrors().horaInicio) {
                     <div class="text-red-500 text-sm mt-1">{{ fieldErrors().horaInicio }}</div>
                   }
                 </div>
                 <div class="form-group">
                   <label for="horaFin">Hora Fin *</label>
                   <input type="time" id="horaFin" [(ngModel)]="formData.horaFin" (blur)="validateField('horaFin')" class="form-input">
                   @if (fieldErrors().horaFin) {
                     <div class="text-red-500 text-sm mt-1">{{ fieldErrors().horaFin }}</div>
                   }
                 </div>
               </div>
               <div class="form-group">
                 <label for="capacidad">Capacidad *</label>
                 <input type="number" id="capacidad" [(ngModel)]="formData.capacidad" (blur)="validateField('capacidad')" class="form-input" min="1" placeholder="Número de cupos">
                 @if (fieldErrors().capacidad) {
                   <div class="text-red-500 text-sm mt-1">{{ fieldErrors().capacidad }}</div>
                 }
               </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn btn-primary" (click)="saveExam()">
                <app-icon name="save" size="sm" customClass="mr-1"></app-icon>
                @if (modalMode() === 'create') {
                  Crear Grupo
                } @else {
                  Guardar Cambios
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Participant Registration Modal -->
      @if (showInscripcionModal()) {
        <div class="modal-overlay" (click)="closeInscripcionModal()">
          <div class="modal-content inscripcion-modal" (click)="$event.stopPropagation()">
             <div class="modal-header">
               <h2>
                 <app-icon name="user-plus" size="md" customClass="mr-2"></app-icon>
                 Registrar Participante
               </h2>
               <button class="modal-close" (click)="closeInscripcionModal()">
                 <app-icon name="x" size="sm"></app-icon>
               </button>
             </div>
             <div class="modal-body">
                <!-- Resumen del Grupo de Examen -->
                <div class="exam-summary" style="margin-bottom: 16px; padding: 12px; background: var(--color-gray-50); border-radius: 8px;">
                  <div class="exam-summary-item" style="margin-bottom: 8px;">
                    <strong>Examen:</strong> {{ selectedExam ? getNombreExamen(selectedExam) : 'N/A' }}
                  </div>
                  <div class="exam-summary-item">
                    <strong>Tipo:</strong> {{ selectedExam?.tipoExamen || 'No especificado' }}
                  </div>
                </div>
              <!-- DNI Search -->
              <div class="form-group">
                <label for="dni">DNI *</label>
                <div class="dni-search-row">
                  <input
                    type="text"
                    id="dni"
                    [(ngModel)]="inscripcionForm.dni"
                    (input)="buscarPersonaPorDni(inscripcionForm.dni)"
                    class="form-input"
                    placeholder="Ingrese DNI (8 dígitos)"
                    maxlength="8"
                  >
                  @if (buscandoDni()) {
                    <span class="search-indicator">Buscando...</span>
                  }
                </div>
                @if (personaEncontrada) {
                  <div class="persona-found-banner">
                    <app-icon name="check-circle" size="sm" customClass="mr-1"></app-icon>
                    Persona encontrada: {{ personaEncontrada.nombres }} {{ personaEncontrada.apellidos }}
                  </div>
                }
                </div>

                <!-- Código RUT del Trámite -->
               <div class="form-group">
                 <label for="codigoRUT">Código RUT del Trámite *</label>
                 <input
                   type="text"
                   id="codigoRUT"
                   [(ngModel)]="inscripcionForm.codigoRUT"
                   (blur)="buscarTramitePorCodigoRUT()"
                   (keyup.enter)="buscarTramitePorCodigoRUT()"
                   class="form-input"
                   placeholder="Ej: TRAM-2024-001"
                 >
                 @if (buscandoTramite()) {
                   <span class="search-indicator">Buscando trámite...</span>
                 }
               </div>

               <!-- Tipo de Trámite -->
               <div class="form-group">
                 <label for="tipoTramite">Tipo de Trámite *</label>
                 <select
                   id="tipoTramite"
                   [(ngModel)]="inscripcionForm.tipoTramite"
                   [disabled]="inscripcionForm.tipoTramite !== ''"
                   class="form-input"
                 >
                   <option value="">Seleccione el tipo de trámite</option>
                   @for (tipo of tiposTramite; track tipo.id) {
                     <option [value]="tipo.codigo">{{ tipo.codigo }} - {{ tipo.descripcion }}</option>
                   }
                 </select>
                 @if (inscripcionForm.tipoTramite !== '') {
                   <small class="text-muted form-hint">
                     Tipo de trámite autocompletado desde el código RUT.
                     <button type="button" class="btn-clear-inline" (click)="inscripcionForm.tipoTramite = ''">Limpiar</button>
                   </small>
                 }
               </div>

               <!-- PersonaNatural Fields (Readonly if found) -->
              <div class="form-group">
                <label for="nombres">Nombres *</label>
                <input
                  type="text"
                  id="nombres"
                  [(ngModel)]="inscripcionForm.nombres"
                  class="form-input"
                  placeholder="Nombres"
                  [readonly]="personaEncontrada !== null"
                >
              </div>

              <div class="form-group">
                <label for="apellidos">Apellidos *</label>
                <input
                  type="text"
                  id="apellidos"
                  [(ngModel)]="inscripcionForm.apellidos"
                  class="form-input"
                  placeholder="Apellidos"
                  [readonly]="personaEncontrada !== null"
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="genero">Género</label>
                  <select
                    id="genero"
                    [(ngModel)]="inscripcionForm.genero"
                    class="form-input"
                    [disabled]="personaEncontrada !== null"
                  >
                    <option value="">Seleccione</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input
                    type="text"
                    id="telefono"
                    [(ngModel)]="inscripcionForm.telefono"
                    class="form-input"
                    placeholder="Teléfono"
                    [readonly]="personaEncontrada !== null"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="inscripcionForm.email"
                  class="form-input"
                  placeholder="Email"
                  [readonly]="personaEncontrada !== null"
                >
              </div>

              <hr class="form-divider">

              <!-- InscripcionExamen Fields -->
              <div class="form-group">
                <label for="resultado">Resultado *</label>
                <select id="resultado" [(ngModel)]="inscripcionForm.resultado" class="form-input">
                  <option value="APROBADO">Aprobado</option>
                  <option value="DESAPROBADO">Desaprobado</option>
                  <option value="PENDIENTE">Pendiente</option>
                </select>
              </div>

              <div class="form-group">
                <label for="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  [(ngModel)]="inscripcionForm.observaciones"
                  class="form-input form-textarea"
                  placeholder="Observaciones adicionales"
                  rows="3"
                ></textarea>
              </div>

              <!-- Pago de Derecho de Examen -->
              <div class="form-group">
                <div class="checkbox-group">
                  <input
                    type="checkbox"
                    id="pagado"
                    [(ngModel)]="inscripcionForm.pagado"
                    class="form-checkbox"
                  >
                  <label for="pagado" class="checkbox-label">Pago de derecho de examen</label>
                </div>
              </div>
            </div>
             <div class="modal-footer">
               <button class="btn btn-secondary" (click)="closeInscripcionModal()">Cancelar</button>
               <button class="btn btn-primary" (click)="registrarInscripcion()">
                 <app-icon name="save" size="sm" customClass="mr-1"></app-icon>
                 Registrar
               </button>
             </div>
          </div>
        </div>
       }

       <!-- Modal de Detalles del Examen -->
        @if (showDetallesModal() && examenDetalles) {
          <div class="modal-overlay" (click)="closeDetallesModal()">
            <div class="modal-content detalles-modal" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>
                  <app-icon name="info" size="md" customClass="mr-2"></app-icon>
                  Detalles del Grupo
                </h2>
                <button class="modal-close" (click)="closeDetallesModal()">
                  <app-icon name="x" size="sm"></app-icon>
                </button>
              </div>
             <div class="modal-body">
               <!-- Información del Grupo -->
               <div class="info-section">
                 <h3>Información del Grupo</h3>
                 <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Examen:</span>
                      <span class="value">{{ getNombreExamen(examenDetalles) }}</span>
                    </div>
                   <div class="info-item">
                     <span class="label">Fecha:</span>
                     <span class="value">{{ examenDetalles.fecha | date:'dd/MM/yyyy' }}</span>
                   </div>
                   <div class="info-item">
                     <span class="label">Horario:</span>
                     <span class="value">{{ examenDetalles.horaInicio }} - {{ examenDetalles.horaFin }}</span>
                   </div>
                   <div class="info-item">
                     <span class="label">Cupos:</span>
                     <span class="value">{{ examenDetalles.capacidad - examenDetalles.cuposDisponibles }} / {{ examenDetalles.capacidad }}</span>
                   </div>
                   <div class="info-item">
                     <span class="label">Estado:</span>
                     <span class="state-badge" [class]="getExamStateClass(examenDetalles.estado)">
                       {{ getEstadoFormateado(examenDetalles.estado) }}
                     </span>
                   </div>
                    <div class="info-item">
                      <span class="label">Examen:</span>
                      <span class="value">{{ examenDetalles.requisitoExamen?.descripcion || 'N/A' }}</span>
                    </div>
                  </div>
               </div>

               <!-- Lista de Inscritos -->
               <div class="inscritos-section">
                 <h3>Inscritos ({{ inscritosDelGrupo().length }})</h3>
                 @if (inscritosDelGrupo().length === 0) {
                   <div class="empty-state">
                     <app-icon name="users" size="sm" customClass="text-gray-400"></app-icon>
                     <p>No hay inscritos en este grupo</p>
                   </div>
                 } @else {
                   <div class="table-container">
                     <table class="data-table">
                        <thead>
                          <tr>
                            <th>DNI</th>
                            <th>Participante</th>
                            <th>Fecha Inscripción</th>
                            <th>Resultado</th>
                            <th>Pago</th>
                            <th class="text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (inscripcion of inscritosDelGrupo(); track inscripcion.id) {
                            <tr>
                              <td>
                                <span class="dni-badge">{{ inscripcion.persona?.dni || 'N/A' }}</span>
                              </td>
                              <td>
                                <div class="participante-info">
                                  <span class="nombre">{{ inscripcion.persona?.nombres || 'Sin nombre' }}</span>
                                  <span class="apellido">{{ inscripcion.persona?.apellidos || '' }}</span>
                                </div>
                              </td>
                              
                             <td>
                               {{ inscripcion.fechaInscripcion ? (inscripcion.fechaInscripcion | date:'dd/MM/yyyy HH:mm') : 'N/A' }}
                             </td>
                              <td>
                                <span class="resultado-badge" [class]="getResultadoClass(inscripcion.estado)">
                                  <app-icon name="check-circle" size="xs" *ngIf="inscripcion.estado === 'APROBADO'"></app-icon>
                                  <app-icon name="x-circle" size="xs" *ngIf="inscripcion.estado === 'REPROBADO'"></app-icon>
                                  <app-icon name="clock" size="xs" *ngIf="!inscripcion.estado || inscripcion.estado === 'PENDIENTE'"></app-icon>
                                  {{ inscripcion.estado || 'Pendiente' }}
                                </span>
                              </td>
                             <td class="text-center">
                               @if (inscripcion.pagado) {
                                 <span class="pago-badge pagado">
                                   <app-icon name="check" size="xs"></app-icon>
                                   Pagado
                                 </span>
                               } @else {
                                 <span class="pago-badge no-pagado">
                                   <app-icon name="alert-circle" size="xs"></app-icon>
                                   No Pagado
                                 </span>
                               }
                             </td>
                               <td class="text-right">
                                 <div class="action-buttons">
                                   <button class="btn-icon btn-approve" title="Aprobar" (click)="aprobarInscripcion(inscripcion)">
                                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                     </svg>
                                   </button>
                                   <button class="btn-icon btn-reject" title="Desaprobar" (click)="desaprobarInscripcion(inscripcion)">
                                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                     </svg>
                                   </button>
                                   <button class="btn-icon btn-delete" title="Eliminar" (click)="eliminarInscripcion(inscripcion)">
                                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                     </svg>
                                   </button>
                                 </div>
                               </td>
                           </tr>
                         }
                       </tbody>
                     </table>
                   </div>
                 }
               </div>
             </div>
              <div class="modal-footer">
                <button class="btn btn-primary" (click)="closeDetallesModal()">Cerrar</button>
              </div>
           </div>
         </div>
       }

        <!-- Modal de Resultados Recientes -->
        @if (showResultadosRecientesModal()) {
          <div class="modal-overlay" (click)="closeResultadosRecientesModal()">
            <div class="modal-content resultados-recientes-modal" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>
                  <app-icon name="clipboard-list" size="md" customClass="mr-2"></app-icon>
                  Resultados de Exámenes Recientes
                </h2>
                <button class="modal-close" (click)="closeResultadosRecientesModal()">
                  <app-icon name="x" size="sm"></app-icon>
                </button>
              </div>
              <div class="modal-body">
                <!-- Filtro de búsqueda -->
                <div class="filters-card" style="margin-bottom: 16px; padding: 12px;">
                  <div class="filters-row" style="align-items: center;">
                    <div class="filter-group" style="flex: 1;">
                      <label class="filter-label" style="margin-bottom: 4px;">Buscar</label>
                      <input 
                        type="text" 
                        [(ngModel)]="filtroRecientes" 
                        placeholder="Buscar por nombre, DNI o grupo..." 
                        class="filter-input"
                        style="width: 100%;">
                    </div>
                  </div>
                </div>

                @if (resultadosFiltrados.length === 0) {
                  <div class="empty-state">
                    <app-icon name="clipboard" size="sm" customClass="text-gray-400"></app-icon>
                    <p>No se encontraron inscripciones</p>
                  </div>
                } @else {
                  <div class="table-container">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Persona</th>
                          <th>Grupo</th>
                          <th>Estado</th>
                          <th>Pago</th>
                          <th class="text-right">Acciones</th>
                        </tr>
                      </thead>
                       <tbody>
                         @for (inscripcion of resultadosFiltrados; track inscripcion.id) {
                           <tr>
                             <td>
                               {{ inscripcion.fechaInscripcion | date:'dd/MM/yyyy HH:mm' }}
                             </td>
                             <td>
                               {{ inscripcion.persona?.nombres }} {{ inscripcion.persona?.apellidos }}
                               <br>
                               <small class="text-gray-500">{{ inscripcion.persona?.dni }}</small>
                             </td>
                             <td>
                               <span class="code-badge">
                                 {{ inscripcion.grupoPresentacion?.tipoExamen || inscripcion.grupoPresentacion?.codigo }}
                               </span>
                             </td>
                             <td>
                               <span class="state-badge" [class]="getExamStateClass(inscripcion.estado)">
                                 {{ getEstadoFormateado(inscripcion.estado) }}
                               </span>
                             </td>
                             <td class="text-center">
                               <input
                                 type="checkbox"
                                 [(ngModel)]="inscripcion.pagado"
                                 (change)="actualizarResultadoInscripcion(inscripcion)"
                                 style="width: 16px; height: 16px; cursor: pointer;"
                               >
                             </td>
                             <td class="text-right">
                               <div class="action-buttons">
                                @if (inscripcion.estado !== 'APROBADO') {
                                  <button class="btn btn-sm btn-success" (click)="aprobarInscripcion(inscripcion)">
                                    <app-icon name="check" size="sm"></app-icon>
                                  </button>
                                }
                                @if (inscripcion.estado !== 'REPROBADO') {
                                  <button class="btn btn-sm btn-danger" (click)="desaprobarInscripcion(inscripcion)">
                                    <app-icon name="x" size="sm"></app-icon>
                                  </button>
                                }
                                <button class="btn btn-sm btn-secondary" (click)="verDetallesInscripcion(inscripcion)">
                                  <app-icon name="eye" size="sm"></app-icon>
                                </button>
                                <button class="btn btn-sm btn-danger" (click)="eliminarInscripcion(inscripcion)">
                                  <app-icon name="trash" size="sm"></app-icon>
                                </button>
                               </div>
                             </td>
                           </tr>
                         }
                       </tbody>
                    </table>
                  </div>
                }
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="closeResultadosRecientesModal()">Cerrar</button>
              </div>
            </div>
          </div>
        }
      </div>
    `,
   styles: [`
     /* Variables */
     :host {
       --color-blue-50: #eff6ff;
       --color-blue-100: #dbeafe;
       --color-blue-600: #2563eb;
       --color-green-50: #f0fdf4;
       --color-green-100: #dcfce7;
       --color-green-600: #16a34a;
       --color-purple-50: #faf5ff;
       --color-purple-100: #f3e8ff;
       --color-purple-600: #9333ea;
       --color-orange-50: #fff7ed;
       --color-orange-100: #ffedd5;
       --color-orange-600: #ea580c;
       --color-gray-50: #f9fafb;
       --color-gray-100: #f3f4f6;
       --color-gray-200: #e5e7eb;
       --color-gray-300: #d1d5db;
       --color-gray-500: #6b7280;
       --color-gray-600: #4b5563;
       --color-gray-900: #111827;
       --color-red-50: #fef2f2;
       --color-red-100: #fee2e2;
       --color-red-600: #dc2626;
       --color-white: #ffffff;
     }

    .page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      background: var(--color-white);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-content {
      display: flex;
      gap: 16px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--color-blue-50) 0%, var(--color-blue-100) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-blue-600);
    }

    .header-text h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-gray-900);
      margin: 0 0 4px 0;
    }

    .header-text p {
      color: var(--color-gray-600);
      font-size: 15px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: var(--color-blue-600);
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: var(--color-gray-100);
      color: var(--color-gray-700);
      border: 1px solid var(--color-gray-300);
    }

    .btn-secondary:hover {
      background: var(--color-gray-200);
    }

    .btn-success {
      background: var(--color-green-600);
      color: white;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.blue {
      background: var(--color-blue-100);
      color: var(--color-blue-600);
    }

    .stat-icon.green {
      background: var(--color-green-100);
      color: var(--color-green-600);
    }

    .stat-icon.purple {
      background: var(--color-purple-100);
      color: var(--color-purple-600);
    }

    .stat-icon.orange {
      background: var(--color-orange-100);
      color: var(--color-orange-600);
    }

    .stat-content .stat-label {
      font-size: 13px;
      color: var(--color-gray-500);
      margin: 0;
    }

    .stat-content .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-gray-900);
      margin: 4px 0 0 0;
    }

    /* Filters */
    .filters-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: flex-end;
    }

    .filter-group {
      flex: 1;
    }

    .filter-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-gray-700);
      margin-bottom: 6px;
    }

    .filter-input, .filter-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-gray-300);
      border-radius: 8px;
      font-size: 14px;
    }

    .filter-actions {
      flex: 0 0 auto;
    }

     /* Calendar */
     .calendar-section {
       background: white;
       border-radius: 12px;
       padding: 16px;
       margin-bottom: 24px;
       box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
     }

     .calendar-header {
       display: flex;
       align-items: center;
       justify-content: space-between;
       margin-bottom: 12px;
     }

     .calendar-title {
       font-size: 16px;
       font-weight: 600;
       color: var(--color-gray-900);
       margin: 0;
     }

     .calendar-nav {
       background: none;
       border: none;
       cursor: pointer;
       padding: 6px;
       border-radius: 6px;
       color: var(--color-gray-600);
       transition: background 0.2s;
     }

     .calendar-nav:hover {
       background: var(--color-gray-100);
     }

     .calendar-weekdays {
       display: grid;
       grid-template-columns: repeat(7, 1fr);
       gap: 2px;
       margin-bottom: 4px;
     }

     .weekday {
       text-align: center;
       font-size: 11px;
       font-weight: 600;
       color: var(--color-gray-500);
       padding: 2px 0;
     }

     .calendar-grid {
       display: grid;
       grid-template-columns: repeat(7, 1fr);
       gap: 2px;
     }

     .calendar-day {
       aspect-ratio: 1;
       padding: 4px;
       border-radius: 6px;
       cursor: pointer;
       transition: all 0.2s;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       min-height: 50px;
     }

     .calendar-day:hover {
       background: var(--color-gray-50);
     }

     .calendar-day.today {
       background: var(--color-blue-50);
     }

     .calendar-day.today .day-number {
       background: var(--color-blue-600);
       color: white;
       border-radius: 50%;
       width: 22px;
       height: 22px;
       display: flex;
       align-items: center;
       justify-content: center;
     }

     .calendar-day.selected {
       background: var(--color-blue-100);
     }

     .day-number {
       font-size: 12px;
       font-weight: 500;
       color: var(--color-gray-700);
     }

     .day-exams {
       display: flex;
       gap: 2px;
       margin-top: 2px;
     }

     .exam-dot {
       width: 6px;
       height: 6px;
       border-radius: 50%;
     }

     .exam-dot.programado { background: var(--color-blue-600); }
     .exam-dot.en_curso { background: var(--color-orange-600); }
     .exam-dot.completado { background: var(--color-green-600); }
     .exam-dot.cancelado { background: var(--color-red-600); }

     .more-exams {
       font-size: 9px;
       color: var(--color-gray-500);
     }

    /* Selected Day */
    .selected-day-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-gray-900);
      margin: 0;
      display: flex;
      align-items: center;
    }

    .exams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .exam-card {
      border: 1px solid var(--color-gray-200);
      border-radius: 12px;
      padding: 16px;
    }

    .exam-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .exam-code {
      font-weight: 600;
      color: var(--color-gray-900);
    }

    .exam-state {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .exam-state.programado { background: var(--color-blue-100); color: var(--color-blue-600); }
    .exam-state.en_curso { background: var(--color-orange-100); color: var(--color-orange-600); }
    .exam-state.completado { background: var(--color-green-100); color: var(--color-green-600); }
    .exam-state.cancelado { background: var(--color-red-100); color: var(--color-red-600); }

    .exam-body {
      margin-bottom: 12px;
    }

    .exam-info {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: var(--color-gray-600);
      margin-bottom: 6px;
    }

    .exam-actions {
      display: flex;
      gap: 8px;
    }

    /* Table */
    .table-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      text-align: left;
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-gray-500);
      text-transform: uppercase;
      border-bottom: 1px solid var(--color-gray-200);
    }

    .data-table td {
      padding: 12px 16px;
      font-size: 14px;
      color: var(--color-gray-700);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .data-table .hover-row:hover {
      background: var(--color-gray-50);
    }

    .code-badge {
      font-weight: 600;
      color: var(--color-gray-900);
    }

    .progress-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--color-gray-200);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-blue-600);
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 12px;
      color: var(--color-gray-500);
      min-width: 40px;
    }

    .state-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .resultado-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .resultado-badge.aprobado {
      background: var(--color-green-100);
      color: var(--color-green-600);
    }

    .resultado-badge.desaprobado {
      background: var(--color-red-100);
      color: var(--color-red-600);
    }

    .resultado-badge.pendiente {
      background: var(--color-orange-100);
      color: var(--color-orange-600);
    }

    .pago-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .pago-badge.pagado {
      background: var(--color-green-100);
      color: var(--color-green-600);
    }

    .pago-badge.no-pagado {
      background: var(--color-red-100);
      color: var(--color-red-600);
    }

    .observaciones-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-label {
      font-size: 14px;
      color: var(--color-gray-700);
      cursor: pointer;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .action-btn.edit {
      background: var(--color-blue-100);
      color: var(--color-blue-600);
    }

    .action-btn.edit:hover {
      background: var(--color-blue-200);
    }

    .action-btn.delete {
      background: var(--color-red-100);
      color: var(--color-red-600);
    }

    .action-btn.delete:hover {
      background: var(--color-red-200);
    }

    // Nuevos estilos para tabla de inscritos
    .dni-badge {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-gray-700);
      background: var(--color-gray-100);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .participante-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .participante-info .nombre {
      font-weight: 500;
      color: var(--color-gray-800);
      font-size: 14px;
    }

    .participante-info .apellido {
      font-size: 12px;
      color: var(--color-gray-600);
    }

    .tramite-info {
      font-weight: 500;
      color: var(--color-blue-600);
      font-size: 13px;
    }

    .tramite-tipo {
      display: block;
      font-size: 11px;
      color: var(--color-gray-500);
      margin-top: 2px;
    }

    .resultado-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .pago-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .action-buttons-group {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .action-btn.view {
      background: var(--color-blue-50);
      color: var(--color-blue-600);
    }

    .action-btn.view:hover {
      background: var(--color-blue-100);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-gray-200);
    }

    .modal-header h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-gray-500);
      padding: 4px;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-gray-700);
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-gray-300);
      border-radius: 8px;
      font-size: 14px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid var(--color-gray-200);
    }

    /* Error */
    .error-banner {
      background: var(--color-red-50);
      border: 1px solid var(--color-red-100);
      color: var(--color-red-600);
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .close-btn {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-red-600);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--color-gray-500);
    }

    .empty-state p {
      margin-top: 12px;
    }

    /* Inscripcion Modal */
    .inscripcion-modal {
      max-width: 600px;
    }

    // Botón clear inline (para autocomplete)
    .btn-clear-inline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: auto;
      height: auto;
      padding: 0 0.5rem;
      margin-left: 0.5rem;
      background: transparent;
      border: none;
      color: var(--color-gray-500);
      cursor: pointer;
      font-size: 0.875rem;
      transition: color 150ms ease;
      
      &:hover {
        color: var(--color-red-500);
        text-decoration: underline;
      }
      
      svg {
        width: 14px;
        height: 14px;
        margin-right: 0.25rem;
      }
    }
    
    // Hint de formulario
    .form-hint {
      display: flex;
      align-items: center;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-gray-500);
      gap: 0.5rem;
    }

    .dni-search-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dni-search-row .form-input {
      flex: 1;
    }

    .search-indicator {
      font-size: 13px;
      color: var(--color-gray-500);
      font-style: italic;
    }

    .persona-found-banner {
      margin-top: 8px;
      padding: 10px 12px;
      background: var(--color-green-50);
      border: 1px solid var(--color-green-100);
      border-radius: 6px;
      color: var(--color-green-600);
      font-size: 13px;
      display: flex;
      align-items: center;
    }

    .form-divider {
      margin: 20px 0;
      border: none;
      border-top: 1px solid var(--color-gray-200);
    }

     .form-textarea {
       resize: vertical;
       min-height: 80px;
     }

     /* Modal de Detalles */
     .detalles-modal {
       max-width: 700px;
     }

     .info-section, .inscritos-section {
       margin-bottom: 24px;
     }

     .info-section h3, .inscritos-section h3 {
       font-size: 16px;
       font-weight: 600;
       color: var(--color-gray-900);
       margin: 0 0 16px 0;
       padding-bottom: 8px;
       border-bottom: 1px solid var(--color-gray-200);
     }

     .info-grid {
       display: grid;
       grid-template-columns: repeat(2, 1fr);
       gap: 16px;
     }

     .info-item {
       display: flex;
       flex-direction: column;
       gap: 4px;
     }

     .info-item .label {
       font-size: 12px;
       font-weight: 500;
       color: var(--color-gray-500);
       text-transform: uppercase;
     }

     .info-item .value {
       font-size: 14px;
       color: var(--color-gray-700);
     }

     .detalles-modal .state-badge {
       display: inline-block;
       padding: 4px 8px;
       border-radius: 4px;
       font-size: 12px;
       font-weight: 500;
     }

     .detalles-modal .state-badge.programado { background: var(--color-blue-100); color: var(--color-blue-600); }
     .detalles-modal .state-badge.en_curso { background: var(--color-orange-100); color: var(--color-orange-600); }
     .detalles-modal .state-badge.completado { background: var(--color-green-100); color: var(--color-green-600); }
     .detalles-modal .state-badge.cancelado { background: var(--color-red-100); color: var(--color-red-600); }
     .detalles-modal .state-badge.cerrado { background: var(--color-gray-100); color: var(--color-gray-600); }

     .detalles-modal .data-table {
       width: 100%;
       border-collapse: collapse;
       margin-top: 12px;
     }

     .detalles-modal .data-table th {
       text-align: left;
       padding: 10px 12px;
       font-size: 12px;
       font-weight: 600;
       color: var(--color-gray-500);
       text-transform: uppercase;
       border-bottom: 1px solid var(--color-gray-200);
       background: var(--color-gray-50);
     }

     .detalles-modal .data-table td {
       padding: 10px 12px;
       font-size: 13px;
       color: var(--color-gray-700);
       border-bottom: 1px solid var(--color-gray-100);
     }

     .detalles-modal .data-table tr:hover {
       background: var(--color-gray-50);
     }

     /* Modal de Resultados Recientes */
     .resultados-recientes-modal {
       max-width: 900px;
     }

     .resultados-recientes-modal .data-table {
       width: 100%;
       border-collapse: collapse;
     }

     .resultados-recientes-modal .data-table th {
       text-align: left;
       padding: 10px 12px;
       font-size: 12px;
       font-weight: 600;
       color: var(--color-gray-500);
       text-transform: uppercase;
       border-bottom: 1px solid var(--color-gray-200);
       background: var(--color-gray-50);
     }

     .resultados-recientes-modal .data-table td {
       padding: 10px 12px;
       font-size: 13px;
       color: var(--color-gray-700);
       border-bottom: 1px solid var(--color-gray-100);
       vertical-align: middle;
     }

     .resultados-recientes-modal .data-table tr:hover {
       background: var(--color-gray-50);
     }

     .resultado-select {
        padding: 4px 8px;
        border: 1px solid var(--color-gray-300);
        border-radius: 4px;
        font-size: 12px;
        min-width: 100px;
      }

      .resultado-buttons {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .btn-resultado {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        border: 1px solid var(--color-gray-200);
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;
        background: white;
        color: var(--color-gray-600);
      }

      .btn-resultado:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .btn-resultado.btn-aprobar {
        border-color: var(--color-green-200);
        color: var(--color-green-700);
      }

      .btn-resultado.btn-aprobar:hover {
        background: var(--color-green-50);
        border-color: var(--color-green-300);
      }

      .btn-resultado.btn-aprobar.active {
        background: var(--color-green-600);
        border-color: var(--color-green-600);
        color: white;
        box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
      }

      .btn-resultado.btn-desaprobar {
        border-color: var(--color-red-200);
        color: var(--color-red-700);
      }

      .btn-resultado.btn-desaprobar:hover {
        background: var(--color-red-50);
        border-color: var(--color-red-300);
      }

      .btn-resultado.btn-desaprobar.active {
        background: var(--color-red-600);
        border-color: var(--color-red-600);
        color: white;
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      }

      .btn-resultado.btn-pendiente {
        border-color: var(--color-orange-200);
        color: var(--color-orange-700);
      }

      .btn-resultado.btn-pendiente:hover {
        background: var(--color-orange-50);
        border-color: var(--color-orange-300);
      }

      .btn-resultado.btn-pendiente.active {
        background: var(--color-orange-600);
        border-color: var(--color-orange-600);
        color: white;
        box-shadow: 0 2px 8px rgba(234, 88, 12, 0.3);
      }

       .btn-resultado svg {
         width: 14px;
         height: 14px;
       }

      .action-buttons {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
      }

      .btn-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 150ms ease;
        background: var(--color-gray-100);
        color: var(--color-gray-600);
      }

      .btn-action:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .btn-action.btn-view {
        background: var(--color-blue-50);
        color: var(--color-blue-600);
      }

      .btn-action.btn-view:hover {
        background: var(--color-blue-100);
      }

      .btn-action.btn-delete {
        background: var(--color-red-50);
        color: var(--color-red-600);
      }

       .btn-action.btn-delete:hover {
         background: var(--color-red-100);
       }

       .btn-action.btn-edit {
         background: var(--color-blue-50);
         color: var(--color-blue-600);
       }

       .btn-action.btn-edit:hover {
         background: var(--color-blue-100);
       }

       .btn-action.btn-cancel {
         background: var(--color-red-50);
         color: var(--color-red-600);
       }

       .btn-action.btn-cancel:hover {
         background: var(--color-red-100);
       }

       .alert {
         display: flex;
         align-items: center;
         gap: 8px;
         padding: 12px 16px;
         border-radius: 8px;
         margin-bottom: 16px;
         font-size: 14px;
       }

       .alert-warning {
         background: var(--color-yellow-50);
         border: 1px solid var(--color-yellow-200);
         color: var(--color-yellow-800);
       }

     .nota-input {
       padding: 4px 8px;
       border: 1px solid var(--color-gray-300);
       border-radius: 4px;
       font-size: 12px;
       width: 70px;
       text-align: center;
     }

      .text-gray-500 {
        color: var(--color-gray-500);
      }

      /* Input checkbox para pago */
      input[type="checkbox"] {
        cursor: pointer;
        width: 16px;
        height: 16px;
      }

      /* Botones icon-only estilo TUPAC */

        /* Botones icon-only estilo TUPAC */
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

          &.btn-approve {
            background-color: #dcfce7;
            color: #16a34a;

            &:hover:not(:disabled) {
              background-color: #bbf7d6;
            }
          }

          &.btn-reject {
            background-color: #fef3c7;
            color: #d97706;

            &:hover:not(:disabled) {
              background-color: #fde047;
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
      `]
})
export class GestionExamenesComponent implements OnInit {
  private grupoPresentacionService = inject(GrupoPresentacionService);
  private inscripcionService = inject(InscripcionExamenService);
  private inscripcionStateService = inject(InscripcionStateService);
  private requisitoTUPACService = inject(RequisitoTUPACService);
  private personaNaturalService = inject(PersonaNaturalService);
  private tramiteService = inject(TramiteService);
  private notificationService = inject(NotificationService);
  private tipoTramiteService = inject(TipoTramiteService);
  private inscripcionesPorGrupoSubscription?: Subscription;

  // State
  examenes = signal<Examen[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});

  // Filters
  searchTerm = '';
  filterEstado = '';
  filterTipoExamen = '';

  // Calendar
  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);
  diasSemana = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  // Computed
  selectedDayExams = computed(() => {
    const selDate = this.selectedDate();
    if (!selDate) return [];
    return this.examenes().filter(exam => this.isSameDate(exam.fecha, selDate));
  });

  // Getters para usar en la plantilla (desenrollar señales)
  get selectedDateValue(): Date | null {
    return this.selectedDate();
  }

  get selectedDayExamsList(): Examen[] {
    return this.selectedDayExams();
  }

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    const examenesActuales = this.examenes();

    const days: any[] = [];

    // Días del mes anterior
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        fecha: date,
        exams: examenesActuales.filter(exam => this.isSameDate(exam.fecha, date)),
        esHoy: this.isSameDate(date, today),
        esLaborable: date.getDay() !== 0 && date.getDay() !== 6
      });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        fecha: date,
        exams: examenesActuales.filter(exam => this.isSameDate(exam.fecha, date)),
        esHoy: this.isSameDate(date, today),
        esLaborable: date.getDay() !== 0 && date.getDay() !== 6
      });
    }

    // Días del siguiente mes para completar la cuadrícula
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        fecha: date,
        exams: examenesActuales.filter(exam => this.isSameDate(exam.fecha, date)),
        esHoy: this.isSameDate(date, today),
        esLaborable: date.getDay() !== 0 && date.getDay() !== 6
      });
    }

    return days;
  });

  // Modal (Create/Edit Exam)
  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingExamId: number | null = null;
  formData: GrupoPresentacionCreateRequest = this.getEmptyForm();

  // Modal para ver detalles del examen
  showDetallesModal = signal(false);
  examenDetalles: Examen | null = null;
  inscritosDelGrupo = signal<any[]>([]);

  selectedExam: Examen | null = null;
  inscripciones = signal<any[]>([]);

  // Tipos de Trámite (para autocompletado)
  tiposTramite: any[] = [];

  // Resultados Recientes
  showResultadosRecientesModal = signal(false);
  resultadosRecientes = signal<any[]>([]);
  filtroRecientes = '';

  // Requisitos TUPAC (para mapear nombre de examen)
  requisitos = signal<any[]>([]);
  requisitosMap = new Map<number, any>();

  // Participant Registration
  showInscripcionModal = signal(false);
  inscripcionForm: any = this.getEmptyInscripcionForm();
  personaEncontrada: PersonaNatural | null = null;
   buscandoDni = signal(false);
   buscandoTramite = signal(false);

   ngOnInit(): void {
      this.loadExamenes();
      this.loadRequisitos();
      this.loadTiposTramite();
      this.selectedDate.set(new Date());

      // Suscribirse al estado global de inscripciones (para Resultados Recientes)
      this.inscripcionStateService.getInscripciones().subscribe(inscripciones => {
        // Ordenar por fecha de inscripción más reciente (sin mutar el array original)
        const sorted = [...inscripciones]
          .sort((a, b) => new Date(b.fechaInscripcion).getTime() - new Date(a.fechaInscripcion).getTime())
          .slice(0, 50); // Limitar a los 50 más recientes
        this.resultadosRecientes.set(sorted);
      });
    }

    getEmptyForm(): GrupoPresentacionCreateRequest {
      return {
        codigo: '',
        requisitoExamenId: null as any,
        fecha: '',
        horaInicio: '',
        horaFin: '',
        capacidad: 20,
        observaciones: ''
      };
    }

    getEmptyInscripcionForm(): any {
      return {
        dni: null,
        grupoPresentacionId: null,
        codigoRUT: '',
        tipoTramite: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: null,
        genero: '',
        telefono: '',
        email: '',
        direccion: '',
        distrito: '',
        provincia: '',
        departamento: '',
        nota: null,
        resultado: 'PENDIENTE',
        observaciones: '',
        estado: 'PENDIENTE',
        pagado: false
      };
    }

   loadRequisitos(): void {
     this.requisitoTUPACService.listarActivos().subscribe({
       next: (requisitos: any[]) => {
         // Filtrar solo los que son exámenes
         const examenes = requisitos.filter((r: any) => r.esExamen);
         this.requisitos.set(examenes);
         
         // Crear mapa para acceso rápido: id -> descripcion
         this.requisitosMap.clear();
         examenes.forEach((req: any) => {
           this.requisitosMap.set(req.id, req);
         });
       },
       error: (err: any) => {
         console.error('Error cargando requisitos:', err);
         this.requisitos.set([]);
       }
     });
    }

    loadTiposTramite(): void {
      this.tipoTramiteService.listarTodos().subscribe({
        next: (tipos: any[]) => {
          this.tiposTramite = tipos;
        },
        error: (err) => {
          console.error('Error cargando tipos de trámite:', err);
        }
      });
    }

   loadExamenes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.grupoPresentacionService.listarTodos().subscribe({
      next: (response: any) => {
        let examenesArray: any[] = [];

        if (Array.isArray(response)) {
          examenesArray = response;
        } else if (response && Array.isArray(response.data)) {
          examenesArray = response.data;
        } else if (response && response.success && Array.isArray(response.data)) {
          examenesArray = response.data;
        } else {
          // Formato de respuesta no reconocido
          this.examenes.set([]);
          this.loading.set(false);
          return;
        }

        console.log('Total exámenes recibidos:', examenesArray.length);
        if (examenesArray.length > 0) {
          console.log('Primer examen (raw):', examenesArray[0]);
          console.log('Tipo de fecha del primer examen:', typeof examenesArray[0].fecha, examenesArray[0].fecha);
        }

        // Normalizar fechas a medianoche local
        const examenesNormalizados = examenesArray.map((exam: any) => {
          let fechaDate: Date;

          if (typeof exam.fecha === 'string') {
            const fechaSinHora = exam.fecha.split('T')[0].split(' ')[0];
            const parts = fechaSinHora.split('-');
            if (parts.length === 3) {
              fechaDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              const d = new Date(exam.fecha);
              fechaDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            }
          } else if (Array.isArray(exam.fecha) && exam.fecha.length === 3) {
            fechaDate = new Date(exam.fecha[0], exam.fecha[1] - 1, exam.fecha[2]);
          } else if (typeof exam.fecha === 'number') {
            const d = new Date(exam.fecha);
            fechaDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          } else if (exam.fecha instanceof Date) {
            fechaDate = new Date(exam.fecha.getFullYear(), exam.fecha.getMonth(), exam.fecha.getDate());
          } else {
            console.warn('Formato de fecha inesperado:', exam.fecha, 'para examen', exam.id);
            fechaDate = new Date();
          }

          return { ...exam, fecha: fechaDate };
        });

        console.log('Exámenes normalizados:');
        examenesNormalizados.forEach(e => {
          const fechaDate = e.fecha instanceof Date ? e.fecha : new Date(e.fecha);
          console.log(`- ${e.codigo}: ${fechaDate.toDateString()} (${fechaDate.toISOString()})`);
        });

        this.examenes.set([...examenesNormalizados]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando exámenes:', err);
        this.error.set('Error al cargar los grupos de exámenes');
        this.loading.set(false);
      }
    });
  }

  get filteredExamenes(): Examen[] {
    let result = this.examenes();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(e =>
        e.codigo?.toLowerCase().includes(term) || e.nombre?.toLowerCase().includes(term)
      );
    }
    
    if (this.filterEstado) {
      result = result.filter(e => e.estado === this.filterEstado);
    }
    
    if (this.filterTipoExamen) {
      result = result.filter(e => e.tipoExamen === this.filterTipoExamen);
    }
    
    return result;
  }

  get resultadosFiltrados(): any[] {
    const term = this.filtroRecientes.toLowerCase();
    return this.resultadosRecientes().filter(insc => {
      const persona = insc.persona || {};
      const nombreCompleto = `${persona.nombres || ''} ${persona.apellidos || ''}`.toLowerCase();
      const dni = persona.dni?.toString() || '';
      const grupoNombre = insc.grupoPresentacion?.tipoExamen || insc.grupoPresentacion?.codigo || '';
      return nombreCompleto.includes(term) || dni.includes(term) || grupoNombre.toLowerCase().includes(term);
    });
  }

  getExamsForDate(date: Date): Examen[] {
    return this.examenes().filter(exam => {
      return this.isSameDate(exam.fecha, date);
    });
  }

  isSameDate(date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean {
    if (!date1 || !date2) return false;
    
    // Convertir ambos a Date (si no lo son ya)
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    // Comparar solo año, mes y día (ignorando hora/timezone)
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

   esFechaValidaParaInscripcion(exam: Examen): boolean {
     const hoy = new Date();
     hoy.setHours(0, 0, 0, 0);
     const fechaExam = new Date(exam.fecha);
     return fechaExam >= hoy;
   }

   getExamDate(exam: Examen): Date {
     if (exam.fecha instanceof Date) {
       return new Date(exam.fecha.getFullYear(), exam.fecha.getMonth(), exam.fecha.getDate());
     }
     if (typeof exam.fecha === 'string') {
       const parts = exam.fecha.split('-');
       if (parts.length === 3) {
         const year = parseInt(parts[0], 10);
         const month = parseInt(parts[1], 10) - 1;
         const day = parseInt(parts[2], 10);
         return new Date(year, month, day);
       }
       // Fallback para otros formatos
       const d = new Date(exam.fecha);
       return new Date(d.getFullYear(), d.getMonth(), d.getDate());
     }
     return new Date();
   }

   puedeInscribirse(exam: Examen): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaExam = new Date(exam.fecha);
    return fechaExam >= hoy && exam.cuposDisponibles > 0;
  }

  getTooltipInscripcion(exam: Examen): string {
    if (!this.esFechaValidaParaInscripcion(exam)) {
      return 'No se puede inscribir: la fecha del examen ya pasó';
    }
    if (exam.cuposDisponibles <= 0) {
      return 'No se puede inscribir: no hay cupos disponibles';
    }
    return 'Inscribir participante';
  }

  selectDate(day: DiaCalendario): void {
    console.log('=== selectDate ===');
    console.log('Día clicado:', day.fecha.toDateString(), 'Fecha interna:', day.fecha);
    this.selectedDate.set(day.fecha);
    
    // Debug: mostrar todos los exámenes y sus fechas
    console.log('Todos los exámenes cargados:', this.examenes().map(e => ({
      id: e.id,
      codigo: e.codigo,
      fecha: e.fecha instanceof Date ? e.fecha.toDateString() : e.fecha,
      fechaType: typeof e.fecha
    })));
    
    // Verificación directa
    const directMatches = this.examenes().filter(exam => this.isSameDate(exam.fecha, day.fecha));
    console.log('Exámenes que coinciden para esta fecha:', directMatches.map(e => {
      const fechaDate = e.fecha instanceof Date ? e.fecha : new Date(e.fecha);
      return {id: e.id, codigo: e.codigo, fecha: fechaDate.toDateString()};
    }));
  }

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  getMonthYear(): string {
    return this.currentDate().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  getCountByEstado(estado: string): number {
    return this.examenes().filter(e => e.estado === estado).length;
  }

  getTotalCuposDisponibles(): number {
    return this.examenes().reduce((sum, e) => sum + e.cuposDisponibles, 0);
  }

  getEstadoFormateado(estado: string): string {
    const map: any = {
      'PROGRAMADO': 'Programado',
      'EN_CURSO': 'En Curso',
      'COMPLETADO': 'Completado',
      'CANCELADO': 'Cancelado',
      'CERRADO': 'Cerrado'
    };
    return map[estado] || estado;
  }

   getExamStateClass(estado: string): string {
     return estado.toLowerCase().replace('_', '-');
   }

   getInscripcionStateClass(estado: string): string {
     return estado.toLowerCase().replace('_', '-');
   }

   getResultadoClass(resultado: string | null | undefined): string {
     if (!resultado) return 'pendiente';
     return resultado.toLowerCase();
   }

    editInscripcion(inscripcion: any): void {
      // Ciclar entre estados: PENDIENTE -> APROBADO -> DESAPROBADO -> PENDIENTE
      const estados = ['PENDIENTE', 'APROBADO', 'DESAPROBADO'];
      const actual = inscripcion.resultado || 'PENDIENTE';
      const indiceActual = estados.indexOf(actual);
      const nuevoEstado = estados[(indiceActual + 1) % estados.length];

      this.inscripcionService.actualizarInscripcion(inscripcion.id, { resultado: nuevoEstado }).subscribe({
        next: () => {
          this.notificationService.success(
            `Resultado cambiado a ${nuevoEstado}`,
            'Éxito',
            2000
          );
          this.loadInscripciones();
        },
        error: (err: any) => {
          console.error('Error actualizando resultado:', err);
          this.notificationService.error(
            'Error al cambiar el resultado',
            'Error',
            2000
          );
        }
      });
    }

   aprobarInscripcion(inscripcion: any): void {
      this.inscripcionService.actualizarInscripcion(inscripcion.id, {
        estado: 'APROBADO',
        pagado: inscripcion.pagado
      }).subscribe({
        next: (updatedInscripcion) => {
          this.notificationService.success('Inscripción aprobada', 'Éxito', 2000);
          this.inscripcionStateService.actualizarInscripcion(updatedInscripcion);
        },
        error: (err) => {
          console.error('Error aprobando inscripción:', err);
          this.notificationService.error('Error al aprobar la inscripción', 'Error', 2000);
        }
      });
    }

   desaprobarInscripcion(inscripcion: any): void {
      this.inscripcionService.actualizarInscripcion(inscripcion.id, {
        estado: 'REPROBADO',
        pagado: inscripcion.pagado
      }).subscribe({
        next: (updatedInscripcion) => {
          this.notificationService.success('Inscripción reprobada', 'Éxito', 2000);
          this.inscripcionStateService.actualizarInscripcion(updatedInscripcion);
        },
        error: (err) => {
          console.error('Error reprobando inscripción:', err);
          this.notificationService.error('Error al reprobar la inscripción', 'Error', 2000);
        }
      });
    }

   eliminarInscripcion(inscripcion: any): void {
      if (!confirm('¿Está seguro de eliminar esta inscripción?')) {
        return;
      }
      this.inscripcionService.eliminarInscripcion(inscripcion.id).subscribe({
        next: () => {
          this.notificationService.success('Inscripción eliminada', 'Éxito', 2000);
          this.inscripcionStateService.eliminarInscripcion(inscripcion.id);
          this.loadExamenes(); // Para actualizar cupos
        },
        error: (err) => {
          console.error('Error eliminando inscripción:', err);
          this.notificationService.error('Error al eliminar la inscripción', 'Error', 2000);
        }
      });
    }

    cancelExam(exam: Examen): void {
      if (!confirm('¿Está seguro de cancelar este grupo de examen? Los inscritos mantendrán su historial.')) {
        return;
      }

      // CAMBIAR ESTADO a CANCELADO en lugar de eliminar (para evitar violación de FK)
      this.grupoPresentacionService.actualizar(exam.id, { estado: 'CANCELADO' } as GrupoPresentacionUpdateRequest).subscribe({
        next: () => {
          this.loadExamenes();
          this.success.set('Grupo de examen cancelado exitosamente');
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err: any) => {
          console.error('Error cancelando examen:', err);
          this.error.set('Error al cancelar el grupo de examen');
        }
      });
    }

     getNombreExamen(exam: any): string {
       // Intentar obtener desde requisitoExamen (si viene del backend)
       if (exam.requisitoExamen?.descripcion) {
         return exam.requisitoExamen.descripcion;
       }

       // Buscar en el mapa por requisitoExamenId
       if (exam.requisitoExamenId && this.requisitosMap.has(exam.requisitoExamenId)) {
         const req = this.requisitosMap.get(exam.requisitoExamenId);
         if (req?.descripcion) {
           return req.descripcion;
         }
       }

       // Fallback a tipoExamen o codigo
       return exam.tipoExamen || exam.codigo || 'Sin examen';
     }

     getNombreGrupo(grupo: any): string {
       if (!grupo) return 'N/A';
       return grupo.nombre || grupo.tipoExamen || grupo.codigo || 'Sin examen';
     }

   // Modal methods
  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingExamId = null;
    this.formData = this.getEmptyForm();
    this.fieldErrors.set({});
    this.error.set(null);
    this.showModal.set(true);
  }

    editExam(exam: Examen): void {
      this.modalMode.set('edit');
      this.editingExamId = exam.id;
       this.formData = {
        codigo: exam.codigo || '',
        requisitoExamenId: (exam as any).requisitoExamen?.id || null,
        fecha: exam.fecha,
        horaInicio: exam.horaInicio,
        horaFin: exam.horaFin,
        capacidad: exam.capacidad,
       observaciones: ''
      };
      this.fieldErrors.set({});
      this.error.set(null);
      this.showModal.set(true);
    }

  closeModal(): void {
    this.showModal.set(false);
    this.formData = this.getEmptyForm();
    this.fieldErrors.set({});
    this.error.set(null);
  }

  // Modal de Resultados Recientes
  openResultadosRecientesModal(): void {
    this.showResultadosRecientesModal.set(true);
    this.loadResultadosRecientes();
  }

  closeResultadosRecientesModal(): void {
    this.showResultadosRecientesModal.set(false);
  }

    loadResultadosRecientes(): void {
      this.inscripcionService.buscarConFiltros({}).subscribe({
        next: (inscripciones) => {
          // Actualizar state service, que notificará a los suscriptores (incluyendo este componente)
          this.inscripcionStateService.setInscripciones(inscripciones);
        },
        error: (err: any) => {
          console.error('Error cargando resultados recientes:', err);
          this.inscripcionStateService.setInscripciones([]);
        }
      });
    }

    loadInscripciones(): void {
      if (!this.selectedExam) return;

      // Desuscribir suscripción anterior si existe
      if (this.inscripcionesPorGrupoSubscription) {
        this.inscripcionesPorGrupoSubscription.unsubscribe();
      }

      // Suscribirse al state
      this.inscripcionesPorGrupoSubscription = this.inscripcionStateService
        .getInscripcionesPorGrupo(this.selectedExam.id)
        .subscribe(inscripciones => {
          this.inscritosDelGrupo.set(inscripciones);
        });

      // Forzar carga desde backend
      this.inscripcionStateService.cargarInscripcionesPorGrupo(this.selectedExam.id);
    }

   actualizarResultadoInscripcion(inscripcion: any): void {
     // Solo actualiza pago y observaciones, NO modifica estado/resultado
     const request = {
       pagado: inscripcion.pagado,
       observaciones: inscripcion.observaciones
     };

     this.inscripcionService.actualizarInscripcion(inscripcion.id, request).subscribe({
       next: (updated) => {
         this.inscripcionStateService.actualizarInscripcion(updated);
       },
       error: (err: any) => {
         console.error('Error actualizando inscripción:', err);
         alert('Error al actualizar la inscripción');
       }
     });
   }

   verDetallesInscripcion(inscripcion: any): void {
     // Puede expandirse para mostrar más detalles o abrir otro modal
     alert(`ID: ${inscripcion.id}\nPersona: ${inscripcion.persona?.nombres} ${inscripcion.persona?.apellidos}\nGrupo: ${inscripcion.grupoPresentacion?.codigo}\nEstado: ${inscripcion.estado || 'Pendiente'}\nResultado: ${inscripcion.resultado || 'N/A'}\nNota: ${inscripcion.nota || 'N/A'}\nPago: ${inscripcion.pagado ? 'Sí' : 'No'}`);
   }

   closeDetallesModal(): void {
     this.showDetallesModal.set(false);
     this.selectedExam = null;
     if (this.inscripcionesPorGrupoSubscription) {
       this.inscripcionesPorGrupoSubscription.unsubscribe();
       this.inscripcionesPorGrupoSubscription = undefined;
     }
     this.inscritosDelGrupo.set([]);
   }

   saveExam(): void {
     // Validar código del grupo
     if (!this.formData.codigo || this.formData.codigo.trim() === '') {
       this.error.set('Por favor ingrese el código del grupo');
       return;
     }

     // Validar que se haya seleccionado un requisito
     if (!this.formData.requisitoExamenId) {
       this.error.set('Por favor seleccione un examen');
       return;
     }

     // Validar fecha
     if (!this.formData.fecha) {
       this.error.set('Por favor seleccione una fecha');
       return;
     }

     if (this.modalMode() === 'create') {
       this.grupoPresentacionService.crear(this.formData).subscribe({
         next: () => {
           this.closeModal();
           this.loadExamenes();
         },
         error: (err: any) => {
           this.error.set('Error al crear el grupo: ' + (err.error?.message || err.message));
         }
       });
      } else {
        this.grupoPresentacionService.actualizar(this.editingExamId!, this.formData as GrupoPresentacionUpdateRequest).subscribe({
          next: () => {
            this.closeModal();
            this.loadExamenes();
          },
          error: (err: any) => {
            this.error.set('Error al actualizar el grupo: ' + (err.error?.message || err.message));
          }
        });
      }
    }

    validateField(field: string): void {
      const errors = { ...this.fieldErrors() };

      switch (field) {
        case 'codigo':
          if (!this.formData.codigo || this.formData.codigo.trim() === '') {
            errors[field] = 'El código del grupo es obligatorio';
          } else {
            delete errors[field];
          }
          break;
        case 'requisitoExamenId':
          if (!this.formData.requisitoExamenId) {
            errors[field] = 'Debe seleccionar un examen';
          } else {
            delete errors[field];
          }
          break;
        case 'fecha':
          if (!this.formData.fecha) {
            errors[field] = 'La fecha es obligatoria';
          } else {
            delete errors[field];
          }
          break;
        case 'horaInicio':
          if (!this.formData.horaInicio) {
            errors[field] = 'La hora de inicio es obligatoria';
          } else {
            delete errors[field];
          }
          break;
        case 'horaFin':
          if (!this.formData.horaFin) {
            errors[field] = 'La hora de fin es obligatoria';
          } else {
            delete errors[field];
          }
          break;
        case 'capacidad':
          if (!this.formData.capacidad || this.formData.capacidad <= 0) {
            errors[field] = 'La capacidad debe ser mayor a 0';
          } else {
            delete errors[field];
          }
          break;
      }

      this.fieldErrors.set(errors);
    }

    viewExamDetails(exam: Examen): void {
      this.selectedExam = exam;
      this.examenDetalles = exam;
      this.showDetallesModal.set(true);
      this.loadInscripciones();
    }
   
   loadInscripcionesPorGrupo(grupoId: number): void {
     this.inscripcionService.buscarConFiltros({ grupoId: grupoId }).subscribe({
       next: (inscripciones) => {
         this.inscritosDelGrupo.set(inscripciones);
       },
       error: (err) => {
         console.error('Error cargando inscripciones del grupo:', err);
         this.inscritosDelGrupo.set([]);
       }
     });
   }

  startExam(exam: Examen): void {
    // Implementar iniciar examen
  }

   completeExam(exam: Examen): void {
     // Implementar completar examen
   }

    // [ELIMINADO: Duplicado de getNombreExamen]
}
