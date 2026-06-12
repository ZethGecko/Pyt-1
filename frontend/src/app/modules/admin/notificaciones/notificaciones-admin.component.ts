import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacionesService, NotificacionAdminDTO, NotificacionCreateDTO } from './notificaciones.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthNotificationService } from '../../../core/auth/services/auth-notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-notificaciones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones-admin.component.html',
  styleUrls: ['./notificaciones-admin.component.scss']
})
export class NotificacionesAdminComponent implements OnInit {
  private notifService = inject(NotificacionesService);
  private notificationService = inject(NotificationService) as NotificationService;
  private authNotifications = inject(AuthNotificationService);
  private cdr = inject(ChangeDetectorRef);

  notificaciones: NotificacionAdminDTO[] = [];
  cargando = false;
  error: string | null = null;

  // Filtros
  filtroTitulo = '';
  filtroTipo = '';
  filtroActivo: boolean | null = null;

  // Estadísticas
  get total(): number { return this.notificaciones.length; }
  get publicadas(): number { return this.notificaciones.filter(n => n.fechaPublicacion).length; }
  get activas(): number { return this.notificaciones.filter(n => n.activo).length; }

  // Modal crear/editar
  mostrarModal = false;
  editando = false;
  notifEditId: number | null = null;
  form: NotificacionCreateDTO = {
    titulo: '', mensaje: '', tipo: 'INFO',
    fechaExpiracion: null, prioridad: 0, urlDestino: null, usuarioDestinoId: null, paraTodos: true
  };

  readonly tiposNotificacion = ['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'ANUNCIO'] as const;

  ngOnInit(): void { this.cargarNotificaciones(); }

  cargarNotificaciones(): void {
    this.cargando = true;
    this.error = null;
    forkJoin({
      notificaciones: this.notifService.listarTodas()
    }).subscribe({
      next: ({ notificaciones }) => {
        this.notificaciones = notificaciones;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Error al cargar notificaciones: ' + (err?.error?.message || err?.message || 'desconocido');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get notificacionesFiltradas(): NotificacionAdminDTO[] {
    return this.notificaciones.filter(n => {
      const coincideTitulo = !this.filtroTitulo || n.titulo.toLowerCase().includes(this.filtroTitulo.toLowerCase());
      const coincideTipo = !this.filtroTipo || n.tipo === this.filtroTipo;
      const coincideActivo = this.filtroActivo === null || n.activo === this.filtroActivo;
      return coincideTitulo && coincideTipo && coincideActivo;
    });
  }

  // ── Modal ──────────────────────────────────────────
  abrirModalCrear(): void {
    this.editando = false; this.notifEditId = null;
    this.form = { titulo: '', mensaje: '', tipo: 'INFO', fechaExpiracion: null, prioridad: 0, urlDestino: null, usuarioDestinoId: null, paraTodos: true };
    this.mostrarModal = true;
  }

  abrirModalEditar(notif: NotificacionAdminDTO): void {
    this.editando = true; this.notifEditId = notif.id;
    this.form = { titulo: notif.titulo, mensaje: notif.mensaje, tipo: notif.tipo, fechaExpiracion: notif.fechaExpiracion, prioridad: notif.prioridad, urlDestino: notif.urlDestino, usuarioDestinoId: null, paraTodos: notif.paraTodos };
    this.mostrarModal = true;
  }

  cerrarModal(): void { this.mostrarModal = false; this.editando = false; this.notifEditId = null; }

  guardar(): void {
    if (!this.form.titulo.trim() || !this.form.mensaje.trim()) {
      this.notificationService.warning('Título y mensaje son obligatorios'); return;
    }
    const req = this.editando && this.notifEditId !== null ? this.notifService.actualizar(this.notifEditId, { ...this.form, activo: true }) : this.notifService.crear(this.form);
    req.subscribe({
      next: () => {
        this.notificationService.success(this.editando ? 'Notificación actualizada correctamente' : 'Notificación creada correctamente');
        this.cerrarModal(); this.cargarNotificaciones();
      },
      error: (e: any) => {
        this.notificationService.error('Error: ' + (e?.error?.message || e?.message || 'desconocido'));
      }
    });
  }

  // ── Acciones ───────────────────────────────────────
  publicar(notif: NotificacionAdminDTO): void {
    this.notifService.publicar(notif.id).subscribe({
      next: () => {
        this.notificationService.success('Notificación publicada correctamente');
        this.cargarNotificaciones();
        // Refrescar también el panel de notificaciones del sidebar en tiempo real
        this.authNotifications.cargarTodo().catch(() => {});
      },
      error: (e: any) => { this.notificationService.error('Error al publicar: ' + (e?.error?.message || e?.message || 'desconocido')); }
    });
  }

  despublicar(notif: NotificacionAdminDTO): void {
    this.notifService.despublicar(notif.id).subscribe({
      next: () => {
        this.notificationService.success('Notificación despublicada');
        this.cargarNotificaciones();
        this.authNotifications.cargarTodo().catch(() => {});
      },
      error: (e: any) => { this.notificationService.error('Error al despublicar'); }
    });
  }

  eliminar(notif: NotificacionAdminDTO): void {
    if (!confirm(`¿Eliminar la notificación "${notif.titulo}"?`)) return;
    this.notifService.eliminar(notif.id).subscribe({
      next: () => {
        this.notificationService.success('Notificación eliminada');
        this.cargarNotificaciones();
        this.authNotifications.cargarTodo().catch(() => {});
      },
      error: (e: any) => { this.notificationService.error('Error al eliminar'); }
    });
  }

  limpiarFiltros(): void {
    this.filtroTitulo = ''; this.filtroTipo = ''; this.filtroActivo = null;
  }

  // ── Helpers ────────────────────────────────────────
  getTipoClass(tipo: string): string {
    const clases: Record<string, string> = { INFO: 'bg-blue-100 text-blue-700', WARNING: 'bg-yellow-100 text-yellow-700', ERROR: 'bg-red-100 text-red-700', SUCCESS: 'bg-green-100 text-green-700', ANUNCIO: 'bg-purple-100 text-purple-700' };
    return clases[tipo] || 'bg-gray-100 text-gray-700';
  }
  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = { INFO: 'Info', WARNING: 'Advertencia', ERROR: 'Error', SUCCESS: 'Éxito', ANUNCIO: 'Anuncio' };
    return labels[tipo] || tipo;
  }

  trackById(_: number, n: NotificacionAdminDTO): number { return n.id; }
}
