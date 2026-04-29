import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subject, from, forkJoin } from 'rxjs';
import { catchError, map, switchMap, takeUntil, concatMap, toArray } from 'rxjs/operators';
import { RequisitoTramiteRevisionService, RequisitoRevision } from '../../services/requisito-tramite-revision.service';
import { TramiteService } from '../../services/tramite.service';
import { HistorialTramiteService, HistorialTramite } from '../../services/historial-tramite.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { DocumentoTramiteService } from '../../services/documento-tramite.service';
import { TipoTramiteService } from '../../../configuracion/services/tipo-tramite.service';
import { RequisitoTUPACService } from '../../../configuracion/services/requisito-tupac.service';
import { FormatoService } from '../../../configuracion/services/formato.service';
import { RequisitoTUPACEnriquecido } from '../../models/requisito-tupac.model';
import { TipoTramiteEnriquecido } from '../../../configuracion/models/tipo-tramite.model';
import { InstanciaTramiteService } from '../../../configuracion/services/instancia-tramite.service';
import { InstanciaTramite } from '../../../configuracion/models/instancia-tramite.model';

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
  @Input() instanciaId?: number;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() tramiteFinalizado = new EventEmitter<void>();
  @Output() tramiteObservado = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  requisitos: RequisitoRevision[] = [];
  originalRequisitos: RequisitoRevision[] = [];
  cargando = false;
  error: string | null = null;
  success: string | null = null;
  filtroEstado: string = '';
  tramiteParaRevisar: any = null;
  instanciaEnEdicion = signal<InstanciaTramite | null>(null);

  historial: HistorialItem[] = [];
  
  // Estado para múltiples instancias
  instanciasCreadas: InstanciaTramite[] = [];
  
  // Estado para modal de ingreso de identificador
  mostrarPromptIdentificador = signal<boolean>(false);
  nuevoIdentificador = signal<string>('');

  // Tipo de trámite actual (para controlar botón Convertir)
  tipoTramiteActual: TipoTramiteEnriquecido | null = null;
   
  // Getters computados
  get hayInstanciaEnEdicion(): boolean {
    return this.instanciaEnEdicion() !== null;
  }
  
  get hayInstanciasGuardadas(): boolean {
    return this.instanciasCreadas.length > 0;
  }
  
  get puedeFinalizar(): boolean {
    // Puede finalizar solo si hay al menos una instancia guardada
    return this.hayInstanciasGuardadas;
  }

  get permiteConvertir(): boolean {
    // Solo permits crear expedientes (instancias) para trámites de inspección.
    // Ajustar según lógica de negocio: por ejemplo, código 'INSP' o id 7.
    const codigo = this.tipoTramiteActual?.codigo?.toUpperCase();
    return codigo === 'INSP' || this.tipoTramiteId === 7;
  }

  constructor(
    private revisionService: RequisitoTramiteRevisionService,
    private tramiteService: TramiteService,
    private historialService: HistorialTramiteService,
    private notificationService: NotificationService,
    private documentoTramiteService: DocumentoTramiteService,
    private tipoTramiteService: TipoTramiteService,
    private requisitoTUPACService: RequisitoTUPACService,
    private formatoService: FormatoService,
    private instanciaTramiteService: InstanciaTramiteService
  ) {}

   ngOnInit(): void {
     if (this.tramiteId) {
       // Si hay instanciaId (viene de fuera), cargarla y agregarla a instancias guardadas
       if (this.instanciaId) {
         this.instanciaTramiteService.obtener(this.instanciaId!).pipe(
           takeUntil(this.destroy$)
         ).subscribe({
           next: (inst: InstanciaTramite) => {
             this.instanciaEnEdicion.set(inst);
             this.instanciasCreadas.push(inst);
           },
           error: (err: any) => console.error('Error cargando instancia:', err)
         });
       }
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
      }),
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
      console.warn('[Revision] No hay tipoTramiteId');
      return of([]);
    }

     return this.tipoTramiteService.listarTodos().pipe(
       switchMap((tipos: TipoTramiteEnriquecido[]) => {
         const tipo = tipos.find(t => t.id === this.tipoTramiteId);
         if (!tipo || !tipo.tupacId) {
           console.warn('[Revision] Tipo no encontrado o sin tupacId', { tipoTramiteId: this.tipoTramiteId, tipos });
           return of([]);
         }
         // Asignar tipo actual para控制 de botón Convertir
         this.tipoTramiteActual = tipo;
         const tupacId = tipo.tupacId;
         console.log('[Revision] Tipo cargado:', { id: tipo.id, codigo: tipo.codigo, requisitosIds: tipo.requisitosIds, tupacId });

        const requisitosIdsSet = new Set<number>((tipo.requisitosIds as number[]) || []);
        console.log('[Revision] requisitosIdsSet size:', requisitosIdsSet.size);

         // Decidir fuente de documentos: priorizar instancia en edición si existe
         const instanciaIdParaConsulta = this.instanciaEnEdicion()?.idInstancia || this.instanciaId;
         const documentosSource: Observable<any[]> = instanciaIdParaConsulta != null
           ? this.revisionService.getProyeccionesPorInstancia(instanciaIdParaConsulta)
           : this.revisionService.getProyeccionesPorTramite(this.tramiteId);

        // Usar forkJoin para cargar ambos conjuntos de datos una vez
        return forkJoin({
          requisitosEnriquecidos: this.requisitoTUPACService.listarEnriquecidosPorTupac(tupacId),
          documentos: documentosSource
        }).pipe(
          map(({ requisitosEnriquecidos, documentos }) => {
            console.log('[Revision] requisitosEnriquecidos count:', requisitosEnriquecidos?.length || 0);

            let requisitosFiltrados: RequisitoTUPACEnriquecido[];
            if (requisitosIdsSet.size === 0) {
              console.log('[Revision] Usando todos los requisitos del TUPAC (fallback por array vacío)');
              requisitosFiltrados = requisitosEnriquecidos || [];
            } else {
              requisitosFiltrados = (requisitosEnriquecidos || []).filter(r => r.id && requisitosIdsSet.has(r.id));
              console.log('[Revision] Después de filtrar por IDs:', requisitosFiltrados.length, 'de', requisitosEnriquecidos?.length || 0);
              // Fallback secundario: si el filtro no encuentra ningún requisito, mostrar todos
              if (requisitosFiltrados.length === 0) {
                console.log('[Revision] No se encontraron requisitos que coincidan con los IDs; mostrando todos (fallback secundario)');
                requisitosFiltrados = requisitosEnriquecidos || [];
              }
            }

            const documentosMap = new Map<number, any>();
            (documentos || []).forEach(doc => {
              documentosMap.set(doc.requisitoId, doc);
            });

            const combinados: RequisitoRevision[] = requisitosFiltrados.map((req: RequisitoTUPACEnriquecido) => {
              const doc = documentosMap.get(req.id);
              if (doc) {
                return {
                  ...doc,
                  codigo: req.codigo,
                  descripcion: req.descripcion,
                  tipoDocumento: req.tipoDocumento,
                  obligatorio: req.obligatorio,
                  esExamen: req.esExamen,
                  requisitoNombre: doc.requisitoNombre || req.descripcion,
                  formatoId: req.formatoId,
                  formatoDescripcion: req.formatoDescripcion,
                  formatoArchivoRuta: req.formatoArchivoRuta
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
                observaciones: '',
                formatoId: req.formatoId,
                formatoDescripcion: req.formatoDescripcion,
                formatoArchivoRuta: req.formatoArchivoRuta
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
      }),
      catchError(err => {
        console.error('Error obteniendo tipos de trámite:', err);
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
     
     // Si hay una instancia en edición, incluirla en los documentos nuevos
     const instanciaParaAsociar = this.instanciaEnEdicion() ? 
       { idInstancia: this.instanciaEnEdicion()!.idInstancia } : undefined;

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
             operaciones.push(this.documentoTramiteService.update(req.id, { 
               observaciones: req.observaciones,
               // Si hay instancia, asegurar asociación
               ...(instanciaParaAsociar && { instanciaTramite: instanciaParaAsociar })
             }));
           }
         }
       } else {
         // Requisito sin documento previo: crear documento y luego aplicar estado
         const crearDoc$ = this.documentoTramiteService.create({
           tramiteId: this.tramiteId,
           requisitoId: req.requisitoId!,
           observaciones: req.observaciones || '',
           // Asociar a la instancia si existe
           ...(instanciaParaAsociar && { instanciaTramite: instanciaParaAsociar })
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
     // Si hay requisitos en edición, aplicar cambios
     if (this.requisitos.length > 0) {
       const operaciones = this.aplicarCambiosDocumentos();
       
       if (operaciones.length === 0) {
         this.finalizarObservacion();
         return;
       }
       
       from(operaciones).pipe(
         concatMap(op => op),
         toArray(),
         takeUntil(this.destroy$)
       ).subscribe({
         next: () => this.finalizarObservacion(),
         error: (err: any) => {
           console.error('Error al observar trámite:', err);
           this.notificationService.showError('Error al observar el trámite: ' + (err.message || 'Error desconocido'));
         }
       });
     } else {
       // No hay instancia en edición, solo finalizar
       this.finalizarObservacion();
     }
   }
   
   private finalizarObservacion(): void {
     // Si hay instancia en edición, guardarla en la lista
     if (this.instanciaEnEdicion()) {
       this.instanciasCreadas.push(this.instanciaEnEdicion()!);
       this.instanciaEnEdicion.set(null);
     }
     this.notificationService.showSuccess('Trámite observado exitosamente');
     this.tramiteObservado.emit();
     this.cerrar();
   }

   guardarYFinalizar(): void {
     // Si hay requisitos en edición, aplicar cambios
     if (this.requisitos.length > 0) {
       const operaciones = this.aplicarCambiosDocumentos();
       
       if (operaciones.length === 0) {
         this.finalizarRevision();
         return;
       }
       
       from(operaciones).pipe(
         concatMap(op => op),
         toArray(),
         takeUntil(this.destroy$)
       ).subscribe({
         next: () => this.finalizarRevision(),
         error: (err: any) => {
           console.error('Error al finalizar trámite:', err);
           this.notificationService.showError('Error al finalizar el trámite: ' + (err.message || 'Error desconocido'));
         }
       });
     } else {
       // No hay instancia en edición, solo finalizar
       this.finalizarRevision();
     }
   }
   
   private finalizarRevision(): void {
     // Si hay instancia en edición, guardarla en la lista
     if (this.instanciaEnEdicion()) {
       this.instanciasCreadas.push(this.instanciaEnEdicion()!);
       this.instanciaEnEdicion.set(null);
     }
     this.notificationService.showSuccess('Trámite revisado completamente exitosamente');
     this.tramiteFinalizado.emit();
     this.cerrar();
   }
   
   /**
    * Guarda la instancia actual y automáticamente prepara la siguiente
    */
   guardarInstanciaActual(): void {
     if (this.requisitos.length === 0) {
       this.notificationService.showWarning('No hay requisitos para guardar');
       return;
     }

     if (!this.instanciaEnEdicion()) {
       this.notificationService.showWarning('No hay instancia en edición. Cree una primero.');
       return;
     }

     const operaciones = this.aplicarCambiosDocumentos();

     if (operaciones.length === 0) {
       this.notificationService.showInfo('No hay cambios en los documentos para guardar');
       // Aún así avanzar a siguiente
       this.avanzarASiguienteInstancia();
       return;
     }

     from(operaciones).pipe(
       concatMap(op => op),
       toArray(),
       takeUntil(this.destroy$)
     ).subscribe({
       next: () => {
         // Guardar la instancia actual en la lista
         this.instanciasCreadas.push(this.instanciaEnEdicion()!);
         this.notificationService.showSuccess('Instancia guardada. Ingrese datos de la siguiente.');
         // Avanzar automáticamente a siguiente instancia
         this.avanzarASiguienteInstancia();
       },
       error: (err: any) => {
         console.error('Error guardando instancia:', err);
         this.notificationService.showError('Error al guardar instancia: ' + (err.message || 'Error desconocido'));
       }
     });
   }
   
   /**
    * Limpia la instancia actual y solicita el siguiente identificador
    */
   private avanzarASiguienteInstancia(): void {
     // Limpiar estado
     this.instanciaEnEdicion.set(null);
     this.requisitos = [];
     this.originalRequisitos = [];
     // Mostrar prompt para nueva placa (automáticamente)
     setTimeout(() => this.convertirAExpediente(), 300);
   }

  verFormato(requisito: RequisitoRevision): void {
    if (!requisito.formatoId) {
      this.error = 'Este requisito no tiene formato asociado';
      setTimeout(() => this.error = null, 3000);
      return;
    }

    this.formatoService.download(requisito.formatoId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          const a = document.createElement('a');
          a.href = url;
          const filename = requisito.formatoArchivoRuta ? (requisito.formatoArchivoRuta.split('/').pop() || 'formato.pdf') : 'formato.pdf';
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.success = 'Descarga iniciada';
          setTimeout(() => this.success = null, 2000);
        } else {
          this.success = 'Formato abierto en nueva ventana';
          setTimeout(() => this.success = null, 2000);
        }
      },
      error: (err: any) => {
        console.error('Error al ver formato:', err);
        this.error = 'Error al abrir el formato';
      }
    });
  }

  descargarFormato(requisito: RequisitoRevision): void {
    if (!requisito.formatoId) {
      this.error = 'Este requisito no tiene formato asociado';
      setTimeout(() => this.error = null, 3000);
      return;
    }

    this.formatoService.download(requisito.formatoId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = requisito.formatoArchivoRuta ? (requisito.formatoArchivoRuta.split('/').pop() || 'formato.pdf') : 'formato.pdf';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.success = 'Descarga iniciada';
        setTimeout(() => this.success = null, 2000);
      },
      error: (err: any) => {
        console.error('Error al descargar formato:', err);
        this.error = 'Error al descargar el formato';
      }
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }

   /**
    * Muestra el modal para ingresar el identificador del vehículo
    */
   convertirAExpediente(): void {
     this.mostrarPromptIdentificador.set(true);
     this.nuevoIdentificador.set('');
     // Enfocar el input después de que se renderice
     setTimeout(() => {
       const input = document.getElementById('identificador-input');
       if (input) input.focus();
     }, 100);
   }

   /**
    * Acepta el identificador y crea la instancia
    */
   aceptarPrompt(): void {
     const identificador = this.nuevoIdentificador().trim();
     if (!identificador) {
       this.notificationService?.showWarning('Ingrese un identificador válido');
       return;
     }
     this.mostrarPromptIdentificador.set(false);
     this.crearInstancia(identificador);
   }

   /**
    * Cancela el prompt
    */
   cancelarPrompt(): void {
     this.mostrarPromptIdentificador.set(false);
     this.nuevoIdentificador.set('');
   }

   /**
    * Crea una nueva instancia con el identificador dado
    */
   private crearInstancia(identificador: string): void {
     if (!this.tramiteId) {
       this.notificationService.showError('No se puede crear expediente sin trámite');
       return;
     }

     this.cargando = true;
     this.error = null;

     this.instanciaTramiteService.crear(this.tramiteId, {
       identificador,
       descripcion: ''
     }).pipe(
       takeUntil(this.destroy$)
     ).subscribe({
       next: (instancia: InstanciaTramite) => {
         this.notificationService.showSuccess(`Expediente creado para vehículo ${identificador}. Califique los documentos.`);
         // Establecer como instancia en edición
         this.instanciaEnEdicion.set(instancia);
         // Cargar los documentos de esta instancia recién creada
         this.cargarRequisitos();
         this.cargando = false;
       },
       error: (err: any) => {
         console.error('Error creando expediente:', err);
         this.error = 'Error al crear expediente: ' + (err.error?.message || err.message || 'Error desconocido');
         this.cargando = false;
         this.notificationService.showError(this.error);
       }
     });
   }
}
