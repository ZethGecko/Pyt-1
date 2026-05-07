import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { InspeccionService } from '../services/inspeccion.service';
import { InstanciaTramiteService } from '../../configuracion/services/instancia-tramite.service';
import { EmpresaService, EmpresaResponse } from '../../empresas/services/empresa.service';
import { TramiteService } from '../../tramites/services/tramite.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { InstanciaTramite } from '../../configuracion/models/instancia-tramite.model';

interface FormularioInspeccion {
  fecha: string;
  horaProgramada: string;
  lugar: string;
  observaciones: string;
  instanciasTramiteIds: number[];
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
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            
            <!-- Header -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <span class="text-green-600 text-xl">🔍</span>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                   <h3 class="text-lg leading-6 font-medium text-gray-900">
                     {{ modo === 'agregar' ? 'Agregar Vehículos a Inspección' : modo === 'editar-datos' ? 'Editar Datos de Inspección' : 'Programar Inspección' }}
                   </h3>
                   <p class="mt-1 text-sm text-gray-500">
                     {{ modo === 'agregar' ? 'Seleccione vehículos adicionales del expediente' : modo === 'editar-datos' ? 'Modifique fecha, hora y lugar de la inspección' : 'Complete los datos para programar una nueva inspección' }}
                   </p>
                </div>
              </div>
            </div>
            
            <!-- Formulario -->
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div class="space-y-4">
                
                 @if (modo === 'crear') {
                 <!-- Trámite -->
                 <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">
                     Trámite *
                   </label>
                   <select [(ngModel)]="tramiteSeleccionadoId"
                           (change)="onTramiteChange()"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                     <option [ngValue]="undefined">Seleccionar trámite...</option>
                     @for (tram of tramites; track tram.id) {
                       <option [value]="tram.id">
                         {{ tram.codigoRUT }} - {{ tram.tipoTramiteDescripcion || 'Sin tipo' }} ({{ tram.solicitanteNombre || 'N/A' }})
                       </option>
                     }
                   </select>
                 </div>
                 }

                 <!-- Empresa (solo en crear) -->
                 @if (modo === 'crear' && tramiteSeleccionadoId) {
                   <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">
                       Empresa *
                     </label>
                     <select [(ngModel)]="empresaSeleccionadaId"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                             [disabled]="empresaSoloLectura">
                       <option [ngValue]="undefined">Seleccionar empresa...</option>
                         @for (emp of empresas; track emp.id) {
                           <option [value]="emp.id">{{ emp.nombre }}</option>
                         }
                     </select>
                   </div>
                 }
                
