import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { NotificacionService, NotificacionEnriquecida, NotificacionStats } from '../services/notificacion.service';

@Component({
  selector: 'app-gestion-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './gestion-notificaciones.component.html',
  styleUrls: ['./gestion-notificaciones.component.scss']
})
export class GestionNotificacionesComponent implements OnInit {
  private notificacionService = inject(NotificacionService);

  // Signals
  notificaciones = signal<NotificacionEnriquecida[]>([]);
  stats = signal<NotificacionStats | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  
  // Filters
  filterEstado = signal<string>('todos');
  filterTipo = signal<string>('todos');
  searchTerm = signal<string>('');

  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(20);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  // Selection
  selectedNotificaciones = signal<number[]>([]);

  // Modal
  showModal = signal<boolean>(false);
  selectedNotificacion = signal<NotificacionEnriquecida | null>(null);

  // Computed
  filteredNotificaciones = computed(() => {
    let result = this.notificaciones();
    
    // Filter by estado
    if (this.filterEstado() !== 'todos') {
      result = result.filter(n => n.estado === this.filterEstado());
    }
    
    // Filter by tipo
    if (this.filterTipo() !== 'todos') {
      result = result.filter(n => n.tipoNotificacion === this.filterTipo());
    }
    
    // Filter by search term
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(n => 
        n.asunto.toLowerCase().includes(term) ||
        n.mensaje.toLowerCase().includes(term) ||
        (n.tramiteNumero && n.tramiteNumero.toLowerCase().includes(term))
      );
    }
    
    return result;
  });

  ngOnInit(): void {
    this.loadNotificaciones();
    this.loadStats();
  }

  loadNotificaciones(): void {
    this.loading.set(true);
    this.notificacionService.getNotificaciones(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.notificaciones.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading notificaciones:', err);
        this.loading.set(false);
        // Load demo data for testing
        this.loadDemoData();
      }
    });
  }

  loadStats(): void {
    this.notificacionService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadDemoData(): void {
    // Demo data for testing
    const demoNotificaciones: NotificacionEnriquecida[] = [
      {
        id: 1,
        tipoNotificacion: 'derivacion',
        asunto: 'Nuevo trámite derivado a su departamento',
        mensaje: 'Se ha derivado el trámite TRAM-2024-001 para revisión',
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        fechaLeida: null,
        prioridad: 3,
        accionRequerida: 'revisar',
        fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        tramiteId: 1,
        tramiteNumero: 'TRAM-2024-001',
        usuarioRemitenteId: 2,
        usuarioRemitenteNombre: 'Juan Perez',
        usuarioDestinatarioId: 1,
        usuarioDestinatarioNombre: 'Admin Sistema',
        departamentoDestinoId: 1,
        departamentoDestinoNombre: 'Transporte'
      },
      {
        id: 2,
        tipoNotificacion: 'recordatorio',
        asunto: 'Recordatorio: Vencimiento de trámite',
        mensaje: 'El trámite TRAM-2024-002 vence mañana',
        estado: 'pendiente',
        fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        fechaLeida: null,
        prioridad: 2,
        accionRequerida: 'aprobar',
        fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        tramiteId: 2,
        tramiteNumero: 'TRAM-2024-002',
        usuarioRemitenteId: 1,
        usuarioRemitenteNombre: 'Admin Sistema',
        usuarioDestinatarioId: 1,
        usuarioDestinatarioNombre: 'Admin Sistema',
        departamentoDestinoId: null,
        departamentoDestinoNombre: null
      },
      {
        id: 3,
        tipoNotificacion: 'alerta',
        asunto: 'Alerta: Inspección programada',
        mensaje: 'Se ha programado una inspección para mañana',
        estado: 'leida',
        fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fechaLeida: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        prioridad: 1,
        accionRequerida: null,
        fechaLimite: null,
        tramiteId: null,
        tramiteNumero: null,
        usuarioRemitenteId: 3,
        usuarioRemitenteNombre: 'Sistema',
        usuarioDestinatarioId: 1,
        usuarioDestinatarioNombre: 'Admin Sistema',
        departamentoDestinoId: 1,
        departamentoDestinoNombre: 'Transporte'
      }
    ];
    this.notificaciones.set(demoNotificaciones);
    this.totalElements.set(demoNotificaciones.length);
  }

  // Actions
  marcarComoLeida(notificacion: NotificacionEnriquecida): void {
    if (notificacion.estado === 'leida') return;
    
    this.notificacionService.marcarComoLeida(notificacion.id).subscribe({
      next: () => {
        this.loadNotificaciones();
      },
      error: (err) => {
        console.error('Error marking as read:', err);
        this.error.set('Error al marcar notificación como leída');
      }
    });
  }

  marcarTodasLeidas(): void {
    const pendientes = this.notificaciones().filter(n => n.estado === 'pendiente');
    if (pendientes.length === 0) return;

    const ids = pendientes.map(n => n.id);
    this.notificacionService.marcarComoLeidaMultiple(ids).subscribe({
      next: () => {
        this.loadNotificaciones();
      },
      error: (err) => {
        console.error('Error marking all as read:', err);
        this.error.set('Error al marcar notificaciones como leídas');
      }
    });
  }

  archivarNotificacion(notificacion: NotificacionEnriquecida): void {
    this.notificacionService.archivarNotificacion(notificacion.id).subscribe({
      next: () => {
        this.loadNotificaciones();
      },
      error: (err) => {
        console.error('Error archiving:', err);
        this.error.set('Error al archivar notificación');
      }
    });
  }

  // Selection
  toggleSeleccion(id: number): void {
    this.selectedNotificaciones.update(selected => {
      if (selected.includes(id)) {
        return selected.filter(s => s !== id);
      } else {
        return [...selected, id];
      }
    });
  }

  seleccionarTodas(): void {
    const allIds = this.filteredNotificaciones().map(n => n.id);
    this.selectedNotificaciones.set(allIds);
  }

  deseleccionarTodas(): void {
    this.selectedNotificaciones.set([]);
  }

  // Modal
  openModal(notificacion: NotificacionEnriquecida): void {
    this.selectedNotificacion.set(notificacion);
    this.showModal.set(true);
    
    // Mark as read when opening
    if (notificacion.estado === 'pendiente') {
      this.marcarComoLeida(notificacion);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedNotificacion.set(null);
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadNotificaciones();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadNotificaciones();
    }
  }

  // Filters
  setFilterEstado(estado: string): void {
    this.filterEstado.set(estado);
  }

  setFilterTipo(tipo: string): void {
    this.filterTipo.set(tipo);
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  clearFilters(): void {
    this.filterEstado.set('todos');
    this.filterTipo.set('todos');
    this.searchTerm.set('');
  }

  isVencida(dateStr: string | null): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  // Helpers
  getTipoIcon(tipo: string | null): string {
    return this.notificacionService.getTipoIcon(tipo);
  }

  getTipoLabel(tipo: string | null): string {
    return this.notificacionService.getTipoLabel(tipo);
  }

  getPrioridadClass(prioridad: number | null): string {
    return this.notificacionService.getPrioridadClass(prioridad);
  }

  getEstadoClass(estado: string | null): string {
    return this.notificacionService.getEstadoClass(estado);
  }

  getEstadoLabel(estado: string | null): string {
    return this.notificacionService.getEstadoLabel(estado);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPendientesCount(): number {
    return this.notificaciones().filter(n => n.estado === 'pendiente').length;
  }

  getUrgentesCount(): number {
    return this.notificaciones().filter(n => n.prioridad === 3 && n.estado === 'pendiente').length;
  }
}
