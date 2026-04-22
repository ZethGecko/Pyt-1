import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeguimientoService, TramiteListado, SeguimientoCompleto } from '../../services/seguimiento.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss']
})
export class SeguimientoComponent implements OnInit, OnDestroy {
  seguimientoForm: FormGroup;
  tramites: TramiteListado[] = [];
  error: string | null = null;
  exito: string | null = null;
  cargando: boolean = false;

  // Modal de detalle
  mostrarDetalle: boolean = false;
  tramiteDetalle: SeguimientoCompleto | null = null;
  cargandoDetalle: boolean = false;

  // Destroy subject para limpiar subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private seguimientoService: SeguimientoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.seguimientoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Cargar todos los trámites al iniciar (opcional, se puede comentar si hay muchos)
    // this.cargarTodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cerrar modal con tecla ESC
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.mostrarDetalle) {
      this.cerrarDetalle();
    }
  }

  cargarTodos(): void {
    this.cargando = true;
    this.error = null;

    this.seguimientoService.listarTodos().subscribe({
      next: (data) => {
        this.tramites = data;
        this.cargando = false;
        this.exito = `Se encontraron ${data.length} trámites`;
      },
      error: (err) => {
        console.error('Error al cargar trámites:', err);
        this.error = 'Error al cargar la lista de trámites';
        this.cargando = false;
      }
    });
  }

  consultar(): void {
    if (this.seguimientoForm.invalid) {
      return;
    }

    const codigo = this.seguimientoForm.value.codigo;
    this.cargando = true;
    this.error = null;
    this.tramites = [];
    this.exito = null;

    this.seguimientoService.buscarTramites(codigo).subscribe({
      next: (data) => {
        this.tramites = data;
        this.cargando = false;
        if (data.length === 0) {
          this.error = 'No se encontraron trámites con ese código';
        } else {
          this.exito = `Se encontraron ${data.length} trámite(s)`;
        }
      },
      error: (err) => {
        console.error('Error al buscar trámites:', err);
        this.error = 'Error al buscar trámites';
        this.cargando = false;
        this.tramites = [];
      }
    });
  }

  nuevaConsulta(): void {
    this.tramites = [];
    this.error = null;
    this.exito = null;
    this.seguimientoForm.reset();
  }

  // Método para formatear fechas en el template
  formatDate(date: string | Date | null | undefined): string {
    return this.seguimientoService.formatDate(date);
  }

  // Método para formatear el estado (similar a getEstadoFormateado de la proyección)
  formatEstado(estado: string): string {
    if (!estado) return 'Desconocido';
    const estadoLower = estado.toLowerCase();
    const estados: Record<string, string> = {
      'registrado': 'Registrado',
      'en_revision': 'En Revisión',
      'derivado': 'Derivado',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado',
      'observado': 'Observado',
      'finalizado': 'Finalizado',
      'pendiente': 'Pendiente',
      'cancelado': 'Cancelado',
      'revisado': 'Revisado',
      'programado': 'Programado'
    };
    return estados[estadoLower] || estado;
  }

   // Método para obtener la clase de badge según estado
   getBadgeClass(estado: string): string {
     if (!estado) return 'badge-secondary';
     const estadoLower = estado.toLowerCase();
     switch (estadoLower) {
       case 'aprobado':
       case 'finalizado':
         return 'badge-success';
       case 'rechazado':
       case 'cancelado':
         return 'badge-danger';
       case 'observado':
       case 'pendiente':
         return 'badge-warning';
       case 'en_revision':
       case 'derivado':
       case 'revisado':
       case 'programado':
         return 'badge-info';
       case 'registrado':
         return 'badge-primary';
       default:
         return 'badge-secondary';
     }
   }

   // ========== MÉTODOS PARA EL MODAL DE DETALLE ==========

   /**
    * Abre el modal de detalle para un trámite específico
    */
   verDetalle(tramite: TramiteListado): void {
     this.tramiteDetalle = null;
     this.mostrarDetalle = true;
     this.cargandoDetalle = true;

     this.seguimientoService.obtenerSeguimientoCompleto(tramite.codigoRUT).subscribe({
       next: (data) => {
         this.tramiteDetalle = data;
         this.cargandoDetalle = false;
         // Forzar detección de cambios para asegurar que el modal se actualice inmediatamente
         this.changeDetectorRef.detectChanges();
       },
       error: (err) => {
         console.error('Error al cargar detalle del trámite:', err);
         this.error = 'Error al cargar el detalle del trámite';
         this.cargandoDetalle = false;
         this.mostrarDetalle = false;
         this.changeDetectorRef.detectChanges();
       }
     });
   }

   /**
    * Cierra el modal de detalle
    */
   cerrarDetalle(): void {
     this.mostrarDetalle = false;
     this.tramiteDetalle = null;
   }

   /**
    * Obtiene el color de badge para una revisión
    */
   getColorRevision(estado: string): string {
     switch (estado) {
       case 'cumple':
         return 'success';
       case 'no_cumple':
         return 'danger';
       case 'pendiente':
         return 'warning';
       default:
         return 'secondary';
     }
   }

   /**
    * Obtiene el texto para una revisión
    */
   getTextoRevision(estado: string): string {
     switch (estado) {
       case 'cumple':
         return '✅ Cumple';
       case 'no_cumple':
         return '❌ No cumple';
       case 'pendiente':
         return '⏳ Pendiente';
       default:
         return estado;
     }
   }

   /**
    * Verifica si todas las revisiones están en estado pendiente
    */
   todasRevisionesPendientes(): boolean {
     if (!this.tramiteDetalle?.revisiones || this.tramiteDetalle.revisiones.length === 0) {
       return true;
     }
     return this.tramiteDetalle.revisiones.every(r => r.estadoCumplimiento === 'pendiente');
   }
 }