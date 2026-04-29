import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InstanciaTramiteService } from '../../../configuracion/services/instancia-tramite.service';
import { InstanciaTramite } from '../../../configuracion/models/instancia-tramite.model';
import { TramiteService } from '../../../tramites/services/tramite.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { RevisionRequisitosComponent } from '../../../tramites/components/revision-requisitos/revision-requisitos.component';
import { DocumentoTramiteService } from '../../../tramites/services/documento-tramite.service';
import { DocumentoTramite } from '../../../tramites/models/documento-tramite.model';

@Component({
  selector: 'app-gestion-instancias',
  standalone: true,
  imports: [CommonModule, FormsModule, RevisionRequisitosComponent],
  templateUrl: './gestion-instancias.component.html',
  styleUrls: ['./gestion-instancias.component.scss']
})
export class GestionInstanciasComponent implements OnInit {
  
  // 🎯 DEPENDENCY INJECTION
  constructor(
    private instanciaService: InstanciaTramiteService,
    private tramiteService: TramiteService,
    private notificationService: NotificationService,
    private documentoTramiteService: DocumentoTramiteService,
    private cd: ChangeDetectorRef
  ) {}

  // 🎯 ESTADO DEL COMPONENTE
  instancias: InstanciaTramite[] = [];
  expedientesAgrupados: { rut: string; tramiteId: number; tipoTramiteDescripcion?: string; instancias: InstanciaTramite[] }[] = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  // 🎯 FILTROS
  filtroRut = '';
  filtroTramiteId = '';

  // 🎯 MODALES
  mostrandoModalInstancias = false;
  mostrarPromptNuevaInstancia = false;
  mostrandoModalEdicion = false;
  mostrarRevision = false;
  expedienteSeleccionado: { rut: string; tramiteId: number; tipoTramiteDescripcion?: string; instancias: InstanciaTramite[] } | null = null;
  instanciaEditando: InstanciaTramite | null = null;
  nuevoIdentificadorInstancia = '';
  formInstancia = { identificador: '', estado: '' };
  documentosInstancia: DocumentoTramite[] = [];
  tramiteParaRevision: number = 0;
  tramiteCodigoRUT: string = '';
  tramiteTipoDescripcion: string = '';
  instanciaParaRevision: number = 0;

  // 🎯 CONFIGURACIÓN
  estadosInstancia = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  clasesEstado: { [key: string]: string } = {
    'APROBADO': 'bg-green-100 text-green-800',
    'DESAPROBADO': 'bg-red-100 text-red-800',
    'OBSERVADO': 'bg-yellow-100 text-yellow-800'
  };

  // 🎯 Vida del componente
  ngOnInit(): void {
    this.cargarInstancias();
  }

  // 🎯 OPERACIONES CRUD
  cargarInstancias(): void {
    this.cargando = true;
    this.error = null;
    
    this.instanciaService.listarTodas().subscribe({
      next: (instancias: InstanciaTramite[]) => {
        this.instancias = instancias;
        
        // Agrupar instancias por RUT del expediente (tramite.codigoRut)
        const gruposMap = new Map<string, { rut: string; tramiteId: number; tipoTramiteDescripcion?: string; instancias: InstanciaTramite[] }>();
        
        instancias.forEach(inst => {
          const rut = inst.tramite?.codigoRut || 'Sin RUT';
          const tramiteId = inst.tramiteId || 0;
          const tipoTramiteDescripcion = inst.tramite?.tipoTramiteDescripcion || '';
          
          if (!gruposMap.has(rut)) {
            gruposMap.set(rut, {
              rut,
              tramiteId,
              tipoTramiteDescripcion,
              instancias: []
            });
          }
          gruposMap.get(rut)!.instancias.push(inst);
        });
        
        // Convertir a array y ordenar por RUT
        this.expedientesAgrupados = Array.from(gruposMap.values())
          .sort((a, b) => a.rut.localeCompare(b.rut));
        
        this.totalElements = instancias.length;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al cargar instancias';
        this.cargando = false;
        this.cd.detectChanges();
        console.error('Error cargando instancias:', err);
      }
    });
  }

