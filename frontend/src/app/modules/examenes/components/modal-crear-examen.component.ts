import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoPresentacionService, GrupoPresentacionCreateRequest } from '../services/grupo-presentacion.service';

interface FormularioExamen {
  codigo: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  capacidadMaxima: number;
  tipoExamen: string;
  requisitoExamenId: number | null;
}

@Component({
  selector: 'app-modal-crear-examen',
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
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <span class="text-blue-600 text-xl">📋</span>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Nuevo Grupo de Examen
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Complete los datos para programar un nuevo examen
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Formulario -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div class="space-y-4">
                
                <!-- Código -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.codigo"
                         placeholder="EXAM-2024-001"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Examen *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.nombre"
                         placeholder="Examen Teórico - Categoría A"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <!-- Descripción -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea [(ngModel)]="formulario.descripcion"
                            rows="2"
                            placeholder="Descripción del examen..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <!-- Fecha -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input type="date" 
                           [(ngModel)]="formulario.fecha"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  </div>
                  
                  <!-- Tipo -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Examen *
                    </label>
                    <select [(ngModel)]="formulario.tipoExamen"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Seleccionar...</option>
                      <option value="TEORICO">Teórico</option>
                      <option value="PRACTICO">Práctico</option>
                      <option value="PSICOLOGICO">Psicológico</option>
                      <option value="MEDICO">Médico</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <!-- Hora Inicio -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Hora Inicio *
                    </label>
                    <input type="time" 
                           [(ngModel)]="formulario.horaInicio"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  </div>
                  
                  <!-- Hora Fin -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fin *
                    </label>
                    <input type="time" 
                           [(ngModel)]="formulario.horaFin"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  </div>
                </div>
                
     <!-- Lugar -->
                 <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">
                     Lugar *
                   </label>
                   <input type="text" 
                          [(ngModel)]="formulario.lugar"
                          placeholder="Aula 101 - Centro de Evaluaciones"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                 </div>
                 
                 <!-- Requisito de Examen -->
                 <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">
                     Requisito de Examen *
                   </label>
                   <select [(ngModel)]="formulario.requisitoExamenId"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                     <option [value]="null">Seleccionar requisito...</option>
                     <option *ngFor="let req of requisitosActivos" [value]="req.id">
                       {{req.codigo}} - {{req.descripcion}}
                     </option>
                   </select>
                 </div>
                 
                 <!-- Capacidad -->
                 <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">
                     Capacidad Máxima *
                   </label>
                   <input type="number" 
                          [(ngModel)]="formulario.capacidadMaxima"
                          min="1"
                          max="100"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                 </div>
                
              </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button (click)="guardar()"
                      [disabled]="cargando || !validarFormulario()"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                @if (cargando) {
                  <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                }
                Crear Examen
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
export class ModalCrearExamenComponent implements OnInit {
  @Input() mostrando = false;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() examenGuardado = new EventEmitter<void>();
  
   formulario: FormularioExamen = {
     codigo: '',
     nombre: '',
     descripcion: '',
     fecha: '',
     horaInicio: '',
     horaFin: '',
     lugar: '',
     capacidadMaxima: 20,
     tipoExamen: '',
     requisitoExamenId: null
   };
  
  cargando = false;
  error: string | null = null;
  
   constructor(private grupoService: GrupoPresentacionService) {}
   
   requisitosActivos: any[] = [];
   
   ngOnInit(): void {
     this.cargarRequisitosActivos();
   }
   
   cargarRequisitosActivos(): void {
     this.grupoService.obtenerRequisitosActivos().subscribe({
       next: (requisitos) => {
         this.requisitosActivos = requisitos;
       },
       error: (err) => {
         console.error('Error loading requisitos:', err);
         this.error = 'Error al cargar los requisitos de examen';
       }
     });
   }
  
   validarFormulario(): boolean {
     return !!this.formulario.codigo && 
            !!this.formulario.nombre && 
            !!this.formulario.fecha &&
            !!this.formulario.horaInicio &&
            !!this.formulario.horaFin &&
            !!this.formulario.lugar &&
            !!this.formulario.tipoExamen &&
            this.formulario.capacidadMaxima > 0 &&
            this.formulario.requisitoExamenId !== null;
   }
  
   guardar(): void {
     if (!this.validarFormulario()) {
       this.error = 'Por favor complete todos los campos requeridos';
       return;
     }
     
     this.cargando = true;
     this.error = null;
     
     const data: GrupoPresentacionCreateRequest = {
       requisitoExamenId: this.formulario.requisitoExamenId,
       fecha: this.formulario.fecha,
       horaInicio: this.formulario.horaInicio,
       horaFin: this.formulario.horaFin,
       capacidad: this.formulario.capacidadMaxima,
       observaciones: this.formulario.descripcion
     };
     
     this.grupoService.crear(data).subscribe({
       next: (response) => {
         this.cargando = false;
         this.examenGuardado.emit();
         this.cerrar();
       },
       error: (err) => {
         this.error = err.error?.message || 'Error al crear el examen';
         this.cargando = false;
         console.error(err);
       }
     });
   }
  
  cerrar(): void {
    this.formulario = {
      codigo: '',
      nombre: '',
      descripcion: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      lugar: '',
      capacidadMaxima: 20,
      tipoExamen: ''
    };
    this.error = null;
    this.cerrarModal.emit();
  }
}
