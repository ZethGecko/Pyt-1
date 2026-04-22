import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { TramiteService } from '../../services/tramite.service';
import { AuthStateService } from '../../../../core/auth/state/auth.state';
import { NotificationService } from '../../../../shared/services/notification.service';
import { TramiteEnriquecido } from '../../models/tramite.model';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { RevisionRequisitosComponent } from '../../components/revision-requisitos/revision-requisitos.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RevisionRequisitosComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tramites: TramiteEnriquecido[] = [];
  tramitesFiltrados: TramiteEnriquecido[] = [];
  tramitesPaginados: TramiteEnriquecido[] = [];
  cargando = false;
  paginaActual = 1;
  itemsPorPagina = 10;

  // Filtros
  filtroEstado: string = '';
  filtroPrioridad: string = '';

  // Estadísticas
  stats = {
    total: 0,
    enRevision: 0,
    derivados: 0,
    aprobados: 0,
    observados: 0,
    atrasados: 0
  };

  // Usuario actual
  usuarioActual: any = null;
  departamentoActual: any = null;

  // Modal de revisión de requisitos
  mostrarModalRequisitos = false;
  tramiteParaRevisar: TramiteEnriquecido | null = null;

  constructor(
    private tramiteService: TramiteService,
    private authState: AuthStateService,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authState.currentUser();
    if (this.usuarioActual) {
      this.departamentoActual = this.usuarioActual.departamento;
    }
    this.cargarTramites();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTramites(): void {
    this.cargando = true;

    const usuarioActual = this.usuarioActual;
    const esSuperAdmin = usuarioActual?.role?.name === 'SUPER_ADMIN' || 
                         usuarioActual?.role?.name === 'SUPER_ADMIN';
    const departamentoId = this.departamentoActual?.idDepartamento || this.departamentoActual?.id;
    const puedeVerTodos = esSuperAdmin || usuarioActual?.role?.canViewAllData === true;

    console.log('[TramitesDashboard] Usuario:', usuarioActual);
    console.log('[TramitesDashboard] Departamento:', departamentoId);
    console.log('[TramitesDashboard] esSuperAdmin:', esSuperAdmin, 'puedeVerTodos:', puedeVerTodos);

    let observable: Observable<TramiteEnriquecido[]>;
    if (!departamentoId && !puedeVerTodos) {
      this.cargando = false;
      this.notificationService.showWarning('El usuario no tiene departamento asignado');
      this.tramites = [];
      this.tramitesFiltrados = [];
      this.actualizarPaginacion();
      return;
    } else if (puedeVerTodos) {
      // Superadmin o roles con canViewAllData ven todos los trámites
      observable = this.tramiteService.listarTodosEnriquecidos();
    } else {
      observable = this.tramiteService.listarPorDepartamento(departamentoId);
    }

    observable.pipe(
      takeUntil(this.destroy$),
      catchError((err: any) => {
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
        this.notificationService.showError('Error al cargar trámites');
        console.error('Error cargando trámites:', err);
        return [];
      })
    ).subscribe({
      next: (tramites: TramiteEnriquecido[]) => {
        this.tramites = tramites;
        this.aplicarFiltros();
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
        this.calcularEstadisticas();
      },
      error: (err: any) => {
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
        this.notificationService.showError('Error al cargar trámites');
        console.error('Error:', err);
      }
    });
  }

  calcularEstadisticas(): void {
    this.stats = {
      total: this.tramites.length,
      enRevision: this.tramites.filter(t => t.estado === 'en_revision').length,
      derivados: this.tramites.filter(t => t.estado === 'derivado').length,
      aprobados: this.tramites.filter(t => t.estado === 'aprobado').length,
      observados: this.tramites.filter(t => t.estado === 'observado').length,
      atrasados: this.tramites.filter(t => t.estaAtrasado).length
    };
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.tramitesFiltrados = this.tramites.filter(tramite => {
      if (this.filtroEstado && tramite.estado !== this.filtroEstado) return false;
      if (this.filtroPrioridad && tramite.prioridad !== this.filtroPrioridad) return false;
      return true;
    });
    this.actualizarPaginacion();
  }
  
  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroPrioridad = '';
    this.aplicarFiltros();
  }

  cambiarEstado(tramite: TramiteEnriquecido, nuevoEstado: string): void {
    const motivo = prompt(`Ingrese el motivo para cambiar el estado a ${nuevoEstado}:`);
    if (!motivo) return;

    this.tramiteService.cambiarEstado(tramite.id, nuevoEstado, motivo).subscribe({
      next: () => {
        this.notificationService.showSuccess('Estado actualizado exitosamente');
        this.cargarTramites();
      },
      error: (err) => {
        this.notificationService.showError('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
        console.error('Error cambiando estado:', err);
      }
    });
  }

  getColorEstado(estado: string): string {
    return this.getEstadoColor(estado);
  }

  getEstadoColor(estado: string): string {
    const estadoLower = (estado || '').toLowerCase();
    if (['aprobado', 'finalizado'].includes(estadoLower)) return 'success';
    if (['rechazado', 'cancelado'].includes(estadoLower)) return 'danger';
    if (['observado', 'pendiente'].includes(estadoLower)) return 'warning';
    if (['en_revision', 'derivado'].includes(estadoLower)) return 'info';
    if (estadoLower === 'registrado') return 'primary';
    return 'secondary';
  }

  getEstadosDisponibles(): string[] {
    return ['registrado', 'en_revision', 'derivado', 'aprobado', 'rechazado', 'observado', 'finalizado', 'cancelado'];
  }

  getPrioridadesDisponibles(): string[] {
    return ['urgente', 'alta', 'normal', 'baja'];
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.tramitesPaginados = this.tramitesFiltrados.slice(inicio, fin);
  }

  get paginasTotales(): number {
    return Math.ceil(this.tramitesFiltrados.length / this.itemsPorPagina);
  }

  // 🎯 REVISIÓN DE REQUISITOS
  abrirModalRevisar(tramite: TramiteEnriquecido): void {
    if (tramite.estado !== 'registrado' && tramite.estado !== 'en_revision') {
      this.notificationService.showWarning('Solo se pueden revisar trámites en estado "Registrado" o "En Revisión"');
      return;
    }

    if (tramite.estado === 'registrado') {
      // Iniciar revisión sin solicitar motivo (automático)
      this.tramiteService.cambiarEstado(tramite.id, 'en_revision', '').subscribe({
        next: () => {
          this.notificationService.showSuccess('Trámite en revisión');
          const tramiteActualizado = { ...tramite, estado: 'en_revision' as const };
          const index = this.tramites.findIndex(t => t.id === tramite.id);
          if (index !== -1) {
            this.tramites[index] = tramiteActualizado;
          }
          this.tramiteParaRevisar = tramiteActualizado;
          this.mostrarModalRequisitos = true;
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          this.notificationService.showError('Error al iniciar revisión');
        }
      });
    } else {
      this.tramiteParaRevisar = tramite;
      this.mostrarModalRequisitos = true;
    }
  }

  cerrarModalRevisar(): void {
    this.mostrarModalRequisitos = false;
    this.tramiteParaRevisar = null;
    this.cargarTramites();
  }

  puedeRevisarRequisitos(tramite: TramiteEnriquecido): boolean {
    return tramite.estado === 'registrado' || tramite.estado === 'en_revision';
  }

  // ✅ FINALIZAR TRÁMITE
  puedeFinalizarTramite(tramite: TramiteEnriquecido): boolean {
    const total = tramite.totalDocumentos || 0;
    const aprobados = tramite.documentosAprobados || 0;
    return tramite.estado === 'en_revision' && total > 0 && aprobados === total;
  }

  finalizarTramite(tramite: TramiteEnriquecido): void {
    if (!this.puedeFinalizarTramite(tramite)) {
      this.notificationService.showWarning('No se puede finalizar: todos los requisitos deben estar aprobados');
      return;
    }
    if (confirm('¿Está seguro de finalizar este trámite?')) {
      this.tramiteService.cambiarEstado(tramite.id, 'APROBADO', 'Trámite finalizado').subscribe({
        next: () => {
          this.notificationService.showSuccess('Trámite finalizado exitosamente');
          this.cargarTramites();
        },
        error: (err) => {
          this.notificationService.showError('Error al finalizar: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  // 📝 REVISAR (Alias para compatibilidad)
  revisarTramite(tramite: TramiteEnriquecido): void {
    this.abrirModalRevisar(tramite);
  }
}
