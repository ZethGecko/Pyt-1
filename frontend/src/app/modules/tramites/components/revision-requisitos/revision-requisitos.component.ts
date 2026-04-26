import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, Observable, of, Subject, forkJoin } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { RequisitoTramiteRevisionService, RequisitoRevision } from '../../services/requisito-tramite-revision.service';
import { TramiteService } from '../../services/tramite.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-revision-requisitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-requisitos.component.html',
  styleUrls: ['./revision-requisitos.component.scss']
})
export class RevisionRequisitosComponent implements OnInit, OnDestroy {
  @Input() tramiteId!: number;
  @Input() tramiteCodigoRUT: string = '';
  @Input() tramiteTipoDescripcion: string = '';
  @Input() tipoTramiteId?: number;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() tramiteFinalizado = new EventEmitter<void>();
  @Output() tramiteObservado = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  requisitos: RequisitoRevision[] = [];
  originalRequisitos: RequisitoRevision[] = []; // Store initial state
  cargando = false;
  error: string | null = null;
  filtroEstado: string = '';

  constructor(
    private revisionService: RequisitoTramiteRevisionService,
    private tramiteService: TramiteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.tramiteId) {
      this.cargarRequisitos();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarRequisitos(): void {
    this.cargando = true;
    this.error = null;

    const carga$ = this.tipoTramiteId
      ? this.cargarDatosCombinados()
      : this.tramiteService.obtener(this.tramiteId).pipe(
          takeUntil(this.destroy$),
          switchMap((tramite: any) => {
            this.tipoTramiteId = tramite.tipoTramiteId;
            return this.cargarDatosCombinados();
          })
        );

    carga$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (requisitos: any[]) => {
        this.requisitos = requisitos as RequisitoRevision[];
        this.originalRequisitos = JSON.parse(JSON.stringify(this.requisitos));
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error en cargarRequisitos:', err);
        this.error = 'Error al cargar los requisitos del trámite';
        this.cargando = false;
      }
    });
  }

  private cargarDatosCombinados(): Observable<RequisitoRevision[]> {
    if (!this.tipoTramiteId) {
      return of([]);
    }

    return combineLatest([
      this.tramiteService.obtenerRequisitos(this.tipoTramiteId),
      this.revisionService.getProyeccionesPorTramite(this.tramiteId)
    ]).pipe(
      takeUntil(this.destroy$),
      map(([requisitosTUPAC = [], documentos = []]) => {
         const documentosMap = new Map<number, RequisitoRevision>();
        documentos.forEach(doc => {
          documentosMap.set(doc.requisitoId, doc);
        });

        const combinados: RequisitoRevision[] = requisitosTUPAC.map((req: any) => {
          const doc = documentosMap.get(req.id);
          if (doc) {
            return {
              ...doc,
              codigo: req.codigo,
              descripcion: req.descripcion,
              tipoDocumento: req.tipoDocumento,
              obligatorio: req.obligatorio,
              esExamen: req.esExamen,
              requisitoNombre: doc.requisitoNombre || req.descripcion
            };
          }
           return {
             id: 0,
             tramiteId: this.tramiteId,
             requisitoId: req.id,
             estado: 'PENDIENTE',
             obligatorio: req.obligatorio,
             requisitoNombre: req.descripcion,
             codigo: req.codigo,
             descripcion: req.descripcion,
             tipoDocumento: req.tipoDocumento,
             esExamen: req.esExamen,
             estadoFormateado: 'Pendiente',
             colorEstado: 'warning',
             iconoEstado: '📄',
             observaciones: ''
           };
        });
        return combinados.sort((a, b) => {
          const orden = ['PENDIENTE', 'OBSERVADO', 'APROBADO', 'REPROBADO'];
          return orden.indexOf(a.estado) - orden.indexOf(b.estado);
        });
      }),
      catchError(err => {
        console.error('Error cargando datos combinados:', err);
        return of([]);
      })
    );
  }

  get requisitosFiltrados(): RequisitoRevision[] {
    if (!this.filtroEstado) {
      return this.requisitos;
    }
    return this.requisitos.filter(r => r.estado === this.filtroEstado);
  }

  aprobarRequisito(requisito: RequisitoRevision): void {
    if (requisito.id === 0) {
      this.notificationService.showWarning('No se puede aprobar un requisito sin documento asociado');
      return;
    }
    requisito.estado = 'APROBADO';
  }

  reprobarRequisito(requisito: RequisitoRevision): void {
    if (requisito.id === 0) {
      this.notificationService.showWarning('No se puede reprobar un requisito sin documento asociado');
      return;
    }
    requisito.estado = 'REPROBADO';
  }

  observarRequisito(requisito: RequisitoRevision): void {
    if (requisito.id === 0) {
      this.notificationService.showWarning('No se puede observar un requisito sin documento asociado');
      return;
    }
    requisito.estado = 'OBSERVADO';
  }

   puedeEditarRequisito(requisito: RequisitoRevision): boolean {
     // Mostrar botones para todos los requisitos, aunque no tengan documento.
     // La validación de id > 0 se maneja en los métodos de acción con notificación.
     return true;
   }

  getColorEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'reprobado': return 'bg-red-100 text-red-800';
      case 'observado': return 'bg-yellow-100 text-yellow-800';
      case 'pendiente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getIconoEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobado': return '✅';
      case 'reprobado': return '❌';
      case 'observado': return '⚠️';
      case 'pendiente': return '⏳';
      default: return '📄';
    }
  }

  get todosAprobados(): boolean {
    if (this.requisitos.length === 0) return false;
    const requisitosConDocumento = this.requisitos.filter(r => r.id > 0);
    if (requisitosConDocumento.length === 0) return false;
    return requisitosConDocumento.every(r => r.estado === 'APROBADO');
  }

  get hayRechazados(): boolean {
    return this.requisitos.some(r => r.estado === 'REPROBADO');
  }

  get hayObservados(): boolean {
    return this.requisitos.some(r => r.estado === 'OBSERVADO');
  }

  get totalRequisitos(): number {
    return this.requisitos.length;
  }

  get aprobadosCount(): number {
    return this.requisitos.filter(r => r.estado === 'APROBADO').length;
  }

  get observadosCount(): number {
    return this.requisitos.filter(r => r.estado === 'OBSERVADO').length;
  }

  get rechazadosCount(): number {
    return this.requisitos.filter(r => r.estado === 'REPROBADO').length;
  }

  private aplicarCambiosDocumentos(): Observable<any>[] {
    const operaciones: Observable<any>[] = [];
    for (const req of this.requisitos) {
      const original = this.originalRequisitos.find(r => r.id === req.id);
      if (!original) continue;
      if (req.id === 0) continue; // Skip requisitos sin documento
      // Si hubo cambios en estado u observaciones
      if (req.estado !== original.estado || req.observaciones !== original.observaciones) {
        if (req.estado === 'APROBADO') {
          operaciones.push(this.revisionService.aprobarDocumento(req.id, { notasRevision: req.observaciones || undefined }));
        } else if (req.estado === 'OBSERVADO') {
          operaciones.push(this.revisionService.observarDocumento(req.id, { observaciones: req.observaciones || '' }));
        } else if (req.estado === 'REPROBADO') {
          operaciones.push(this.revisionService.reprobarDocumento(req.id, { motivo: req.observaciones || '' }));
        }
        // Para otros estados no se envían cambios (no hay endpoint)
      }
    }
    return operaciones;
  }

  guardarYFinalizar(): void {
    if (!this.todosAprobados) {
      this.notificationService.showWarning('No se puede finalizar: todos los requisitos deben estar aprobados');
      return;
    }

    if (!confirm('¿Está seguro de finalizar este trámite? Todos los requisitos están aprobados.')) {
      return;
    }

    const cambios = this.aplicarCambiosDocumentos();
    if (cambios.length > 0) {
      forkJoin(cambios).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.tramiteService.aprobar(this.tramiteId).pipe(
            takeUntil(this.destroy$)
          ).subscribe({
            next: () => {
              this.notificationService.showSuccess('Trámite finalizado exitosamente');
              this.tramiteFinalizado.emit();
              this.cerrarModal.emit();
            },
            error: (err) => {
              this.notificationService.showError('Error al finalizar el trámite');
            }
          });
        },
        error: (err) => {
          this.notificationService.showError('Error al actualizar los requisitos');
        }
      });
    } else {
      this.tramiteService.aprobar(this.tramiteId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Trámite finalizado exitosamente');
          this.tramiteFinalizado.emit();
          this.cerrarModal.emit();
        },
        error: (err) => {
          this.notificationService.showError('Error al finalizar el trámite');
        }
      });
    }
  }

  guardarYObservar(): void {
    const motivo = prompt('Ingrese el motivo por el cual el trámite queda en observación:');
    if (!motivo) return;

    const cambios = this.aplicarCambiosDocumentos();
    if (cambios.length > 0) {
      forkJoin(cambios).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.tramiteService.observar(this.tramiteId, motivo).pipe(
            takeUntil(this.destroy$)
          ).subscribe({
            next: () => {
              this.notificationService.showSuccess('Trámite enviado a observación');
              this.tramiteObservado.emit();
              this.cerrarModal.emit();
            },
            error: (err) => {
              this.notificationService.showError('Error al observar el trámite');
            }
          });
        },
        error: (err) => {
          this.notificationService.showError('Error al actualizar los requisitos');
        }
      });
    } else {
      this.tramiteService.observar(this.tramiteId, motivo).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Trámite enviado a observación');
          this.tramiteObservado.emit();
          this.cerrarModal.emit();
        },
        error: (err) => {
          this.notificationService.showError('Error al observar el trámite');
        }
      });
    }
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}