  // 🎯 FILTROS
  get expedientesFiltrados() {
    return this.expedientesAgrupados.filter(exp => {
      const cumpleRut = !this.filtroRut || exp.rut.toLowerCase().includes(this.filtroRut.toLowerCase());
      const cumpleTramite = !this.filtroTramiteId || exp.tramiteId.toString().includes(this.filtroTramiteId);
      return cumpleRut && cumpleTramite;
    });
  }

  // 🎯 MODAL GESTIÓN DE INSTANCIAS
  abrirModalInstancias(expediente: { rut: string; tramiteId: number; tipoTramiteDescripcion?: string; instancias: InstanciaTramite[] }): void {
    this.expedienteSeleccionado = expediente;
    this.mostrandoModalInstancias = true;
  }

  cerrarModalInstancias(): void {
    this.mostrandoModalInstancias = false;
    this.expedienteSeleccionado = null;
  }

  // 🎯 CREAR INSTANCIA
  abrirPromptNuevaInstancia(): void {
    this.nuevoIdentificadorInstancia = '';
    this.mostrarPromptNuevaInstancia = true;
  }

  cancelarPromptNuevaInstancia(): void {
    this.mostrarPromptNuevaInstancia = false;
    this.nuevoIdentificadorInstancia = '';
  }

  aceptarPromptNuevaInstancia(): void {
    if (!this.nuevoIdentificadorInstancia.trim()) {
      this.notificationService.showError('El identificador es obligatorio');
      return;
    }
    
    this.cargando = true;
    // Crear objeto mínimo para la creación
    const nuevaInstancia = {
      identificador: this.nuevoIdentificadorInstancia.trim(),
      estado: 'ACTIVO'
    } as InstanciaTramite;
    
    this.instanciaService.crear(this.expedienteSeleccionado!.tramiteId, nuevaInstancia).subscribe({
      next: (instanciaCreada) => {
        // Agregar la nueva instancia a la lista local
        this.expedienteSeleccionado!.instancias.push(instanciaCreada);
        this.mostrarPromptNuevaInstancia = false;
        this.nuevoIdentificadorInstancia = '';
        this.cargarInstancias(); // Recargar para actualizar fechas
        this.notificationService.showSuccess('Instancia creada correctamente');
      },
      error: (err: any) => {
        this.notificationService.showError(err.error?.message || 'Error al crear instancia');
        this.cargando = false;
      }
    });
  }

  // 🎯 EDITAR INSTANCIA
  abrirModalEdicion(instancia: InstanciaTramite): void {
    this.instanciaEditando = instancia;
    this.formInstancia = {
      identificador: instancia.identificador,
      estado: instancia.estado
    };
    this.cargarDocumentosInstancia(instancia.idInstancia);
    this.mostrandoModalEdicion = true;
  }

  cerrarModalEdicion(): void {
    this.mostrandoModalEdicion = false;
    this.instanciaEditando = null;
    this.documentosInstancia = [];
  }

