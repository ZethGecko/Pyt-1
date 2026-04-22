import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService, EmpresaResponse, EmpresaCreateRequest } from '../services/empresa.service';
import { GerenteService, GerenteResponse } from '../services/gerente.service';
import { SubtipoTransporteService } from '../../configuracion/services/subtipo-transporte.service';

interface FormularioEmpresa {
  nombre: string;
  codigo: string;
  ruc: string;
  direccionLegal: string;
  telefono: string;
  email: string;
  inicioVigencia: string;
  finVigencia: string;
  gerenteId: number | null;
  subtipoTransporteId: number | null;
}

@Component({
  selector: 'app-modal-empresa',
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
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            
            <!-- Header -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                  <span class="text-purple-600 text-xl">🏢</span>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ esEdicion ? 'Editar Empresa' : 'Nueva Empresa' }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ esEdicion ? 'Actualice los datos de la empresa' : 'Complete los datos para registrar una nueva empresa' }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Formulario -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- RUC -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    RUC *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.ruc"
                         placeholder="12345678901"
                         [disabled]="esEdicion"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100">
                </div>
                
                <!-- Código -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.codigo"
                         placeholder="EMP001"
                         [disabled]="esEdicion"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100">
                </div>
                
                <!-- Razón Social / Nombre -->
                <div class="form-group md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.nombre"
                         placeholder="Nombre legal de la empresa"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                </div>
                
                <!-- Dirección Legal -->
                <div class="form-group md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Legal *
                  </label>
                  <input type="text" 
                         [(ngModel)]="formulario.direccionLegal"
                         placeholder="Dirección completa de la empresa"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                </div>
                
                <!-- Teléfono -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input type="tel" 
                         [(ngModel)]="formulario.telefono"
                         placeholder="+51 123 456 789"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                </div>
                
                <!-- Email -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input type="email" 
                         [(ngModel)]="formulario.email"
                         placeholder="contacto@empresa.com"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                </div>
                
                <!-- Vigencia -->
                <div class="form-group md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Vigencia *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">
                        Fecha desde *
                      </label>
                      <input type="datetime-local"
                             [(ngModel)]="formulario.inicioVigencia"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">
                        Fecha hasta (opcional)
                      </label>
                      <input type="datetime-local"
                             [(ngModel)]="formulario.finVigencia"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Si no se especifica fecha hasta, se asignará automáticamente 1 año desde la fecha desde.
                  </p>
                </div>
                
                <!-- Gerente (con búsqueda) -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Gerente
                  </label>
                  
                  <!-- Input de búsqueda -->
                  <div class="relative">
                    <input type="text" 
                           [(ngModel)]="gerenteSearchTerm"
                           (input)="buscarGerentes()"
                           (focus)="mostrarDropdownGerente = true"
                           placeholder="Buscar gerente..."
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                    
                    <!-- Dropdown de resultados -->
                    @if (mostrarDropdownGerente && (gerentesFiltrados.length > 0 || gerenteSearchTerm.length >= 2)) {
                      <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        @if (gerentesFiltrados.length > 0) {
                          @for (gerente of gerentesFiltrados; track gerente.id) {
                            <button type="button"
                                    (click)="seleccionarGerente(gerente)"
                                    class="w-full px-3 py-2 text-left hover:bg-purple-50 focus:outline-none">
                              <span class="font-medium">{{ gerente.nombre }}</span>
                              <span class="text-gray-500 text-sm ml-2">DNI: {{ gerente.dni }}</span>
                              @if (gerente.tienePoderVigente) {
                                <span class="text-green-600 text-xs ml-2">✓ Vigente</span>
                              } @else {
                                <span class="text-red-500 text-xs ml-2">⚠ Sin poder</span>
                              }
                            </button>
                          }
                        } @else {
                          <div class="px-3 py-2 text-gray-500 text-sm">
                            No se encontraron gerentes
                          </div>
                        }
                      </div>
                    }
                  </div>
                  
                  <!-- Gerente seleccionado -->
                  @if (gerenteSeleccionado) {
                    <div class="mt-2 flex items-center justify-between bg-purple-50 px-3 py-2 rounded-md">
                      <div>
                        <span class="font-medium text-purple-900">{{ gerenteSeleccionado.nombre }}</span>
                        <span class="text-gray-500 text-sm ml-2">DNI: {{ gerenteSeleccionado.dni }}</span>
                      </div>
                      <button type="button" 
                              (click)="limpiarGerente()"
                              class="text-red-500 hover:text-red-700">
                        <span class="text-lg">×</span>
                      </button>
                    </div>
                  }
                </div>
                
                <!-- Subtipo de Transporte -->
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Transporte
                  </label>
                  <select [(ngModel)]="formulario.subtipoTransporteId"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                    <option [ngValue]="null">Seleccionar tipo de transporte...</option>
                    @for (subtipo of subtiposTransporte; track subtipo.id) {
                      <option [ngValue]="subtipo.id">{{ subtipo.nombre }}</option>
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
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                @if (cargando) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ esEdicion ? 'Actualizar' : 'Registrar' }}
              </button>
              <button (click)="cerrar()"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancelar
              </button>
            </div>
            
          </div>
        </div>
      </div>
    }
  `
})
export class ModalEmpresaComponent implements OnInit {
  @Input() mostrando = false;
  @Input() empresa: EmpresaResponse | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() empresaGuardada = new EventEmitter<void>();
  
  formulario: FormularioEmpresa = this.getEmptyForm();
  esEdicion = false;
  cargando = false;
  error: string | null = null;
  
  // Gerente
  gerentes: GerenteResponse[] = [];
  gerentesFiltrados: GerenteResponse[] = [];
  gerenteSearchTerm = '';
  gerenteSeleccionado: GerenteResponse | null = null;
  mostrarDropdownGerente = false;
  
  constructor(
    private empresaService: EmpresaService,
    private gerenteService: GerenteService,
    private subtipoService: SubtipoTransporteService
  ) {}
  
  ngOnInit(): void {
    this.cargarGerentes();
    this.cargarSubtiposTransporte();
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }
  
  // 🎯 SUBTIPOS DE TRANSPORTE
  subtiposTransporte: any[] = [];
  
  cargarSubtiposTransporte(): void {
    this.subtipoService.getAll().subscribe({
      next: (response: any) => {
        this.subtiposTransporte = response.content || response;
      },
      error: (err) => console.error('Error cargando subtipos:', err)
    });
  }
  
  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }
  
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.form-group:has(input[placeholder="Buscar gerente..."])')) {
      this.mostrarDropdownGerente = false;
    }
  }
  
  getEmptyForm(): FormularioEmpresa {
    return {
      nombre: '',
      codigo: '',
      ruc: '',
      direccionLegal: '',
      telefono: '',
      email: '',
      inicioVigencia: '',
      finVigencia: '',
      gerenteId: null,
      subtipoTransporteId: null
    };
  }
  
  cargarGerentes(): void {
    this.gerenteService.listarDisponiblesParaEmpresa().subscribe({
      next: (gerentes) => {
        this.gerentes = gerentes;
      },
      error: (err) => {
        console.error('Error cargando gerentes:', err);
      }
    });
  }
  
  buscarGerentes(): void {
    const term = this.gerenteSearchTerm.toLowerCase().trim();
    if (term.length < 2) {
      this.gerentesFiltrados = [];
      return;
    }
    
    this.gerentesFiltrados = this.gerentes.filter(g =>
      g.nombre.toLowerCase().includes(term) ||
      g.dni.toString().includes(term)
    );
  }
  
  seleccionarGerente(gerente: GerenteResponse): void {
    this.gerenteSeleccionado = gerente;
    this.formulario.gerenteId = gerente.id;
    this.gerenteSearchTerm = '';
    this.gerentesFiltrados = [];
    this.mostrarDropdownGerente = false;
  }
  
  limpiarGerente(): void {
    this.gerenteSeleccionado = null;
    this.formulario.gerenteId = null;
    this.gerenteSearchTerm = '';
  }
  
  inicializarFormulario(): void {
    this.esEdicion = !!this.empresa;
    this.limpiarGerente();
    
    if (this.empresa) {
      this.formulario = {
        nombre: this.empresa.nombre || '',
        codigo: this.empresa.codigo || '',
        ruc: this.empresa.ruc || '',
        direccionLegal: this.empresa.direccionLegal || '',
        telefono: this.empresa.contactoTelefono || '',
        email: this.empresa.email || '',
        inicioVigencia: this.empresa.inicioVigencia ? this.formatDateForInput(this.empresa.inicioVigencia) : '',
        finVigencia: this.empresa.finVigencia ? this.formatDateForInput(this.empresa.finVigencia) : '',
        gerenteId: this.empresa.gerenteId || null,
        subtipoTransporteId: this.empresa.subtipoTransporteId || null
      };
      
      // Si tiene gerente asignado, buscar en la lista
      if (this.empresa.gerenteId) {
        this.gerenteService.obtener(this.empresa.gerenteId).subscribe({
          next: (gerente) => {
            this.gerenteSeleccionado = gerente;
          },
          error: () => {}
        });
      }
    } else {
      this.formulario = this.getEmptyForm();
    }
    
    this.error = null;
  }
  
  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }
  
  ngOnChanges(): void {
    this.inicializarFormulario();
  }
  
  validarFormulario(): boolean {
    return !!this.formulario.ruc && 
           !!this.formulario.codigo &&
           !!this.formulario.nombre &&
           !!this.formulario.direccionLegal &&
           !!this.formulario.inicioVigencia;
  }
  
  guardar(): void {
    if (!this.validarFormulario()) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }
    
    this.cargando = true;
    this.error = null;
    
    const data: EmpresaCreateRequest = {
      nombre: this.formulario.nombre,
      codigo: this.formulario.codigo,
      ruc: this.formulario.ruc,
      direccionLegal: this.formulario.direccionLegal,
      contactoTelefono: this.formulario.telefono || undefined,
      email: this.formulario.email || undefined,
      inicioVigencia: this.formulario.inicioVigencia ? new Date(this.formulario.inicioVigencia).toISOString() : undefined,
      finVigencia: this.formulario.finVigencia ? new Date(this.formulario.finVigencia).toISOString() : undefined,
      gerenteId: this.formulario.gerenteId || undefined,
      subtipoTransporteId: this.formulario.subtipoTransporteId || undefined
    };
    
    if (this.esEdicion && this.empresa) {
      this.empresaService.actualizar(this.empresa.id, data).subscribe({
        next: () => {
          this.cargando = false;
          this.empresaGuardada.emit();
          this.cerrar();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar la empresa';
          this.cargando = false;
          console.error(err);
        }
      });
    } else {
      this.empresaService.crear(data).subscribe({
        next: () => {
          this.cargando = false;
          this.empresaGuardada.emit();
          this.cerrar();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear la empresa';
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }
  
  cerrar(): void {
    this.formulario = this.getEmptyForm();
    this.limpiarGerente();
    this.error = null;
    this.cerrarModal.emit();
  }
}
