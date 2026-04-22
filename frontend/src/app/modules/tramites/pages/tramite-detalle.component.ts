import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { TramiteService } from '../services/tramite.service';
import { DocumentoTramiteService } from '../services/documento-tramite.service';
import { SeguimientoTramiteService } from '../services/seguimiento-tramite.service';
import { TramiteEnriquecido } from '../models/tramite.model';
import { DocumentoTramite } from '../models/documento-tramite.model';
import { RequisitoTUPACService } from '../services/requisito-tupac.service';
import { RequisitoTUPAC } from '../models/requisito-tupac.model';
import { TimelineItem } from '../models/seguimiento-tramite.model';
import { TramiteFormModalComponent } from '../components/tramite-form-modal/tramite-form-modal.component';
import { RequisitoTramiteRevisionService } from '../services/requisito-tramite-revision.service';
import { RequisitoRevision } from '../services/requisito-tramite-revision.service';

// Interfaz simple para datos de ejemplo
interface DocumentoSimple {
  id: number;
  nombre: string;
  estado: string;
  observacion?: string;
}

// Interfaz para proyección de exámenes
interface ExamenProyeccion {
  id: number;
  requisitoId: number;
  requisitoCodigo: string;
  requisitoNombre: string;
  estado: string;
  grupoId?: number;
  grupoNombre?: string;
  grupoFecha?: string;
  grupoHora?: string;
  fechaPresentacion?: string;
  fechaRevision?: string;
  usuarioAsignadoNombre?: string;
  observaciones?: string;
}