  cargarDocumentosInstancia(instanciaId: number): void {
    this.cargando = true;
    this.instanciaService.obtenerDocumentosDeInstancia(instanciaId).subscribe({
      next: (documentos: DocumentoTramite[]) => {
        this.documentosInstancia = documentos;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.notificationService.showError('Error al cargar requisitos de la instancia');
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  guardarEdicionInstancia(): void {
    if (!this.instanciaEditando) return;
    if (!this.formInstancia.identificador || this.formInstancia.identificador.trim() === '') {
      this.notificationService.showError('El identificador es obligatorio');
      return;
    }
    
    this.cargando = true;
    this.instanciaService.actualizar(this.instanciaEditando.idInstancia, this.formInstancia as InstanciaTramite).subscribe({
      next: (instanciaActualizada) => {
        // Actualizar local en expedienteSeleccionado
        const index = this.expedienteSeleccionado!.instancias.findIndex(i => i.idInstancia === this.instanciaEditando!.idInstancia);
        if (index !== -1) {
          this.expedienteSeleccionado!.instancias[index] = instanciaActualizada;
        }
        
        // Actualizar también en el array global de instancias
        const indexGlobal = this.instancias.findIndex(i => i.idInstancia === this.instanciaEditando!.idInstancia);
        if (indexGlobal !== -1) {
          this.instancias[indexGlobal] = instanciaActualizada;
        }
        
        // Actualizar documentos (requisitos) de la instancia
        const actualizaciones = this.documentosInstancia
          .filter(doc => doc.id != null)
          .map(doc => 
            this.documentoTramiteService.update(doc.id, {
              estado: doc.estado,
              observaciones: doc.observaciones
            })
          );
        
        if (actualizaciones.length > 0) {
          forkJoin(actualizaciones).subscribe({
            next: () => {
              // Recargar lista completa para obtener fechas actualizadas
              this.cargarInstancias();
              this.cerrarModalEdicion();
              this.notificationService.showSuccess('Instancia y requisitos actualizados correctamente');
            },
            error: (err) => {
              this.notificationService.showError('Error al actualizar algunos documentos');
              this.cargando = false;
            }
          });
        } else {
          this.cargarInstancias();
          this.cerrarModalEdicion();
          this.notificationService.showSuccess('Instancia actualizada correctamente');
        }
      },
      error: (err: any) => {
        this.notificationService.showError(err.error?.message || 'Error al guardar');
        this.cargando = false;
      }
    });
  }

  // 🎯 ELIMINAR INSTANCIA
  eliminarInstancia(instancia: InstanciaTramite): void {
    if (confirm(`¿Está seguro que desea eliminar la instancia ${instancia.identificador}?`)) {
      this.cargando = true;
      this.instanciaService.eliminar(instancia.idInstancia).subscribe({
        next: () => {
          // Remover de arrays locales
          this.instancias = this.instancias.filter(i => i.idInstancia !== instancia.idInstancia);
          this.expedientesAgrupados.forEach(exp => {
            exp.instancias = exp.instancias.filter(i => i.idInstancia !== instancia.idInstancia);
          });
          // Remover expedientes vacíos
          this.expedientesAgrupados = this.expedientesAgrupados.filter(exp => exp.instancias.length > 0);
          
          this.notificationService.showSuccess('Instancia eliminada correctamente');
          this.cargando = false;
        },
        error: (err: any) => {
          this.notificationService.showError('Error al eliminar instancia');
          this.cargando = false;
        }
      });
    }
  }

  // 🎯 REVISIÓN DE REQUISITOS
  verDocumentos(instancia: InstanciaTramite): void {
    this.tramiteParaRevision = instancia.tramiteId || 0;
    this.tramiteCodigoRUT = instancia.tramite?.codigoRut || '';
    this.tramiteTipoDescripcion = instancia.tramite?.tipoTramiteDescripcion || '';
    this.instanciaParaRevision = instancia.idInstancia || 0;
    this.mostrarRevision = true;
  }

  cerrarRevision(): void {
    this.mostrarRevision = false;
    this.cargarInstancias();
  }

  onTramiteObservado(): void {
    this.cerrarRevision();
    this.notificationService.showSuccess('Trámite observado');
  }

  onTramiteFinalizado(): void {
    this.cerrarRevision();
    this.notificationService.showSuccess('Trámite revisado completamente');
  }

  // 🎯 UTILIDADES
  limpiarFiltros(): void {
    this.filtroRut = '';
    this.filtroTramiteId = '';
  }

  limpiarMensajes(): void {
    this.error = null;
    this.exito = null;
  }

  mostrarExito(mensaje: string): void {
    this.exito = mensaje;
    setTimeout(() => this.exito = null, 3000);
  }

  // 🎯 FORMATEO
  getEstadoFormateado(estado: string): string {
    const estados: { [key: string]: string } = {
      'APROBADO': 'Aprobado',
      'DESAPROBADO': 'Desaprobado',
      'OBSERVADO': 'Observado'
    };
    return estados[estado] || estado;
  }

  getColorEstado(estado: string): string {
    return this.clasesEstado[estado] || 'bg-gray-100 text-gray-800';
  }
  
  trackById(index: number, item: any): number {
    return item.idInstancia || index;
  }

  // 🎯 CÁLCULO DE FECHAS
  getUltimaActualizacion(instancias: InstanciaTramite[]): string | null {
    if (!instancias || instancias.length === 0) return null;
    
    const fechas = instancias
      .map(inst => inst.fechaActualizacion || inst.fechaCreacion)
      .filter(fecha => fecha != null) as string[];
    
    if (fechas.length === 0) return null;
    
    const maxFecha = new Date(Math.max(...fechas.map(f => new Date(f).getTime())));
    return maxFecha.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 🎯 PAGINACIÓN (placeholder)
  totalElements = 0;
  pageSize = 10;
  currentPage = 1;
}
