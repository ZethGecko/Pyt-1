import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionesAdminService, PublicacionAdminDTO, PublicacionCreateDTO } from './publicaciones-admin.service';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { NotificationService } from '../../../shared/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-publicaciones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicaciones-admin.component.html',
  styleUrls: ['./publicaciones-admin.component.scss']
})
export class PublicacionesAdminComponent implements OnInit {
  private pubService = inject(PublicacionesAdminService);
  private authState = inject(AuthStateService);
  private notificationService = inject(NotificationService);

  publicaciones: PublicacionAdminDTO[] = [];
  cargando = false;
  error: string | null = null;

  // Filtros
  filtroTitulo = '';
  filtroTipo = '';
  filtroEstado = '';

  // Estadísticas
  get total(): number { return this.publicaciones.length; }
  get publicadas(): number { return this.publicaciones.filter(p => 'PUBLICADO' === p.estado).length; }
  get borradores(): number { return this.publicaciones.filter(p => 'BORRADOR' === p.estado).length; }
  get archivadas(): number { return this.publicaciones.filter(p => 'ARCHIVADO' === p.estado).length; }

  // Modal crear/editar
  mostrarModal = false;
  editando = false;
  pubEditId: number | null = null;
  form: PublicacionCreateDTO = {
    tipoPublicacion: 'Normativa',
    titulo: '',
    contenido: '',
    paraTodos: true,
  };

  readonly tiposPublicacion = ['Normativa', 'Anuncio', 'Comunicado', 'Evento', 'Aviso'] as const;

  ngOnInit(): void { this.cargarPublicaciones(); }

  cargarPublicaciones(): void {
    this.cargando = true;
    this.error = null;
    forkJoin({
      publicaciones: this.pubService.listarTodas()
    }).subscribe({
      next: ({ publicaciones }) => {
        this.publicaciones = publicaciones;
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar publicaciones: ' + (err?.error?.message || err?.message || 'desconocido');
        this.cargando = false;
      }
    });
  }

  get publicacionesFiltradas(): PublicacionAdminDTO[] {
    return this.publicaciones.filter(p => {
      const coincideTitulo = !this.filtroTitulo || p.titulo.toLowerCase().includes(this.filtroTitulo.toLowerCase());
      const coincideTipo = !this.filtroTipo || p.tipoPublicacion === this.filtroTipo;
      const coincideEstado = !this.filtroEstado || p.estado === this.filtroEstado;
      return coincideTitulo && coincideTipo && coincideEstado;
    });
  }

  // ── Modal ──────────────────────────────────────────
  abrirModalCrear(): void {
    this.editando = false; this.pubEditId = null;
    this.form = { tipoPublicacion: 'Normativa', titulo: '', contenido: '', paraTodos: true };
    this.mostrarModal = true;
  }

   abrirModalEditar(pub: PublicacionAdminDTO): void {
    this.editando = true; this.pubEditId = pub.idPublicacion;
    this.form = {
      tipoPublicacion: pub.tipoPublicacion,
      titulo: pub.titulo,
      contenido: pub.contenido,
      estado: pub.estado,
      paraTodos: pub.paraTodos ?? true,
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void { this.mostrarModal = false; this.editando = false; this.pubEditId = null; }

  guardar(): void {
    if (!this.form.titulo.trim() || !this.form.contenido.trim()) {
      this.notificationService.warning('Título y contenido son obligatorios'); return;
    }
    const req = this.editando && this.pubEditId !== null
      ? this.pubService.actualizar(this.pubEditId, { ...this.form })
      : this.pubService.crear(this.form);

    req.subscribe({
      next: () => {
        this.notificationService.success(this.editando ? 'Publicación actualizada correctamente' : 'Publicación creada correctamente');
        this.cerrarModal(); this.cargarPublicaciones();
      },
      error: (e: any) => {
        this.notificationService.error('Error: ' + (e?.error?.message || e?.message || 'desconocido'));
      }
    });
  }

  // ── Acciones ───────────────────────────────────────
  publicar(pub: PublicacionAdminDTO): void {
    this.pubService.publicar(pub.idPublicacion).subscribe({
      next: () => { this.notificationService.success('Publicación publicada'); this.cargarPublicaciones(); },
      error: (e: any) => { this.notificationService.error('Error al publicar'); }
    });
  }

  archivar(pub: PublicacionAdminDTO): void {
    this.pubService.archivar(pub.idPublicacion).subscribe({
      next: () => { this.notificationService.success('Publicación archivada'); this.cargarPublicaciones(); },
      error: (e: any) => { this.notificationService.error('Error al archivar'); }
    });
  }

  desarchivar(pub: PublicacionAdminDTO): void {
    this.pubService.desarchivar(pub.idPublicacion).subscribe({
      next: () => { this.notificationService.success('Publicación desarchivada'); this.cargarPublicaciones(); },
      error: (e: any) => { this.notificationService.error('Error al desarchivar'); }
    });
  }

  eliminar(pub: PublicacionAdminDTO): void {
    if (!confirm(`¿Eliminar la publicación "${pub.titulo}"?`)) return;
    this.pubService.eliminar(pub.idPublicacion).subscribe({
      next: () => { this.notificationService.success('Publicación eliminada'); this.cargarPublicaciones(); },
      error: (e: any) => { this.notificationService.error('Error al eliminar'); }
    });
  }

  limpiarFiltros(): void {
    this.filtroTitulo = ''; this.filtroTipo = ''; this.filtroEstado = '';
  }

  // ── Helpers ────────────────────────────────────────
  getTipoClass(tipo: string): string {
    const clases: Record<string, string> = { 'Normativa': 'bg-blue-100 text-blue-700', 'Anuncio': 'bg-purple-100 text-purple-700', 'Comunicado': 'bg-green-100 text-green-700', 'Evento': 'bg-orange-100 text-orange-700', 'Aviso': 'bg-yellow-100 text-yellow-700' };
    return clases[tipo] || 'bg-gray-100 text-gray-700';
  }

  getTipoLabel(tipo: string): string { return tipo; }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = { PUBLICADO: 'Publicado', BORRADOR: 'Borrador', ARCHIVADO: 'Archivado' };
    return labels[estado] || estado;
  }

  getEstadoClass(estado: string): string {
    const clases: Record<string, string> = { PUBLICADO: 'status-active', BORRADOR: 'status-draft', ARCHIVADO: 'status-archived' };
    return clases[estado] || '';
  }

  trackById(_: number, p: PublicacionAdminDTO): number { return p.idPublicacion; }
}