@Component({
  selector: 'app-tramite-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, TramiteFormModalComponent],
  templateUrl: './tramite-detalle.component.html',
  styleUrls: ['./tramite-detalle.component.scss']
})
export class TramiteDetalleComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tramiteId: number | null = null;
  @Output() cerrar = new EventEmitter<void>();

  // Datos del trámite
  tramite: TramiteEnriquecido | null = null;
  documentos: DocumentoTramite[] = [];
  documentosFallback: DocumentoSimple[] = [];
  seguimientoItems: TimelineItem[] = [];
  examenes: ExamenProyeccion[] = [];
  requisitosRevisados: RequisitoRevision[] = [];

  // Estado de carga
  cargando = false;
  cargandoDocumentos = false;
  cargandoRequisitos = false;
  error: string | null = null;

  // Pestaña activa
  tabActiva = 'informacion';

  // Permisos
  puedeCrearDocumento = true;
  puedePresentarCualquierDocumento = true;
  puedeAprobarCualquierDocumento = true;
  puedeRechazarCualquierDocumento = true;
  puedeObservarCualquierDocumento = true;
  puedeEliminarCualquierDocumento = false;

   // Modal de documentos
   mostrandoModalDocumento = false;
   modoEdicionDocumento = false;
   documentoEditandoId?: number;
   requisitosDisponibles: RequisitoTUPAC[] = [];
   nuevoDocumento: {
     requisitoId?: number;
     archivo?: File;
     observaciones?: string;
   } = {};
  erroresForm: any = {};
  aceptarTiposArchivo = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

  // Modal de edición de trámite
  mostrandoModalTramite = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tramiteService: TramiteService,
    private documentoService: DocumentoTramiteService,
    private seguimientoService: SeguimientoTramiteService,
    private requisitoService: RequisitoTUPACService,
    private revisionService: RequisitoTramiteRevisionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idParam = params['id'];
      if (idParam) {
        const tramiteId = parseInt(idParam);
        if (!isNaN(tramiteId)) {
          this.tramiteId = tramiteId;
          this.cargarTramite();
        }
      }
    });

    const idSnapshot = this.route.snapshot.params['id'];
    if (idSnapshot && !this.tramiteId) {
      const tramiteId = parseInt(idSnapshot);
      if (!isNaN(tramiteId)) {
        this.tramiteId = tramiteId;
        this.cargarTramite();
      }
    }

    this.cargarRequisitosDisponibles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tramiteId'] && this.tramiteId) {
      this.cargarTramite();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTramite(): void {
    if (!this.tramiteId) return;

    this.cargando = true;
    this.error = null;

    this.tramiteService.obtener(this.tramiteId).subscribe({
      next: (data) => {
        this.tramite = data;
        this.cargarDocumentos();
        this.cargarSeguimiento();
        this.cargarExamenes();
        this.cargarRequisitosRevisados();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el trámite: ' + (err.message || 'Error desconocido');
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarDocumentos(): void {
    if (!this.tramiteId) return;

    this.cargandoDocumentos = true;
    this.documentoService.listarPorTramite(this.tramiteId).subscribe({
      next: (docs) => {
        this.documentos = docs;
        this.cargandoDocumentos = false;
      },
      error: (err) => {
        console.error('Error cargando documentos:', err);
        this.cargandoDocumentos = false;
        this.documentos = [];
      }
    });
  }

  cargarSeguimiento(): void {
    if (!this.tramiteId) return;

    this.seguimientoService.listarPorTramite(this.tramiteId).subscribe({
      next: (seguimientos) => {
        this.seguimientoItems = this.seguimientoService.convertirATimeline(seguimientos);
      },
      error: (err) => {
        console.error('Error cargando seguimiento:', err);
        this.seguimientoItems = [
          { id: 1, title: 'Registro', date: new Date(), status: 'completed' as const },
          { id: 2, title: 'Revisión de Documentos', date: new Date(), status: 'current' as const }
        ];
      }
    });
  }

  cargarExamenes(): void {
    if (!this.tramiteId) return;

    this.documentoService.obtenerExamenesPorTramite(this.tramiteId).subscribe({
      next: (examenes: ExamenProyeccion[]) => {
        this.examenes = examenes;
      },
      error: (err: any) => {
        console.error('Error cargando exámenes:', err);
        this.examenes = [];
      }
    });
  }

  cargarRequisitosDisponibles(): void {
    if (!this.tramite?.tipoTramiteCodigo) {
      console.warn('No se puede cargar requisitos: tipoTramiteCodigo no disponible');
      return;
    }

    this.requisitoService.listarQueAplicanParaTipoTramite(this.tramite.tipoTramiteCodigo).subscribe({
      next: (requisitos) => {
        this.requisitosDisponibles = requisitos.filter(r => r.activo);
      },
      error: (err) => {
        console.error('Error cargando requisitos TUPA:', err);
        this.requisitoService.listarActivos().subscribe({
          next: (requisitos) => {
            this.requisitosDisponibles = requisitos;
          },
          error: (e) => {
            console.error('Error cargando requisitos activos:', e);
            this.requisitosDisponibles = [];
          }
        });
      }
    });
  }

  cargarRequisitosRevisados(): void {
    if (!this.tramiteId || !this.tramite?.tipoTramiteId) {
      this.requisitosRevisados = [];
      return;
    }

    this.cargandoRequisitos = true;

    combineLatest<[any[], RequisitoRevision[]]>([
      this.tramiteService.obtenerRequisitosAsociadosATipoTramite(this.tramite.tipoTramiteId),
      this.revisionService.getProyeccionesPorTramite(this.tramiteId)
    ]).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error cargando requisitos revisados:', err);
        return of([] as any);
      })
    ).subscribe({
      next: ([requisitosTUPAC, documentos]) => {
        const documentosMap = new Map<number, RequisitoRevision>();
        documentos.forEach((doc: RequisitoRevision) => {
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
              obligatorio: req.obligatorio
            };
          }
          return {
            id: 0,
            tramiteId: this.tramiteId,
            requisitoId: req.id,
            requisitoNombre: req.descripcion,
            codigo: req.codigo,
            descripcion: req.descripcion,
            tipoDocumento: req.tipoDocumento,
            obligatorio: req.obligatorio,
            esExamen: req.esExamen,
            estado: 'PENDIENTE',
            estadoFormateado: 'Pendiente',
            colorEstado: 'warning'
          };
        });

        this.requisitosRevisados = combinados.sort((a, b) => {
          const orden = ['PENDIENTE', 'PRESENTADO', 'EN_REVISION', 'OBSERVADO', 'APROBADO', 'REPROBADO'];
          return orden.indexOf(a.estado) - orden.indexOf(b.estado);
        });
        this.cargandoRequisitos = false;
      },
      error: () => {
        this.cargandoRequisitos = false;
        this.requisitosRevisados = [];
      }
    });
  }

  cerrarDetalle(): void {
    this.router.navigate(['/tramites']);
  }

  // ========== ACCIONES DE TRÁMITE ==========

  aprobarTramite(): void {
    if (!this.tramiteId) return;
    if (confirm('¿Está seguro de aprobar este trámite?')) {
      this.tramiteService.aprobar(this.tramiteId, 'Aprobado').subscribe({
        next: () => {
          this.cargarTramite();
          alert('Trámite aprobado exitosamente');
        },
        error: (err) => {
          alert('Error al aprobar: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  rechazarTramite(): void {
    if (!this.tramiteId) return;
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (motivo) {
      this.tramiteService.rechazar(this.tramiteId, motivo).subscribe({
        next: () => {
          this.cargarTramite();
          alert('Trámite rechazado');
        },
        error: (err) => {
          alert('Error al rechazar: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  observarTramite(): void {
    if (!this.tramiteId) return;
    const observaciones = prompt('Ingrese las observaciones:');
    if (observaciones) {
      this.tramiteService.observar(this.tramiteId, observaciones).subscribe({
        next: () => {
          this.cargarTramite();
          alert('Observación registrada');
        },
        error: (err) => {
          alert('Error al observar: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  // ========== GESTIÓN DE DOCUMENTOS ==========

  crearDocumento(): void {
    this.abrirModalCrearDocumento();
  }

  descargarDocumento(documentoId: number): void {
    this.documentoService.download(documentoId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documento-${documentoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        alert('Error al descargar el documento: ' + (err.message || 'Error desconocido'));
      }
    });
  }

  presentarDocumento(documentoId: number): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.documentoService.presentar(documentoId, file).subscribe({
          next: () => {
            alert('Documento presentado exitosamente');
            this.cargarDocumentos();
          },
          error: (err) => {
            alert('Error al presentar el documento: ' + (err.message || 'Error desconocido'));
          }
        });
      }
    };
    fileInput.click();
  }

  aprobarDocumento(documentoId: number): void {
    const notas = prompt('Ingrese notas de aprobación (opcional):');
    this.documentoService.approve(documentoId, notas || undefined).subscribe({
      next: () => {
        alert('Documento aprobado exitosamente');
        this.cargarDocumentos();
      },
      error: (err) => {
        alert('Error al aprobar el documento: ' + (err.message || 'Error desconocido'));
      }
    });
  }

  rechazarDocumento(documentoId: number): void {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (motivo) {
      this.documentoService.reject(documentoId, motivo).subscribe({
        next: () => {
          alert('Documento rechazado');
          this.cargarDocumentos();
        },
        error: (err) => {
          alert('Error al rechazar el documento: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  observarDocumento(documentoId: number): void {
    const observacion = prompt('Ingrese las observaciones:');
    if (observacion) {
      this.documentoService.observe(documentoId, observacion).subscribe({
        next: () => {
          alert('Documento observado');
          this.cargarDocumentos();
        },
        error: (err) => {
          alert('Error al observar el documento: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  eliminarDocumento(documentoId: number): void {
    if (confirm('¿Está seguro de eliminar este documento?')) {
      this.documentoService.delete(documentoId).subscribe({
        next: () => {
          alert('Documento eliminado exitosamente');
          this.cargarDocumentos();
        },
        error: (err) => {
          alert('Error al eliminar el documento: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  // ========== MÉTODOS DE PERMISOS ==========

  puedePresentarDocumento(documentoId: number): boolean {
    const doc = this.documentos.find(d => d.id === documentoId);
    if (!doc) return false;
    const estadosPermitidos = ['PENDIENTE', 'OBSERVADO'];
    return estadosPermitidos.includes(doc.estado) && this.puedePresentarCualquierDocumento;
  }

  puedeAprobarDocumento(documentoId: number): boolean {
    const doc = this.documentos.find(d => d.id === documentoId);
    if (!doc) return false;
    const estadosPermitidos = ['PRESENTADO', 'EN_REVISION'];
    return estadosPermitidos.includes(doc.estado) && this.puedeAprobarCualquierDocumento;
  }

  puedeRechazarDocumento(documentoId: number): boolean {
    return this.puedeAprobarDocumento(documentoId) && this.puedeRechazarCualquierDocumento;
  }

  puedeObservarDocumento(documentoId: number): boolean {
    return this.puedeAprobarDocumento(documentoId) && this.puedeObservarCualquierDocumento;
  }

  puedeEliminarDocumento(documentoId: number): boolean {
    const doc = this.documentos.find(d => d.id === documentoId);
    if (!doc) return false;
    const estadosPermitidos = ['PENDIENTE', 'OBSERVADO'];
    return estadosPermitidos.includes(doc.estado) && this.puedeEliminarCualquierDocumento;
  }

  getColorDocumento(estado: string): string {
    const colores: { [key: string]: string } = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'PRESENTADO': 'bg-blue-100 text-blue-800',
      'APROBADO': 'bg-green-100 text-green-800',
      'RECHAZADO': 'bg-red-100 text-red-800',
      'OBSERVADO': 'bg-orange-100 text-orange-800',
      'EN_REVISION': 'bg-purple-100 text-purple-800',
      'REVISADO': 'bg-blue-100 text-blue-800'
    };
    return colores[estado.toUpperCase()] || 'bg-gray-100 text-gray-800';
  }

  getColorTimeline(status: string): string {
    const colores: { [key: string]: string } = {
      'completed': 'bg-green-500',
      'current': 'bg-blue-500',
      'pending': 'bg-gray-300',
      'error': 'bg-red-500'
    };
    return colores[status] || 'bg-gray-300';
  }

  // ========== GESTIÓN DE DOCUMENTOS - MODAL ==========

  abrirModalCrearDocumento(): void {
    this.nuevoDocumento = {
      requisitoId: undefined,
      archivo: undefined,
      observaciones: ''
    };
    this.modoEdicionDocumento = false;
    this.erroresForm = {};
    this.mostrandoModalDocumento = true;
  }

  abrirModalEditarDocumento(documento: DocumentoTramite): void {
    this.nuevoDocumento = {
      requisitoId: documento.requisitoId,
      archivo: undefined,
      observaciones: documento.observaciones || ''
    };
     this.modoEdicionDocumento = true;
     this.documentoEditandoId = documento.id;
     this.erroresForm = {};
     this.mostrandoModalDocumento = true;
   }

   onFileSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.erroresForm.archivo = 'El archivo es demasiado grande. Máximo 10MB';
        return;
      }

      this.nuevoDocumento.archivo = file;
      this.erroresForm.archivo = '';
    }
  }

   validarFormulario(): boolean {
     this.erroresForm = {};

     if (!this.nuevoDocumento.requisitoId) {
       this.erroresForm.requisito = 'Debe seleccionar un tipo de documento';
     }

     if (!this.nuevoDocumento.archivo && !this.modoEdicionDocumento) {
       this.erroresForm.archivo = 'Debe seleccionar un archivo';
     }

     return Object.keys(this.erroresForm).length === 0;
   }

   guardarDocumento(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.cargandoDocumentos = true;

    if (this.modoEdicionDocumento && this.documentoEditandoId) {
      if (!this.nuevoDocumento.archivo) {
        this.erroresForm.archivo = 'Debe seleccionar un archivo para actualizar';
        this.cargandoDocumentos = false;
        return;
      }

      this.documentoService.actualizarArchivo(this.documentoEditandoId, this.nuevoDocumento.archivo).subscribe({
        next: () => {
          this.cargandoDocumentos = false;
          this.cerrarModalDocumento();
          this.cargarDocumentos();
          alert('Documento actualizado exitosamente');
        },
        error: (err) => {
          this.cargandoDocumentos = false;
          alert('Error al actualizar documento: ' + (err.message || 'Error desconocido'));
        }
      });
    } else {
      if (!this.tramiteId) {
        alert('Error: No hay trámite asociado');
        this.cargandoDocumentos = false;
        return;
      }

       this.documentoService.uploadDocumento(
         this.tramiteId,
         this.nuevoDocumento.requisitoId!,
         this.nuevoDocumento.archivo!
       ).subscribe({
        next: (documento) => {
          this.cargandoDocumentos = false;
          this.cerrarModalDocumento();
          this.cargarDocumentos();
          alert('Documento subido exitosamente');
        },
        error: (err) => {
          this.cargandoDocumentos = false;
          alert('Error al subir documento: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  getNombreRequisito(requisitoId: number): string {
    const req = this.requisitosDisponibles.find(r => r.id === requisitoId);
    return req ? req.nombreCompleto || req.codigo : 'Desconocido';
  }

  // ========== NUEVAS FUNCIONALIDADES ==========

  irAMisDocumentos(): void {
    alert('Función "Mis documentos" - Por implementar');
  }

  irAPendientesRevision(): void {
    alert('Función "Pendientes de revisión" - Por implementar');
  }

  irAEstadisticasDocumentos(): void {
    alert('Función "Estadísticas" - Por implementar');
  }

   // ========== MODAL DE DOCUMENTOS ==========

   abrirModalDocumento(modoEdicion: boolean = false, documentoId?: number): void {
     this.mostrandoModalDocumento = true;
     this.modoEdicionDocumento = modoEdicion;
     this.documentoEditandoId = documentoId;
     this.nuevoDocumento = { requisitoId: undefined, archivo: undefined, observaciones: '' };
     this.erroresForm = {};

     if (modoEdicion && documentoId) {
       // Cargar datos del documento existente
       const doc = this.documentos.find(d => d.id === documentoId);
       if (doc) {
         this.nuevoDocumento.requisitoId = doc.requisitoId;
         this.nuevoDocumento.observaciones = doc.observaciones;
       }
     }
   }

   cerrarModalDocumento(): void {
     this.mostrandoModalDocumento = false;
     this.modoEdicionDocumento = false;
     this.documentoEditandoId = undefined;
     this.nuevoDocumento = { requisitoId: undefined, archivo: undefined, observaciones: '' };
     this.erroresForm = {};
   }

   // ========== MODAL DE TRÁMITE ==========

   abrirModalEditarTramite(): void {
     this.mostrandoModalTramite = true;
   }

   cerrarModalTramite(): void {
     this.mostrandoModalTramite = false;
   }

   onTramiteGuardado(): void {
     this.cargarTramite();
     this.mostrandoModalTramite = false;
   }
 }
