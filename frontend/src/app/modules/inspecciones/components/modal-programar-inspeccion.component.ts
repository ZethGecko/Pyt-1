import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InspeccionService, InspeccionCreateRequest } from '../services/inspeccion.service';

interface FormularioInspeccion {
  tipo: string;
  fecha: string;
  horaProgramada: string;
  lugar: string;
  observaciones: string;
  expedienteId: number | undefined;
  empresaId: number | undefined;
  vehiculoId: number | undefined;
  inspectorId: number | undefined;
}

@Component({
  selector: 'app-modal-programar-inspeccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Overlay -->
    @if (mostrando) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
          
          <!-- Fondo -->
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
               (click)="cerrar()"></div>
          
          <!-- Modal -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            
            <!-- Header -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <span class="text-green-600 text-xl">🔍</span>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Programar Inspección
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Complete los datos para programar una nueva inspección
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Formulario -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div class="space-y-4">
                
                <!-- Tipo de Inspección -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Inspección *
                  </label>
                  <select [(ngModel)]="formulario.tipo"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option value="">Seleccionar...</option>
                    <option value="VEHICULAR">Inspección Vehicular</option>
                    <option value="EMPRESARIAL">Inspección Empresarial</option>
                    <option value="SEGURIDAD">Inspección de Seguridad</option>
                    <option value="CUMPLIMIENTO">Inspección de Cumplimiento</option>
                    <option value="RENOVACION">Inspección de Renovación</option>
                  </select>
                </div>
                
                <!-- Expediente -->
                @if (expedientes.length > 0) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Expediente (Opcional)
                    </label>
                    <select [(ngModel)]="formulario.expedienteId"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                      <option [ngValue]="undefined">Sin expediente</option>
                      @for (exp of expedientes; track exp.id) {
                        <option [value]="exp.id">{{ exp.codigo }} - {{ exp.empresaRazonSocial }}</option>
                      }
                    </select>
                  </div>
                }
                
                <!-- Fecha y Hora -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input type="date" 
                           [(ngModel)]="formulario.fecha"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Hora *
                    </label>
                    <input type="time" 
                           [(ngModel)]="formulario.horaProgramada"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                  </div>
                </div>
                
                <!-- Lugar -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Lugar *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.lugar"
                         placeholder="Dirección de la inspección"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                </div>
                
                <!-- Observaciones -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea [(ngModel)]="formulario.observaciones"
                            rows="2"
                            placeholder="Notas adicionales..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                </div>
                
              </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button (click)="guardar()"
                      [disabled]="cargando || !validarFormulario()"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                @if (cargando) {
                  <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                }
                Programar Inspección
              </button>
              <button (click)="cerrar()"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancelar
              </button>
            </div>
            
          </div>
        </div>
      </div>
    }
  `
})
export class ModalProgramarInspeccionComponent implements OnInit {
  @Input() mostrando = false;
  @Input() expedientes: { id: number; codigo: string; empresaRazonSocial: string }[] = [];
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() inspeccionGuardada = new EventEmitter<void>();
  
  formulario: FormularioInspeccion = {
    tipo: '',
    fecha: '',
    horaProgramada: '',
    lugar: '',
    observaciones: '',
    expedienteId: undefined,
    empresaId: undefined,
    vehiculoId: undefined,
    inspectorId: undefined
  };
  
  cargando = false;
  error: string | null = null;
  
  constructor(private inspeccionService: InspeccionService) {}
  
  ngOnInit(): void {}
  
  validarFormulario(): boolean {
    return !!this.formulario.tipo && 
           !!this.formulario.fecha &&
           !!this.formulario.horaProgramada &&
           !!this.formulario.lugar;
  }
  
  guardar(): void {
    if (!this.validarFormulario()) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }
    
    this.cargando = true;
    this.error = null;
    
    const data: InspeccionCreateRequest = {
      tipo: this.formulario.tipo,
      fechaProgramada: new Date(this.formulario.fecha),
      horaProgramada: this.formulario.horaProgramada,
      lugar: this.formulario.lugar,
      expedienteId: this.formulario.expedienteId,
      empresaId: this.formulario.empresaId,
      vehiculoId: this.formulario.vehiculoId,
      inspectorId: this.formulario.inspectorId
    };
    
    this.inspeccionService.crear(data).subscribe({
      next: () => {
        this.cargando = false;
        this.inspeccionGuardada.emit();
        this.cerrar();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al programar la inspección';
        this.cargando = false;
        console.error(err);
      }
    });
  }
  
  cerrar(): void {
    this.formulario = {
      tipo: '',
      fecha: '',
      horaProgramada: '',
      lugar: '',
      observaciones: '',
      expedienteId: undefined,
      empresaId: undefined,
      vehiculoId: undefined,
      inspectorId: undefined
    };
    this.error = null;
    this.cerrarModal.emit();
  }
}
