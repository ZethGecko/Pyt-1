import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramiteService } from '../../tramites/services/tramite.service';
import { TramiteEnriquecido } from '../../tramites/models/tramite.model';
import { InstanciaTramiteService } from '../../configuracion/services/instancia-tramite.service';
import { InstanciaTramite } from '../../configuracion/models/instancia-tramite.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { Router } from '@angular/router';
import { RevisionRequisitosComponent } from '../../tramites/components/revision-requisitos/revision-requisitos.component';

@Component({
  selector: 'app-gestion-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RevisionRequisitosComponent],
  templateUrl: './gestion-expedientes.component.html',
  styleUrls: ['./gestion-expedientes.component.scss']
})
export class GestionExpedientesComponent implements OnInit {
  tramites: TramiteEnriquecido[] = [];
  cargando = false;
  error: string | null = null;

  filtroCodigo = '';
  filtroRuc = '';
  filtroEstado = '';

  // Modal de instancias
  modalInstanciasAbierto = false;
  tramiteSeleccionado: TramiteEnriquecido | null = null;
  instancias: InstanciaTramite[] = [];
  instanciasFiltradas: InstanciaTramite[] = [];
  cargandoInstancias = false;
  filtroIdentificador = '';
  filtroEstadoInstancia = '';

   // Modal de edición de instancia
   modalEdicionAbierto = false;
   instanciaEdicion: { idInstancia?: number; identificador: string; estado: string; observaciones?: string } = { identificador: '', estado: '' };

   // Modal crear instancia (reemplaza prompt nativo)
   modalCrearInstanciaAbierto = false;
   nuevoIdentificador = '';
   nuevaDescripcion = '';

   // Revisión de requisitos (edición completa de instancia)
   modoRevision = false;
   instanciaEnRevision: InstanciaTramite | null = null;

   // Modal eliminar trámite
  modalEliminarAbierto = false;
  motivoEliminacion = '';

  constructor(
    private tramiteService: TramiteService,
    private instanciaService: InstanciaTramiteService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarTramites();
  }