                <!-- Instancias (Vehículos) disponibles -->
                @if (empresaSeleccionadaId) {
                  <div class="border-t pt-4">
                     <div class="flex justify-between items-center mb-2">
                       <label class="block text-sm font-medium text-gray-700 mb-0">Vehículos a Inspeccionar *</label>
                       <button type="button" (click)="seleccionarTodos()" class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                         Seleccionar todos
                       </button>
                     </div>
                    @if (instanciasCargando) {
                      <div class="text-center py-4">
                        <span class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></span>
                        <p class="text-sm text-gray-500 mt-2">Cargando vehículos...</p>
                      </div>
                    } @else if (instanciasFiltradas.length === 0) {
                      <div class="text-center py-4 text-gray-500">
                        No hay vehículos registrados para esta empresa
                      </div>
                    } @else {
                      <div class="max-h-60 overflow-y-auto border rounded-md">
                        <table class="min-w-full divide-y divide-gray-200">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Seleccionar</th>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Trámite</th>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Vehículo / Instancia</th>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Estado</th>
                            </tr>
                          </thead>
                          <tbody class="bg-white divide-y divide-gray-200">
                            @for (inst of instanciasFiltradas; track inst.idInstancia) {
                              <tr>
                                <td class="px-4 py-2">
                                  <input type="checkbox"
                                         [checked]="instanciasSeleccionadas.includes(inst.idInstancia)"
                                         (change)="toggleSeleccion(inst.idInstancia, $event.target.checked)"
                                         class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                                </td>
                                <td class="px-4 py-2 text-sm text-gray-900">
                                  {{ inst.tramite?.codigoRut || 'N/A' }}
                                </td>
                                <td class="px-4 py-2 text-sm text-gray-900">
                                  {{ inst.identificador }}
                                </td>
                                <td class="px-4 py-2 text-sm">
                                  <span class="badge" [class]="'badge-' + getBadgeClass(inst.estado)">
                                    {{ inst.estado }}
                                  </span>
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">
                        Seleccionados: {{ instanciasSeleccionadas.length }} de {{ instanciasFiltradas.length }}
                        @if (modo === 'agregar') {
                          ({{ instanciasSeleccionadas.length - instanciasOriginales.length }} nuevos)
                        }
                      </p>
                    }
                  </div>
                }
                
                 <!-- Fecha y Hora (en crear y agregar) -->
                 @if (modo === 'crear' || modo === 'agregar') {
                   <div class="grid grid-cols-2 gap-4">
                     <div>
                       <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                       <input type="date" 
                              [(ngModel)]="formulario.fecha"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                     </div>
                     <div>
                       <label class="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                       <input type="time"
                              name="horaProgramada"
                              required
                              [(ngModel)]="formulario.horaProgramada"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                     </div>
                   </div>
                   <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">Lugar *</label>
                     <input type="text" 
                            [(ngModel)]="formulario.lugar"
                            placeholder="Dirección de la inspección"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                   </div>
                 }
                
                <!-- Observaciones -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
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
                @if (instanciasSeleccionadas.length > 1) {
                  @if (modo === 'agregar') {
                    Agregar {{ instanciasSeleccionadas.length - instanciasOriginales.length }} Vehículos
                  } @else {
                    Programar {{ instanciasSeleccionadas.length }} Inspecciones
                  }
                } @else {
                  @if (modo === 'agregar') {
                    Agregar Vehículo
                  } @else {
                    Programar Inspección
                  }
                }
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
export class ModalProgramarInspeccionComponent implements OnInit, OnChanges {
  @Input() mostrando = false;
  @Input() empresas: EmpresaResponse[] = [];
   @Input() modo: 'crear' | 'agregar' | 'editar-datos' = 'crear';
  @Input() inspeccionId?: number;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() inspeccionGuardada = new EventEmitter<void>();

  formulario: FormularioInspeccion = {
    fecha: '',
    horaProgramada: '',
    lugar: '',
    observaciones: '',
    instanciasTramiteIds: []
  };

  tramites: any[] = [];
  tramiteSeleccionadoId: number | undefined = undefined;
  instanciasFiltradas: InstanciaTramite[] = [];
  instanciasSeleccionadas: number[] = [];
  instanciasCargando = false;
  instanciasOriginales: number[] = [];

  empresaSeleccionadaId: number | undefined = undefined;
  empresaSoloLectura = false;

  cargando = false;
  error: string | null = null;

  constructor(
    private inspeccionService: InspeccionService,
    private instanciaService: InstanciaTramiteService,
    private empresaService: EmpresaService,
    private tramiteService: TramiteService,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTramitesConInstancias();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrando'] && this.mostrando) {
      if (this.modo === 'agregar' && this.inspeccionId) {
        this.cargarInspeccionParaAgregar();
      } else {
        this.resetFormulario();
      }
    }
  }

  cargarTramitesConInstancias(): void {
    this.tramiteService.listarConInstancias().subscribe({
      next: (tramites) => {
        this.tramites = tramites.sort((a, b) => {
          const codigoA = a.codigoRUT || '';
          const codigoB = b.codigoRUT || '';
          const cmp = codigoA.localeCompare(codigoB);
          if (cmp !== 0) return cmp;
          const fechaA = new Date(a.fechaRegistro).getTime();
          const fechaB = new Date(b.fechaRegistro).getTime();
          return fechaB - fechaA;
        });
      },
      error: (err) => {
        console.error('Error al cargar trámites:', err);
        this.tramites = [];
      }
    });
  }

  cargarInspeccionParaAgregar(): void {
    this.cargando = true;
    this.inspeccionService.obtenerConInstancias(this.inspeccionId!).subscribe({
      next: (inspeccion) => {
        // Cargar datos de la inspección existente en el formulario para editar cabecera
        const fechaProgramada = inspeccion.fechaProgramada;
        if (fechaProgramada) {
          if (fechaProgramada instanceof Date) {
            this.formulario.fecha = fechaProgramada.toISOString().split('T')[0];
          } else {
            // Asumir string yyyy-MM-dd
            this.formulario.fecha = fechaProgramada as string;
          }
        }
        this.formulario.horaProgramada = inspeccion.hora || '';
        this.formulario.lugar = inspeccion.lugar || '';
        this.formulario.observaciones = inspeccion.observacionesGenerales || '';

         if (inspeccion.instancias && inspeccion.instancias.length > 0) {
           const primeraInstancia = inspeccion.instancias[0];
           const tramiteId = primeraInstancia.tramiteId;
           const tramite = this.tramites.find(t => t.id === tramiteId);
           if (tramite) {
             this.tramiteSeleccionadoId = tramite.id;
            // Configurar empresa basado en el trámite
            if (tramite.solicitanteTipo === 'Empresa' && tramite.solicitanteId) {
              this.empresaSeleccionadaId = tramite.solicitanteId;
              this.empresaSoloLectura = true;
            } else {
              this.empresaSeleccionadaId = undefined;
              this.empresaSoloLectura = false;
            }
            this.instanciasCargando = true;
            this.instanciaService.listarPorTramite(tramite.id).subscribe({
              next: (instancias) => {
                this.instanciasFiltradas = instancias.sort((a, b) => {
                  const codigoA = a.tramite?.codigoRut || '';
                  const codigoB = b.tramite?.codigoRut || '';
                  const cmp = codigoA.localeCompare(codigoB);
                  if (cmp !== 0) return cmp;
                  const fechaA = new Date(a.fechaCreacion).getTime();
                  const fechaB = new Date(b.fechaCreacion).getTime();
                  return fechaB - fechaA;
                });
                this.instanciasOriginales = inspeccion.instancias!.map(i => i.idInstancia);
                this.instanciasSeleccionadas = [...this.instanciasOriginales];
                this.instanciasCargando = false;
                this.cargando = false;
              },
              error: (err) => {
                console.error('Error al cargar instancias del trámite:', err);
                this.instanciasFiltradas = [];
                this.instanciasCargando = false;
                this.cargando = false;
              }
            });
          } else {
            this.cargando = false;
          }
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar inspección para editar:', err);
        this.cargando = false;
      }
    });
  }

  resetFormulario(): void {
    this.formulario = {
      fecha: '',
      horaProgramada: '',
      lugar: '',
      observaciones: '',
      instanciasTramiteIds: []
    };
    this.tramiteSeleccionadoId = undefined;
    this.instanciasFiltradas = [];
    this.instanciasSeleccionadas = [];
    this.empresaSeleccionadaId = undefined;
    this.empresaSoloLectura = false;
    this.instanciasOriginales = [];
  }

  onTramiteChange(): void {
    this.instanciasSeleccionadas = [];
    if (!this.tramiteSeleccionadoId) {
      this.instanciasFiltradas = [];
      this.empresaSeleccionadaId = undefined;
      this.empresaSoloLectura = false;
      return;
    }

    const tramite = this.tramites.find(t => t.id === this.tramiteSeleccionadoId);
    if (tramite) {
      if (tramite.solicitanteTipo === 'Empresa' && tramite.solicitanteId) {
        this.empresaSeleccionadaId = tramite.solicitanteId;
        this.empresaSoloLectura = true;
      } else {
        this.empresaSeleccionadaId = undefined;
        this.empresaSoloLectura = false;
      }
    }

    this.instanciasCargando = true;
    this.instanciaService.listarPorTramite(this.tramiteSeleccionadoId).subscribe({
      next: (instancias) => {
        this.instanciasFiltradas = instancias
          .sort((a, b) => {
            const codigoA = a.tramite?.codigoRut || '';
            const codigoB = b.tramite?.codigoRut || '';
            const cmp = codigoA.localeCompare(codigoB);
            if (cmp !== 0) return cmp;
            const fechaA = new Date(a.fechaCreacion).getTime();
            const fechaB = new Date(b.fechaCreacion).getTime();
            return fechaB - fechaA;
          });
        // Si estamos en modo agregar, preservar selección original
        if (this.modo === 'agregar') {
          this.instanciasSeleccionadas = [...this.instanciasOriginales];
        }
        this.instanciasCargando = false;
      },
      error: (err) => {
        console.error('Error al cargar instancias:', err);
        this.instanciasFiltradas = [];
        this.instanciasCargando = false;
      }
    });
  }

  toggleSeleccion(id: number, checked: boolean): void {
    if (checked) {
      if (!this.instanciasSeleccionadas.includes(id)) {
        this.instanciasSeleccionadas.push(id);
      }
    } else {
      this.instanciasSeleccionadas = this.instanciasSeleccionadas.filter(i => i !== id);
    }
  }

  seleccionarTodos(): void {
    this.instanciasSeleccionadas = this.instanciasFiltradas.map(inst => inst.idInstancia);
  }

  getBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'APROBADO': return 'success';
      case 'EN_REVISION': return 'warning';
      case 'OBSERVADO': return 'warning';
      case 'PENDIENTE': return 'info';
      case 'CERRADO': return 'secondary';
      default: return 'secondary';
    }
  }

