 import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormsModule } from '@angular/forms';
import { combineLatest, Observable, of, Subject, forkJoin, from } from 'rxjs';
import { catchError, map, switchMap, takeUntil, concatMap, toArray } from 'rxjs/operators';
 import { RequisitoTramiteRevisionService, RequisitoRevision } from '../../services/requisito-tramite-revision.service';
 import { TramiteService } from '../../services/tramite.service';
 import { HistorialTramiteService, HistorialTramite } from '../../services/historial-tramite.service';
 import { NotificationService } from '../../../../shared/services/notification.service';
 import { DocumentoTramiteService } from '../../services/documento-tramite.service';

interface HistorialItem {
  accion: string;
  fecha: string;
  usuario: string;
  observacion?: string;
  etapaNombre?: string;
}

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
   tramiteParaRevisar: any = null;

   historial: HistorialItem[] = [];

   constructor(
     private revisionService: RequisitoTramiteRevisionService,
     private tramiteService: TramiteService,
     private historialService: HistorialTramiteService,
     private notificationService: NotificationService,
     private documentoTramiteService: DocumentoTramiteService
   ) {}

  ngOnInit(): void {
    if (this.tramiteId) {
      this.cargarRequisitos();
      this.cargarHistorial();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   cargarRequisitos(): void {
     this.cargando = true;
     this.error = null;

     // Always fetch tramite data first for the header
     this.tramiteService.obtener(this.tramiteId).pipe(
       takeUntil(this.destroy$),
       switchMap((tramite: any) => {
         this.tramiteParaRevisar = tramite;
         this.tipoTramiteId = tramite.tipoTramiteId || this.tipoTramiteId;
         return this.cargarDatosCombinados();
       })
     ).pipe(
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

   cargarHistorial(): void {
     this.historialService.getByTramite(this.tramiteId).pipe(
       takeUntil(this.destroy$),
       map((historial: HistorialTramite[]) => {
         return historial.map((h: HistorialTramite) => ({
           accion: h.accion,
           fecha: new Date(h.fechaAccion).toLocaleString('es-PE', {
             day: '2-digit',
             month: 'short',
             year: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
           }),
           usuario: h.usuarioAccion?.nombre || h.usuarioAccionId?.toString() || 'Sistema',
           observacion: h.observacion,
           etapaNombre: h.departamentoOrigen?.nombre || h.departamentoOrigenId?.toString()
         })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
       }),
       catchError(err => {
         console.error('Error cargando historial:', err);
         return of([]);
       })
     ).subscribe({
       next: (historialFormateado: HistorialItem[]) => {
         this.historial = historialFormateado;
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
     let resultado = this.requisitos.filter(r => {
       if (this.filtroEstado && r.estado !== this.filtroEstado) return false;
       return true;
     });
     // Filtrar: solo mostrar requisitos que NO sean exámenes
     resultado = resultado.filter(r => !r.esExamen);
     return resultado;
   }

   aprobarRequisito(requisito: RequisitoRevision): void {
     requisito.estado = 'APROBADO';
   }

   reprobarRequisito(requisito: RequisitoRevision): void {
     requisito.estado = 'REPROBADO';
   }

   observarRequisito(requisito: RequisitoRevision): void {
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

  getTimelineColor(accion: string): string {
    const acc = accion.toLowerCase();
    if (['aprobar', 'aprobado', 'finalizar', 'finalizado'].includes(acc)) return 'timeline-marker-success';
    if (['reprobar', 'reprobado', 'rechazar', 'rechazado'].includes(acc)) return 'timeline-marker-danger';
    if (['observar', 'observado'].includes(acc)) return 'timeline-marker-warning';
    if (['derivar', 'derivado'].includes(acc)) return 'timeline-marker-info';
    return 'timeline-marker-default';
  }

   get todosAprobados(): boolean {
      // Solo considerar requisitos que NO sean exámenes
      const requisitosNoExamenes = this.requisitos.filter(r => !r.esExamen);
      if (requisitosNoExamenes.length === 0) return false;
      return requisitosNoExamenes.every(r => r.estado === 'APROBADO');
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

   // Getters para estadísticas
   get aprobadosCount(): number {
     return this.requisitos.filter(r => r.estado === 'APROBADO').length;
   }

   get observadosCount(): number {
     return this.requisitos.filter(r => r.estado === 'OBSERVADO').length;
   }

   get rechazadosCount(): number {
     return this.requisitos.filter(r => r.estado === 'REPROBADO').length;
   }

   get pendientesCount(): number {
     return this.requisitos.filter(r => r.estado === 'PENDIENTE').length;
   }

   get progresoPorcentaje(): number {
     if (this.requisitos.length === 0) return 0;
     const conDocumento = this.requisitos.filter(r => r.id > 0);
     if (conDocumento.length === 0) return 0;
     const aprobados = this.aprobadosCount;
     return Math.round((aprobados / conDocumento.length) * 100);
   }

    private aplicarCambiosDocumentos(): Observable<any>[] {
     const operaciones: Observable<any>[] = [];

     for (const req of this.requisitos) {
       const original = this.originalRequisitos.find(r => r.id === req.id);

       // Detectar cambios en estado u observaciones
       const cambiosEnEstado = !original || req.estado !== original.estado;
       const cambiosEnObservaciones = !original || req.observaciones !== original.observaciones;

       if (!cambiosEnEstado && !cambiosEnObservaciones) continue;

       if (req.id && req.id > 0) {
         // Documento existente: actualizar según el estado
         if (req.estado === 'APROBADO') {
           operaciones.push(this.revisionService.aprobarDocumento(req.id, { notasRevision: req.observaciones || undefined }));
         } else if (req.estado === 'OBSERVADO') {
           operaciones.push(this.revisionService.observarDocumento(req.id, { observaciones: req.observaciones || '' }));
         } else if (req.estado === 'REPROBADO') {
           operaciones.push(this.revisionService.reprobarDocumento(req.id, { motivo: req.observaciones || '' }));
         } else {
           // Para otros estados (ej. PENDIENTE), actualizar observaciones si hay cambios
           if (cambiosEnObservaciones) {
             operaciones.push(this.documentoTramiteService.update(req.id, { observaciones: req.observaciones }));
           }
         }
       } else {
         // Requisito sin documento previo: crear documento y luego aplicar estado
         // Nota: el id será asignado después de la creación
          const crearDoc$ = this.documentoTramiteService.create({
            tramiteId: this.tramiteId,
            requisitoId: req.requisitoId!,
            observaciones: req.observaciones || ''
          }).pipe(
           switchMap((doc: any) => {
             const nuevoId = doc?.id;
             if (!nuevoId) {
               throw new Error('No se recibió ID del documento creado');
             }
             // Aplicar estado según corresponda
             if (req.estado === 'APROBADO') {
               return this.revisionService.aprobarDocumento(nuevoId, { notasRevision: req.observaciones || undefined });
             } else if (req.estado === 'OBSERVADO') {
               return this.revisionService.observarDocumento(nuevoId, { observaciones: req.observaciones || '' });
             } else if (req.estado === 'REPROBADO') {
               return this.revisionService.reprobarDocumento(nuevoId, { motivo: req.observaciones || '' });
             } else {
               // Solo crear el documento sin cambiar estado
               return of({ id: nuevoId });
             }
           })
         );
         operaciones.push(crearDoc$);
       }
     }

      return operaciones;
    }

    guardarYObservar(): void {
      if (this.requisitos.length === 0) return;

      const operaciones = this.aplicarCambiosDocumentos();

      if (operaciones.length === 0) {
        alert('No hay cambios para guardar');
        return;
      }

      // Ejecutar secuencialmente para evitar problemas de concurrencia en el estado del trámite
      from(operaciones).pipe(
        concatMap(op => op),
        toArray(),
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          alert('Trámite observado exitosamente');
          this.tramiteObservado.emit();
          this.cerrar();
        },
        error: (err) => {
          console.error('Error al observar trámite:', err);
          alert('Error al observar el trámite: ' + (err.message || 'Error desconocido'));
        }
      });
    }

    guardarYFinalizar(): void {
      if (this.requisitos.length === 0) return;

      const operaciones = this.aplicarCambiosDocumentos();

      if (operaciones.length === 0) {
        alert('No hay cambios para guardar');
        return;
      }

      // Ejecutar secuencialmente para evitar problemas de concurrencia en el estado del trámite
      from(operaciones).pipe(
        concatMap(op => op),
        toArray(),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (results) => {
          alert('Trámite revisado completamente exitosamente');
          this.tramiteFinalizado.emit();
          this.cerrar();
        },
        error: (err) => {
          console.error('Error al finalizar trámite:', err);
          alert('Error al finalizar el trámite: ' + (err.message || 'Error desconocido'));
        }
      });
    }

    cerrar(): void {
      this.cerrarModal.emit();
    }
}
