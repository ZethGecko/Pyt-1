import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SeguimientoService, TramiteListado, SeguimientoCompleto } from '../../services/seguimiento.service';
import { Subject } from 'rxjs';
import { ImagenSitioService, ImagenSitio } from '../../../shared/services/imagen-sitio.service';
import { PublicNavbarComponent } from '../../../public/components/public-navbar/public-navbar.component';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PublicNavbarComponent],
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

    // Instancias
    instancias: Array<{ idInstancia: string; identificador: string; estado: string; fechaCreacion: string }> = [];
    instanciaSeleccionadaId: string | null = null;
    errorInstancia: string | null = null;
    filtroInstancia: string = ''; // <-- filtro para buscar instancias

   // Destroy subject para limpiar subscriptions
   private destroy$ = new Subject<void>();
   private seguimientoSubscription: any = null;

  // Imágenes del sitio
  imagenes: Map<string, ImagenSitio> = new Map();

  constructor(
    private fb: FormBuilder,
    private seguimientoService: SeguimientoService,
    private changeDetectorRef: ChangeDetectorRef,
    private imagenSitioService: ImagenSitioService,
    private router: Router
  ) {
    this.seguimientoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Cargar imágenes del sitio
    this.imagenSitioService.listarTodas().subscribe({
      next: (data) => {
        this.imagenes.clear();
        data.forEach(img => {
          const downloadUrl = `/api/imagenes-sitio/${img.id}/download`;
          this.imagenes.set(img.ubicacion, { ...img, url: downloadUrl });
        });
      },
      error: (err) => console.error('Error cargando imágenes:', err)
    });
  }

   ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
     if (this.seguimientoSubscription) {
       this.seguimientoSubscription.unsubscribe();
     }
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

  // Método para retroceder
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Método para formatear fechas en el template
  formatDate(date: string | Date | null | undefined): string {
    return this.seguimientoService.formatDate(date);
  }

  // Método para formatear el estado
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
     this.instancias = [];
     this.instanciaSeleccionadaId = null;
     this.errorInstancia = null;

     // Cancelar suscripción anterior
     if (this.seguimientoSubscription) {
       this.seguimientoSubscription.unsubscribe();
     }

     this.seguimientoService.obtenerSeguimientoCompleto(tramite.codigoRUT).subscribe({
       next: (data) => {
         this.tramiteDetalle = data;
         this.instancias = data.instancias || [];
         this.instanciaSeleccionadaId = data.instanciaSeleccionadaId != null ? String(data.instanciaSeleccionadaId) : null;
         this.cargandoDetalle = false;
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
     * Cambia a una instancia específica del trámite
     */
    cambiarInstancia(instanciaId: string): void {
      console.log('[Seguimiento] Cambiando a instancia:', instanciaId);
      this.instanciaSeleccionadaId = instanciaId;
      this.errorInstancia = null;
      this.cargarDatosInstancia(instanciaId);
    }

    /**
     * Recarga los datos de la instancia actualmente seleccionada
     */
    recargarDatosInstancia(): void {
      const instanciaId = this.instanciaSeleccionadaId;
      if (instanciaId) {
        this.cargarDatosInstancia(instanciaId);
      } else {
        console.warn('[Seguimiento] No hay instancia seleccionada, recargando datos por defecto');
        this.cargarDatosInstanciaDefault();
      }
    }

    /**
     * Método privado para cargar datos de una instancia
     */
    private cargarDatosInstancia(instanciaId: string): void {
      console.log('[Frontend] >>> cargarDatosInstancia llamada. instanciaId:', instanciaId);
      console.log('[Frontend] tramiteDetalle presente?', !!this.tramiteDetalle);
      if (!this.tramiteDetalle) {
        console.warn('[Frontend] tramiteDetalle es null, abortando carga de instancia');
        return;
      }
      const codigoRUT = this.tramiteDetalle.tramite?.codigoRut; // <-- corregido: codigoRut (no codigoRUT)
      console.log('[Frontend] codigoRut extraído:', codigoRUT);
      if (!codigoRUT) {
        console.warn('[Frontend] No hay codigoRut, abortando');
        return;
      }

      this.cargandoDetalle = true;

      // Cancelar petición anterior si existe
      if (this.seguimientoSubscription) {
        this.seguimientoSubscription.unsubscribe();
      }

      console.log('[Frontend] Ejecutando obtenerSeguimientoCompleto con instanciaId:', instanciaId);
      this.seguimientoSubscription = this.seguimientoService.obtenerSeguimientoCompleto(codigoRUT, instanciaId).subscribe({
        next: (data) => {
          console.log('[Frontend] <<< Datos recibidos para instancia', instanciaId, ':', data);
          this.tramiteDetalle = data;
          this.instanciaSeleccionadaId = data.instanciaSeleccionadaId?.toString() || instanciaId;
          this.cargandoDetalle = false;
        },
        error: (err) => {
          console.error('[Frontend] Error al cargar instancia', instanciaId, ':', err);
          this.errorInstancia = 'Error al cargar datos de la instancia: ' + (err.message || 'Error desconocido');
          this.cargandoDetalle = false;
          this.cargarDatosInstanciaDefault();
        }
      });
    }

    private cargarDatosInstanciaDefault(): void {
      if (!this.tramiteDetalle) return;
      const codigoRUT = this.tramiteDetalle.tramite?.codigoRut; // <-- corregido
      if (!codigoRUT) return;
     this.cargandoDetalle = true;

     if (this.seguimientoSubscription) {
       this.seguimientoSubscription.unsubscribe();
     }

     this.seguimientoSubscription = this.seguimientoService.obtenerSeguimientoCompleto(codigoRUT).subscribe({
       next: (data) => {
         this.tramiteDetalle = data;
         this.instancias = data.instancias || [];
         this.instanciaSeleccionadaId = data.instanciaSeleccionadaId != null ? String(data.instanciaSeleccionadaId) : null;
         this.cargandoDetalle = false;
         this.changeDetectorRef.detectChanges();
       },
       error: (err) => {
         console.error('Error al cargar datos por defecto:', err);
         this.cargandoDetalle = false;
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
   * Verifica si todas las revisiones están en estado pendiente o en progreso (no finalizadas)
   */
  todasRevisionesPendientes(): boolean {
    if (!this.tramiteDetalle?.revisiones || this.tramiteDetalle.revisiones.length === 0) {
      return true;
    }
    const estadosPendientes = ['PENDIENTE', 'PRESENTADO', 'EN_REVISION'];
    return this.tramiteDetalle.revisiones.every(r => estadosPendientes.includes(r.estado));
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
   * Returns unified status for a requirement, using inscription data for exams
   */
  getEstadoUnificado(rev: any): string {
    const codigo = rev.codigo?.toUpperCase() || '';
    const esExamen = codigo.startsWith('EXAMEN_');

    if (esExamen && this.tramiteDetalle?.inscripciones) {
      const inscripcion = this.tramiteDetalle.inscripciones.find((ins: any) => {
        const codigoExamen = ins.grupoPresentacion?.requisitoExamen?.codigo?.toUpperCase() || '';
        return codigoExamen === codigo;
      });

      if (inscripcion) {
        return inscripcion.estado || 'PENDIENTE';
      }
    }

    return rev.estadoFormateado || 'Pendiente';
  }

  /**
   * Returns badge class for unified status
   */
  getBadgeClassUnificado(estado: string): string {
    return this.getBadgeClass(estado);
  }

  /**
   * Checks if a requirement is an exam
   */
  esExamen(codigo: string): boolean {
    return codigo?.toUpperCase().startsWith('EXAMEN_') || false;
  }

  /**
   * Gets inscription by exam code
   */
  getInscripcionPorCodigo(codigo: string): any {
    if (!this.tramiteDetalle?.inscripciones) return null;
    return this.tramiteDetalle.inscripciones.find((ins: any) => {
      const codigoExamen = ins.grupoPresentacion?.requisitoExamen?.codigo || '';
      return codigoExamen?.toUpperCase() === codigo?.toUpperCase();
    }) || null;
  }

  // ========== IMÁGENES DEL SITIO ==========

  cargarImagenes(): void {
    this.imagenSitioService.listarTodas().subscribe({
      next: (data) => {
        this.imagenes.clear();
        data.forEach(img => {
          const downloadUrl = `/api/imagenes-sitio/${img.id}/download`;
          this.imagenes.set(img.ubicacion, { ...img, url: downloadUrl });
        });
      },
      error: (err) => console.error('Error cargando imágenes:', err)
    });
  }

  getImagenUrl(ubicacion: string): string | null {
    return this.imagenes.get(ubicacion)?.url || null;
  }

  tieneImagen(ubicacion: string): boolean {
    return !!this.imagenes.get(ubicacion);
  }
}