   validarFormulario(): boolean {
     if (this.modo === 'crear' && !this.tramiteSeleccionadoId) {
       this.error = 'Seleccione un trámite';
       return false;
     }
     if (this.modo === 'crear') {
       if (!this.formulario.fecha || this.formulario.fecha.trim() === '') {
         this.error = 'Ingrese la fecha programada';
         return false;
       }
       if (!this.formulario.horaProgramada || this.formulario.horaProgramada.trim() === '') {
         this.error = 'Ingrese la hora programada';
         return false;
       }
       if (!this.formulario.lugar || this.formulario.lugar.trim() === '') {
         this.error = 'Ingrese el lugar de la inspección';
         return false;
       }
     }
     if (this.instanciasSeleccionadas.length === 0) {
       this.error = 'Seleccione al menos una instancia de trámite';
       return false;
     }
     if (this.modo === 'crear' && !this.empresaSoloLectura && !this.empresaSeleccionadaId) {
       this.error = 'Seleccione una empresa';
       return false;
     }
     return true;
   }

    guardar(): void {
      if (!this.validarFormulario()) {
        this.error = 'Por favor complete todos los campos requeridos';
        return;
      }

      this.cargando = true;
      this.error = null;

      if (this.modo === 'agregar' && this.inspeccionId) {
        const nuevas = this.instanciasSeleccionadas.filter(id => !this.instanciasOriginales.includes(id));

        // Actualizar cabecera de la inspección
        const updateData: any = {
          fechaProgramada: this.formulario.fecha,
          hora: this.formulario.horaProgramada,
          lugar: this.formulario.lugar,
          observacionesGenerales: this.formulario.observaciones
        };

        this.inspeccionService.actualizar(this.inspeccionId, updateData).pipe(
          switchMap(() => {
            if (nuevas.length === 0) {
              return of(null);
            }
            return this.inspeccionService.agregarInstancias(this.inspeccionId!, nuevas);
          })
        ).subscribe({
          next: () => {
            this.cargando = false;
            this.notificationService.success('Inspección actualizada exitosamente', 'Éxito', 3000);
            this.cerrar();
            this.inspeccionGuardada.emit();
          },
          error: (err) => {
            this.cargando = false;
            this.error = err.error?.message || 'Error al actualizar inspección';
          }
        });
       } else {
         const data: any = {
           instanciasTramiteIds: this.instanciasSeleccionadas,
           fechaProgramada: this.formulario.fecha,
           hora: this.formulario.horaProgramada!,
           lugar: this.formulario.lugar!,
           observacionesGenerales: this.formulario.observaciones
         };
         // NOTA: La empresa se deriva del trámite, no se envía por separado
         console.log('DEBUG: Enviando datos de inspección:', data);
         this.inspeccionService.crearConInstancias(data).subscribe({
         next: (inspeccion) => {
           this.cargando = false;
           this.notificationService.success('Inspección programada correctamente', 'Éxito', 3000);
           this.cerrar();
           this.inspeccionGuardada.emit();
         },
         error: (err) => {
           this.cargando = false;
           this.error = err.error?.message || 'Error al programar la inspección';
         }
       });
      }
    }

    cerrar(): void {
      this.resetFormulario();
      this.error = null;
      this.cerrarModal.emit();
    }

    getNombreEmpresa(empresaId: number): string {
      const empresa = this.empresas.find(e => e.id === empresaId);
      return empresa ? empresa.nombre : 'N/A';
    }
}