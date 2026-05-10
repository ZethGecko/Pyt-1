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

  filtroEstado: string = '';
  filtroPrioridad: string = '';

  stats = {
    total: 0,
    enRevision: 0,
    derivados: 0,
    aprobados: 0,
    observados: 0,
    atrasados: 0
  };

  usuarioActual: any = null;
  departamentoActual: any = null;

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
    const esSuperAdmin = usuarioActual?.role?.name === 'SUPER_ADMIN';
    const departamentoId = this.departamentoActual?.idDepartamento || this.departamentoActual?.id;
    const puedeVerTodos = esSuperAdmin || usuarioActual?.role?.canViewAllData === true;

    let observable: Observable<TramiteEnriquecido[]>;
    if (!departamentoId && !puedeVerTodos) {
      this.cargando = false;
      this.notificationService.showWarning('El usuario no tiene departamento asignado');
      this.tramites = [];
      this.tramitesFiltrados = [];
      this.actualizarPaginacion();
      return;
    } else if (puedeVerTodos) {
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
      enRevision: this.tramites.filter(t => this.getEstadoNormalizado(t) === 'en_revision').length,
      derivados: this.tramites.filter(t => this.getEstadoNormalizado(t) === 'derivado').length,
      aprobados: this.tramites.filter(t => this.getEstadoNormalizado(t) === 'aprobado').length,
      observados: this.tramites.filter(t => this.getEstadoNormalizado(t) === 'observado').length,
      atrasados: this.tramites.filter(t => t.estaAtrasado).length
    };
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.tramitesFiltrados = this.tramites.filter(tramite => {
      if (this.filtroEstado && this.getEstadoNormalizado(tramite) !== this.filtroEstado.toLowerCase()) return false;
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

  getEstadosDisponibles(): string[] {
    const estadosUnicos = [...new Set(this.tramites.map(t => this.getEstadoNormalizado(t)))];
    const ordenEstados = ['registrado', 'en_revision', 'derivado', 'observado', 'aprobado', 'finalizado', 'rechazado', 'cancelado'];
    return estadosUnicos.sort((a, b) => {
      const indexA = ordenEstados.indexOf(a);
      const indexB = ordenEstados.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
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

  abrirModalRevisar(tramite: TramiteEnriquecido): void {
    const estadosFinales = ['finalizado', 'cancelado', 'rechazado'];
    const estadoNormalizado = this.getEstadoNormalizado(tramite);
    if (estadosFinales.includes(estadoNormalizado)) {
      this.notificationService.showWarning('No se puede revisar un trámite en estado final');
      return;
    }

    if (estadoNormalizado === 'registrado') {
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
    const estadosFinales = ['finalizado', 'cancelado', 'rechazado'];
    return !estadosFinales.includes(this.getEstadoNormalizado(tramite));
  }

  puedeFinalizarTramite(tramite: TramiteEnriquecido): boolean {
    return this.getEstadoNormalizado(tramite) === 'aprobado';
  }

  finalizarTramite(tramite: TramiteEnriquecido): void {
    if (!this.puedeFinalizarTramite(tramite)) {
      this.notificationService.showWarning('Solo se pueden finalizar trámites en estado "Aprobado"');
      return;
    }
    if (confirm('¿Está seguro de finalizar este trámite? Una vez finalizado no se podrán realizar modificaciones.')) {
      this.tramiteService.finalizar(tramite.id).subscribe({
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

  revisarTramite(tramite: TramiteEnriquecido): void {
    this.abrirModalRevisar(tramite);
  }

  getEstadoNormalizado(tramite: TramiteEnriquecido): string {
    return (tramite.estado || '').toLowerCase();
  }

  getColorEstado(estado: string): string {
    const estadoLower = (estado || '').toLowerCase();
    if (['aprobado', 'finalizado'].includes(estadoLower)) return 'bg-green-100 text-green-800 border-green-200';
    if (['rechazado', 'cancelado'].includes(estadoLower)) return 'bg-red-100 text-red-800 border-red-200';
    if (['observado', 'pendiente'].includes(estadoLower)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (['en_revision', 'derivado'].includes(estadoLower)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (estadoLower === 'registrado') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getIconoEstado(estado: string): string {
    const estadoLower = (estado || '').toLowerCase();
    const iconos: { [key: string]: string } = {
      'registrado': '📝',
      'en_revision': '🔍',
      'derivado': '➡️',
      'aprobado': '✅',
      'rechazado': '❌',
      'observado': '⚠️',
      'finalizado': '🏁',
      'pendiente': '⏳',
      'cancelado': '🚫'
    };
    return iconos[estadoLower] || '📋';
  }
}
