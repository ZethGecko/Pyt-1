import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TramiteService } from '../../services/tramite.service';
import { Tramite, TramiteUpdateRequest } from '../../models/tramite.model';
import { TipoTramiteOption } from '../../services/tramite.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-tramite-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrarModal()" *ngIf="mostrar">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="!modoEditar" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              <path *ngIf="modoEditar" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {{ modoEditar ? 'Editar Trámite' : 'Nuevo Trámite' }}
          </h2>
          <button class="modal-close" (click)="cerrarModal()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          @if (error) {
            <div class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>
          }
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <div class="form-group">
              <label>Código RUT *</label>
              <input type="text" formControlName="codigoRUT" class="form-input" placeholder="Ej: 123456789">
              @if (form.get('codigoRUT')?.invalid && form.get('codigoRUT')?.touched) {
                <span class="error-message">El código es requerido</span>
              }
            </div>

            <div class="form-group">
              <label>Tipo de Trámite *</label>
              <select formControlName="tipoTramiteId" class="form-select" required (change)="onTipoTramiteChange()">
                <option [ngValue]="null">Seleccione un tipo de trámite</option>
                @for (tipo of tiposTramite; track $index) {
                  <option [ngValue]="tipo.id">{{ tipo.codigo }} - {{ tipo.descripcion }}</option>
                }
              </select>
              @if (form.get('tipoTramiteId')?.invalid && form.get('tipoTramiteId')?.touched) {
                <span class="error-message">Debe seleccionar un tipo de trámite</span>
              }
            </div>

            <div class="form-group">
              <label>Tipo de Solicitante *</label>
              <select formControlName="tipoSolicitante" class="form-select" required (change)="onTipoSolicitanteChange()">
                <option [ngValue]="''">Seleccione el tipo</option>
                <option value="Empresa">Empresa</option>
                <option value="Gerente">Gerente</option>
                <option value="PersonaNatural">Persona Natural</option>
              </select>
            </div>

            <div class="form-group">
              <label>Solicitante *</label>
              <input
                type="text"
                [ngModel]="solicitanteSeleccionado?.nombre || ''"
                (ngModelChange)="onSolicitanteSearch($event)"
                [ngModelOptions]="{standalone: true}"
                class="form-input"
                placeholder="Buscar por nombre o identificación..."
                [ngClass]="{'is-loading': cargandoSolicitantes}">
              @if (solicitanteSeleccionado) {
                <div class="selected-item">
                  {{ solicitanteSeleccionado.nombre }} ({{ solicitanteSeleccionado.identificacion }})
                  <button type="button" (click)="limpiarSolicitante()">✕</button>
                </div>
              }
              @if (mostrarListaSolicitantes && resultadosSolicitantes.length > 0) {
                <ul class="dropdown-list">
                  @for (s of resultadosSolicitantes; track $index) {
                    <li (click)="seleccionarSolicitante(s)">{{ s.nombre }} ({{ s.identificacion }})</li>
                  }
                </ul>
              }
            </div>

             <div class="form-group">
               <label>Prioridad</label>
               <select formControlName="prioridad" class="form-select">
                 <option value="normal">Normal</option>
                 <option value="alta">Alta</option>
                 <option value="urgente">Urgente</option>
                 <option value="baja">Baja</option>
               </select>
             </div>

            <div class="form-group">
              <label>Observaciones</label>
              <textarea formControlName="observaciones" class="form-textarea" rows="3" placeholder="Observaciones adicionales (opcional)"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="guardar()" [disabled]="form.invalid || cargando">
            @if (cargando) {
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            } @else {
              {{ modoEditar ? 'Actualizar' : 'Crear' }}
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;

      &.alert-error {
        background-color: #fee2e2;
        color: #b91c1c;
        border: 1px solid #fecaca;

        svg {
          color: #dc2626;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
      }

      &.alert-success {
        background-color: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;

        svg {
          color: #16a34a;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
      }
    }

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

        svg {
          width: 24px;
          height: 24px;
        }
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

      &:hover {
        background-color: #f3f4f6;
        color: #111827;
      }
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
      position: relative;

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

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      &.is-loading {
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>');
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 1.5rem;
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    .error-message {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #dc2626;
    }

    .selected-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background-color: #f3f4f6;
      border-radius: 0.375rem;
      font-size: 0.875rem;

      button {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0.25rem;
        font-size: 1rem;

        &:hover {
          color: #111827;
        }
      }
    }

    .dropdown-list {
      position: absolute;
      width: calc(100% - 3rem);
      max-height: 200px;
      overflow-y: auto;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      margin-top: 0.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10;

      li {
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;

        &:hover {
          background-color: #f3f4f6;
        }

        &:first-child {
          border-radius: 0.5rem 0.5rem 0 0;
        }

        &:last-child {
          border-radius: 0 0 0.5rem 0.5rem;
        }
      }
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
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
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
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

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class TramiteFormModalComponent implements OnInit, OnChanges {
  @Input() tramite: any = null;
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  modoEditar = false;
  form!: FormGroup;
  cargando = false;
  cargandoSolicitantes = false;
  error: string | null = null;

  tiposTramite: TipoTramiteOption[] = [];
  solicitanteSeleccionado: { id: number; nombre: string; identificacion: string; tipo: string } | null = null;
  resultadosSolicitantes: { id: number; nombre: string; identificacion: string; tipo: string }[] = [];
  mostrarListaSolicitantes = false;

  constructor(
    private fb: FormBuilder,
    private tramiteService: TramiteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTiposTramite();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar && this.tiposTramite.length === 0) {
      this.cargarTiposTramite();
    }

    if (changes['tramite']) {
      if (this.tramite) {
        this.cargarDatosTramite();
      } else if (this.form) {
        // Reset form when tramite is cleared
        this.modoEditar = false;
        if (this.form) {
          this.form.reset({
            codigoRUT: '',
            tipoTramiteId: null,
            tipoSolicitante: '',
            solicitanteId: null,
            prioridad: 'normal',
            observaciones: ''
          });
        }
        this.solicitanteSeleccionado = null;
        this.resultadosSolicitantes = [];
        this.mostrarListaSolicitantes = false;
      }
    }
  }

  private inicializarFormulario(): void {
    this.form = this.fb.group({
      codigoRUT: ['', [Validators.required]],
      tipoTramiteId: [null, Validators.required],
      tipoSolicitante: ['', Validators.required],
      solicitanteId: [null, Validators.required],
      prioridad: ['normal'],
      observaciones: ['']
    });
  }

  private cargarDatosTramite(): void {
    if (!this.tramite) return;

    this.modoEditar = true;

    // If tiposTramite are already loaded, patch the form immediately
    if (this.tiposTramite.length > 0) {
      this.patchFormWithTramiteData();
    }
    // Otherwise, the form will be patched when tiposTramite are loaded
  }

   private patchFormWithTramiteData(): void {
       if (!this.tramite) return;

       console.log('Patchando formulario con datos del trámite:', this.tramite);

       // When editing, we should use the tipoTramiteId from the tramite object
       // Try to get it directly first, then from the relationship if needed
       let tipoTramiteId = this.tramite.tipoTramiteId;
       
       // If it's still not set, try to derive from the tipoTramite relationship
       if ((!tipoTramiteId && tipoTramiteId !== 0) && this.tramite.tipoTramite) {
           tipoTramiteId = this.tramite.tipoTramite.id;
       }
       
       // Convert to number to ensure type consistency with select options
       tipoTramiteId = tipoTramiteId != null ? Number(tipoTramiteId) : null;
       
       // Ensure solicitanteId is also numeric
       const solicitanteId = this.tramite.solicitanteId != null ? Number(this.tramite.solicitanteId) : null;

       // ONLY in creation mode should we consider a default
       // In edit mode, we preserve what came from the tramite object
       if ((!tipoTramiteId && tipoTramiteId !== 0) && !this.modoEditar && this.tiposTramite.length > 0) {
           // Set default to first available (only for new tramites)
           tipoTramiteId = this.tiposTramite[0].id;
       }

       this.form.patchValue({
           codigoRUT: this.tramite.codigoRUT,
           tipoTramiteId: tipoTramiteId,
           tipoSolicitante: this.tramite.solicitanteTipo,
           solicitanteId: solicitanteId,
           prioridad: this.tramite.prioridad?.toLowerCase() || 'normal',
           observaciones: this.tramite.observaciones || ''
       });

       // Only set solicitanteSeleccionado if we have a valid ID
       if (solicitanteId != null) {
           this.solicitanteSeleccionado = {
               id: solicitanteId,
               nombre: this.tramite.solicitanteNombre,
               identificacion: this.tramite.solicitanteIdentificacion,
               tipo: this.tramite.solicitanteTipo
           };
       } else {
           this.solicitanteSeleccionado = null;
       }

       // Cargar solicitantes para el tipo correspondiente al editar
       if (this.tramite.solicitanteTipo) {
           this.cargarSolicitantesPorTipo(this.tramite.solicitanteTipo);
       }
   }

  private cargarTiposTramite(): void {
    this.tramiteService.listarTiposTramite().subscribe({
      next: (tipos) => {
        this.tiposTramite = tipos;
        // If we have a tramite to edit and tipos are now loaded, patch the form
        if (this.tramite && this.modoEditar) {
          this.patchFormWithTramiteData();
        }
      },
      error: (err) => {
        console.error('Error cargando tipos de trámite:', err);
      }
    });
  }



  onTipoTramiteChange(): void {
    const tipoTramiteId = this.form.get('tipoTramiteId')?.value;
    console.log('Tipo de trámite cambiado a:', tipoTramiteId);
    // Marcar el campo como touched para validaciones
    this.form.get('tipoTramiteId')?.markAsTouched();
  }

  onTipoSolicitanteChange(): void {
    const tipo = this.form.get('tipoSolicitante')?.value;
    console.log('Tipo de solicitante cambiado a:', tipo);
    // Limpiar solicitante seleccionado al cambiar el tipo
    this.limpiarSolicitante();
    // Limpiar la lista de resultados para forzar recarga
    this.resultadosSolicitantes = [];
    this.mostrarListaSolicitantes = false;

    if (tipo) {
      // Marcar el campo como touched para validaciones
      this.form.get('tipoSolicitante')?.markAsTouched();
      this.cargarSolicitantesPorTipo(tipo);
    } else {
      // Si no hay tipo seleccionado, ocultar lista
      this.mostrarListaSolicitantes = false;
    }
  }

  private cargarSolicitantesPorTipo(tipo: string): void {
    this.cargandoSolicitantes = true;
    this.mostrarListaSolicitantes = true;
    console.log('Cargando solicitantes para tipo:', tipo);

    this.tramiteService.listarSolicitantes().subscribe({
      next: (solicitantes) => {
        this.resultadosSolicitantes = solicitantes.filter(s => s.tipo === tipo);
        console.log('Solicitantes encontrados para tipo', tipo, ':', this.resultadosSolicitantes.length);
        this.cargandoSolicitantes = false;

        // Si no hay solicitantes, mostrar mensaje
        if (this.resultadosSolicitantes.length === 0) {
          console.warn('No se encontraron solicitantes para el tipo:', tipo);
        }
      },
      error: (err) => {
        console.error('Error cargando solicitantes:', err);
        this.cargandoSolicitantes = false;
        this.mostrarListaSolicitantes = false;
      }
    });
  }

  onSolicitanteSearch(termino: string): void {
    if (termino.length < 2) {
      this.mostrarListaSolicitantes = false;
      return;
    }

    const tipo = this.form.get('tipoSolicitante')?.value;
    if (!tipo) return;

    this.cargandoSolicitantes = true;
    this.mostrarListaSolicitantes = true;

    this.tramiteService.buscarSolicitantes(termino).subscribe({
      next: (resultados) => {
        this.resultadosSolicitantes = resultados.filter(s => s.tipo === tipo);
        this.cargandoSolicitantes = false;
      },
      error: (err) => {
        console.error('Error buscando solicitantes:', err);
        this.cargandoSolicitantes = false;
      }
    });
  }

  seleccionarSolicitante(solicitante: { id: number; nombre: string; identificacion: string; tipo: string }): void {
    this.solicitanteSeleccionado = solicitante;
    this.form.get('solicitanteId')?.setValue(solicitante.id);
    this.form.get('tipoSolicitante')?.setValue(solicitante.tipo);
    this.mostrarListaSolicitantes = false;
  }

  limpiarSolicitante(): void {
    this.solicitanteSeleccionado = null;
    this.form.get('solicitanteId')?.setValue(null);
    // No limpiar tipoSolicitante para mantener consistencia
    this.resultadosSolicitantes = [];
    this.mostrarListaSolicitantes = false;
  }

  validarFormulario(): boolean {
    this.error = null;

    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (!this.form.valid) {
      console.log('Formulario inválido. Errores:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Campo ${key} inválido:`, control.errors);
        }
      });
      this.error = 'Por favor complete todos los campos requeridos';
      return false;
    }

    if (!this.form.get('tipoTramiteId')?.value) {
      this.error = 'Debe seleccionar un tipo de trámite';
      return false;
    }

    if (!this.form.get('solicitanteId')?.value) {
      this.error = 'Debe seleccionar un solicitante';
      return false;
    }

    return true;
  }

  guardar(): void {
    console.log('Intentando guardar trámite...');
    console.log('Modo edición:', this.modoEditar);
    console.log('Valores del formulario:', {
      tipoTramiteId: this.form.get('tipoTramiteId')?.value,
      tipoTramiteIdValid: this.form.get('tipoTramiteId')?.valid,
      tipoTramiteIdErrors: this.form.get('tipoTramiteId')?.errors,
      solicitanteId: this.form.get('solicitanteId')?.value,
      tipoSolicitante: this.form.get('tipoSolicitante')?.value,
      formValid: this.form.valid
    });

    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;
    this.error = null;

    const datos = {
      tipoTramiteId: this.form.get('tipoTramiteId')?.value,
      solicitanteId: this.form.get('solicitanteId')?.value,
      tipoSolicitante: this.form.get('tipoSolicitante')?.value,
      codigoRUT: this.form.get('codigoRUT')?.value.trim(),
      prioridad: this.form.get('prioridad')?.value,
      observaciones: this.form.get('observaciones')?.value || undefined
    };

    if (this.modoEditar && this.tramite) {
      const updateData: TramiteUpdateRequest = {
        observaciones: datos.observaciones,
        prioridad: datos.prioridad,
        solicitanteId: datos.solicitanteId,
        tipoSolicitante: datos.tipoSolicitante
      };
      // Solo incluir tipoTramiteId si tiene un valor válido
      const tipoTramiteIdValue = datos.tipoTramiteId;
      if (tipoTramiteIdValue != null && tipoTramiteIdValue !== undefined && tipoTramiteIdValue !== '') {
        const numericId = Number(tipoTramiteIdValue);
        if (!isNaN(numericId) && numericId > 0) {
          updateData.tipoTramiteId = numericId;
        } else {
          console.error('tipoTramiteId no es un número válido:', tipoTramiteIdValue);
          this.error = 'El tipo de trámite seleccionado no es válido';
          this.cargando = false;
          return;
        }
      }
      this.tramiteService.actualizar(this.tramite.id, updateData).subscribe({
        next: () => {
          this.cargando = false;
          this.notificationService.showSuccess('Trámite actualizado exitosamente', 'Éxito');
          this.guardado.emit();
          setTimeout(() => this.cerrar.emit(), 500);
        },
        error: (err: any) => {
          console.error('Error actualizando trámite:', err);
          const errorMsg = err.error?.message || err.message || 'Error al actualizar el trámite';
          this.error = errorMsg;
          this.notificationService.showError(errorMsg, 'Error');
          this.cargando = false;
        }
      });
    } else {
      this.tramiteService.crear(datos).subscribe({
        next: () => {
          this.cargando = false;
          this.notificationService.showSuccess('Trámite creado exitosamente', 'Éxito');
          this.guardado.emit();
          setTimeout(() => this.cerrar.emit(), 500);
        },
        error: (err: any) => {
          console.error('Error creando trámite:', err);
          const errorMsg = err.error?.message || err.message || 'Error al crear el trámite';
          this.error = errorMsg;
          this.notificationService.showError(errorMsg, 'Error');
          this.cargando = false;
        }
      });
    }
  }

  cerrarModal(): void {
    this.cerrar.emit();
    this.form.reset({
      codigoRUT: '',
      tipoTramiteId: null,
      tipoSolicitante: '',
      solicitanteId: null,
      prioridad: 'normal',
      observaciones: ''
    });
    this.modoEditar = false;
    this.solicitanteSeleccionado = null;
    this.resultadosSolicitantes = [];
    this.mostrarListaSolicitantes = false;
    this.error = null;
    this.cargando = false;
  }
}