  cargarTramites(): void {
    this.cargando = true;
    this.error = null;

    this.tramiteService.listarConInstancias().subscribe({
      next: (data) => {
        this.tramites = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar trámites: ' + (err.error?.message || err.message);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.cargando = true;

    this.tramiteService.listarConInstancias().subscribe({
      next: (data) => {
        this.tramites = data.filter(t => {
          const codigoOk = !this.filtroCodigo || t.codigoRUT.toLowerCase().includes(this.filtroCodigo.toLowerCase());
          const rucOk = !this.filtroRuc || t.solicitanteIdentificacion?.includes(this.filtroRuc);
          const estadoOk = !this.filtroEstado || t.estado === this.filtroEstado;
          return codigoOk && rucOk && estadoOk;
        });
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al filtrar: ' + (err.error?.message || err.message);
        this.cargando = false;
      }
    });
  }

  // Estadísticas
  contarPorEstado(estado: string): number {
    return this.tramites.filter(t => t.estado === estado).length;
  }

  // ========== MODAL INSTANCIAS ==========
  abrirModalInstancias(tramite: TramiteEnriquecido): void {
    this.tramiteSeleccionado = tramite;
    this.modalInstanciasAbierto = true;
    this.filtroIdentificador = '';
    this.filtroEstadoInstancia = '';
    this.cargarInstancias(tramite.id);
  }

  cerrarModalInstancias(): void {
    this.modalInstanciasAbierto = false;
    this.tramiteSeleccionado = null;
    this.instancias = [];
    this.instanciasFiltradas = [];
  }

  cargarInstancias(tramiteId: number): void {
    this.cargandoInstancias = true;
    this.instanciaService.listarPorTramite(tramiteId).subscribe({
      next: (data) => {
        this.instancias = data;
        this.instanciasFiltradas = data;
        this.cargandoInstancias = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar instancias: ' + (err.error?.message || err.message));
        this.cargandoInstancias = false;
      }
    });
  }

  aplicarFiltrosInstancias(): void {
    this.instanciasFiltradas = this.instancias.filter(inst => {
      const idOk = !this.filtroIdentificador || inst.identificador.toLowerCase().includes(this.filtroIdentificador.toLowerCase());
      const estadoOk = !this.filtroEstadoInstancia || inst.estado === this.filtroEstadoInstancia;
      return idOk && estadoOk;
    });
  }

  limpiarFiltrosInstancias(): void {
    this.filtroIdentificador = '';
    this.filtroEstadoInstancia = '';
    this.instanciasFiltradas = this.instancias;
  }

   // Añadir nueva instancia (modal)
   abrirModalCrearInstancia(): void {
     if (!this.tramiteSeleccionado) return;
     this.nuevoIdentificador = '';
     this.nuevaDescripcion = '';
     this.modalCrearInstanciaAbierto = true;
   }

   cerrarModalCrearInstancia(): void {
     this.modalCrearInstanciaAbierto = false;
   }

   confirmarCrearInstancia(): void {
     if (!this.tramiteSeleccionado || !this.nuevoIdentificador?.trim()) return;

     this.instanciaService.crear(this.tramiteSeleccionado.id, {
       identificador: this.nuevoIdentificador.trim(),
       descripcion: this.nuevaDescripcion.trim() || undefined
     }).subscribe({
        next: (inst) => {
          this.notificationService.showSuccess('Instancia creada correctamente');
          this.cerrarModalCrearInstancia();
          this.cargarInstancias(this.tramiteSeleccionado!.id);
          this.cargarTramites();
        },
       error: (err) => {
         this.notificationService.showError('Error al crear instancia: ' + (err.error?.message || err.message));
       }
     });
   }

   // ========== REVISIÓN DE REQUISITOS (EDICIÓN DE INSTANCIA) ==========
  abrirRevisionInstancia(instancia: InstanciaTramite): void {
    this.instanciaEnRevision = instancia;
    this.modoRevision = true;
    // Ocultar lista de instancias, mostrar componente de revisión
  }

  cerrarRevision(): void {
    this.modoRevision = false;
    this.instanciaEnRevision = null;
    // Recargar instancias por si hubo cambios
    if (this.tramiteSeleccionado) {
      this.cargarInstancias(this.tramiteSeleccionado.id);
    }
  }

  // Eventos de RevisionRequisitosComponent
  onTramiteFinalizado(): void {
    this.notificationService.showSuccess('Trámite revisado completamente');
    this.cerrarRevision();
    this.cerrarModalInstancias();
    this.cargarTramites();
  }

  onTramiteObservado(): void {
    this.notificationService.showSuccess('Trámite observado');
    this.cerrarRevision();
    this.cerrarModalInstancias();
    this.cargarTramites();
  }

  // ========== CRUD TRÁMITES ==========
  abrirModalCrearTramite(): void {
    alert('Creación de trámite no implementada aún');
  }

  // Modal eliminar trámite con motivo
  abrirModalEliminarTramite(tramite: TramiteEnriquecido): void {
    this.tramiteSeleccionado = tramite;
    this.modalEliminarAbierto = true;
    this.motivoEliminacion = '';
  }

  cerrarModalEliminar(): void {
    this.modalEliminarAbierto = false;
    this.tramiteSeleccionado = null;
    this.motivoEliminacion = '';
  }

  confirmarEliminarTramite(): void {
    if (!this.tramiteSeleccionado || !this.motivoEliminacion?.trim()) return;

    this.tramiteService.eliminar(this.tramiteSeleccionado.id, this.motivoEliminacion).subscribe({
      next: () => {
        this.notificationService.showSuccess('Expediente eliminado correctamente');
        this.cerrarModalEliminar();
        this.cargarTramites();
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar expediente: ' + (err.error?.message || err.message));
      }
    });
  }

   // ========== UTILIDADES ==========
   formatearEstado(estado: string): string {
     const estados: Record<string, string> = {
       'PENDIENTE': 'Pendiente',
       'EN_REVISION': 'En Revisión',
       'APROBADO': 'Aprobado',
       'REPROBADO': 'Reprobado',
       'OBSERVADO': 'Observado',
       'CERRADO': 'Cerrado'
     };
     return estados[estado.toUpperCase()] || estado;
   }

   // ========== CRUD INSTANCIAS (edición/eliminación) ==========
   abrirModalEditarInstancia(instancia: InstanciaTramite): void {
     this.instanciaEnRevision = instancia;
     this.modoRevision = true;
   }

   cerrarModalEdicion(): void {
     this.modalEdicionAbierto = false;
     this.instanciaEdicion = { identificador: '', estado: '' };
   }

   guardarEdicionInstancia(): void {
     if (!this.instanciaEdicion?.idInstancia) return;

     this.instanciaService.actualizar(this.instanciaEdicion.idInstancia, {
       identificador: this.instanciaEdicion.identificador,
       estado: this.instanciaEdicion.estado,
       observaciones: this.instanciaEdicion.observaciones
     } as any).subscribe({
       next: () => {
         this.notificationService.showSuccess('Instancia actualizada correctamente');
         this.cerrarModalEdicion();
         this.cargarInstancias(this.tramiteSeleccionado!.id);
       },
       error: (err) => {
         this.notificationService.showError('Error al actualizar: ' + (err.error?.message || err.message));
       }
     });
   }

   eliminarInstancia(instancia: InstanciaTramite): void {
     if (!confirm(`¿Eliminar la instancia "${instancia.identificador}"?`)) return;

     this.instanciaService.eliminar(instancia.idInstancia).subscribe({
       next: () => {
         this.notificationService.showSuccess('Instancia eliminada');
         this.cargarInstancias(this.tramiteSeleccionado!.id);
       },
       error: (err) => {
         this.notificationService.showError('Error al eliminar: ' + (err.error?.message || err.message));
       }
     });
   }
}
