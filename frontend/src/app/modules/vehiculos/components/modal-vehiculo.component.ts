import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculoService, VehiculoResponse, VehiculoCreateRequest } from '../services/vehiculo.service';

interface FormularioVehiculo {
  placa: string;
  fechaFabricacion: number;
  marca: string;
  modelo: string;
  color: string;
  tipoTransporteId: number | null;
  categoriaTransporteId: number | null;
  empresaId: number | null;
}

@Component({
  selector: 'app-modal-vehiculo',
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
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            
            <!-- Header -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <span class="text-blue-600 text-xl">🚗</span>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ esEdicion ? 'Editar Vehículo' : 'Nuevo Vehículo' }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ esEdicion ? 'Actualice los datos del vehículo' : 'Complete los datos para registrar un nuevo vehículo' }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Formulario -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-96 overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Placa -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Placa *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.placa"
                         placeholder="ABC-123"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 uppercase">
                </div>
                
                <!-- Marca -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.marca"
                         placeholder="Toyota, Ford, etc."
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <!-- Modelo -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.modelo"
                         placeholder="Corolla, F-150, etc."
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <!-- Año -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Año de Fabricación *
                  </label>
                  <input type="number"
                         [(ngModel)]="formulario.fechaFabricacion"
                         min="1900"
                         [max]="anioActual"
                         [placeholder]="anioActual.toString()"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <!-- Color -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.color"
                         placeholder="Blanco, Negro, Rojo, etc."
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <!-- Tipo Transporte -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Transporte *
                  </label>
                  <select [(ngModel)]="formulario.tipoTransporteId"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (tipo of tiposTransporte; track tipo.id) {
                      <option [value]="tipo.id">{{ tipo.nombre }}</option>
                    }
                  </select>
                </div>
                
                <!-- Categoría Transporte -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Categoría de Transporte *
                  </label>
                  <select [(ngModel)]="formulario.categoriaTransporteId"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (cat of categoriasTransporte; track cat.id) {
                      <option [value]="cat.id">{{ cat.nombre }}</option>
                    }
                  </select>
                </div>
                
                <!-- Empresa -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Empresa (Opcional)
                  </label>
                  <select [(ngModel)]="formulario.empresaId"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option [ngValue]="null">Sin empresa</option>
                    @for (emp of empresas; track emp.id) {
                      <option [value]="emp.id">{{ emp.razonSocial }}</option>
                    }
                  </select>
                </div>
                
              </div>
              
              <!-- Error Message -->
              @if (error) {
                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p class="text-sm text-red-600">{{ error }}</p>
                </div>
              }
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button (click)="guardar()"
                      [disabled]="cargando || !validarFormulario()"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                @if (cargando) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ esEdicion ? 'Actualizar' : 'Registrar' }}
              </button>
              <button (click)="cerrar()"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancelar
              </button>
            </div>
            
          </div>
        </div>
      </div>
    }
  `
})
export class ModalVehiculoComponent implements OnInit {
  @Input() mostrando = false;
  @Input() vehiculo: VehiculoResponse | null = null;
  @Input() empresas: { id: number; razonSocial: string }[] = [];
  @Input() tiposTransporte: { id: number; nombre: string }[] = [];
  @Input() categoriasTransporte: { id: number; nombre: string }[] = [];
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() vehiculoGuardado = new EventEmitter<void>();
  
  formulario: FormularioVehiculo = this.getEmptyForm();
  esEdicion = false;
  cargando = false;
  error: string | null = null;
  anioActual = new Date().getFullYear();
  
  constructor(private vehiculoService: VehiculoService) {}
  
  ngOnInit(): void {
    this.inicializarFormulario();
  }
  
  ngOnChanges(): void {
    this.inicializarFormulario();
  }
  
  getEmptyForm(): FormularioVehiculo {
    return {
      placa: '',
      fechaFabricacion: this.anioActual,
      marca: '',
      modelo: '',
      color: '',
      tipoTransporteId: null,
      categoriaTransporteId: null,
      empresaId: null
    };
  }
  
  inicializarFormulario(): void {
    this.esEdicion = !!this.vehiculo;
    
    if (this.vehiculo) {
      this.formulario = {
        placa: this.vehiculo.placa || '',
        fechaFabricacion: this.vehiculo.fechaFabricacion || this.anioActual,
        marca: this.vehiculo.marca || '',
        modelo: this.vehiculo.modelo || '',
        color: this.vehiculo.color || '',
        tipoTransporteId: this.vehiculo.tipoTransporteId || null,
        categoriaTransporteId: this.vehiculo.categoriaTransporteId || null,
        empresaId: this.vehiculo.empresa?.id || null
      };
    } else {
      this.formulario = this.getEmptyForm();
    }
    
    this.error = null;
  }
  
  validarFormulario(): boolean {
    return !!this.formulario.placa &&
           !!this.formulario.marca &&
           !!this.formulario.modelo &&
           !!this.formulario.fechaFabricacion &&
           !!this.formulario.tipoTransporteId &&
           !!this.formulario.categoriaTransporteId;
  }
  
  guardar(): void {
    if (!this.validarFormulario()) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }
    
    this.cargando = true;
    this.error = null;
    
    const data: VehiculoCreateRequest = {
      placa: this.formulario.placa.toUpperCase(),
      fechaFabricacion: this.formulario.fechaFabricacion,
      marca: this.formulario.marca,
      modelo: this.formulario.modelo,
      color: this.formulario.color,
      tipoTransporteId: this.formulario.tipoTransporteId!,
      categoriaTransporteId: this.formulario.categoriaTransporteId!,
      empresaId: this.formulario.empresaId ?? undefined
    };
    
    if (this.esEdicion && this.vehiculo) {
      this.vehiculoService.actualizar(this.vehiculo.id, data).subscribe({
        next: () => {
          this.cargando = false;
          this.vehiculoGuardado.emit();
          this.cerrar();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar el vehículo';
          this.cargando = false;
          console.error(err);
        }
      });
    } else {
      this.vehiculoService.crear(data).subscribe({
        next: () => {
          this.cargando = false;
          this.vehiculoGuardado.emit();
          this.cerrar();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear el vehículo';
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }
  
  cerrar(): void {
    this.formulario = this.getEmptyForm();
    this.error = null;
    this.cerrarModal.emit();
  }
}
