import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface AuditLog {
  registroId: number;
  tablaAfectada: string;
  accion: string;
  tipoAccion?: string;
  fechaAccion: string;
  usuario: string;
  descripcion: string;
}

export interface AuditLogResponse {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditLogDetail {
  tabla?: string;
  registroId?: number;
  revision?: number;
  usuario?: string;
  accion?: string;
  tipoAccion?: string;
  fechaAccion?: string;
  datosAnteriores?: any[];
  datosNuevos?: any[];
  resumenDatos?: any;
  error?: string;
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss']
})
export class AuditoriaComponent implements OnInit {
  logs: AuditLog[] = [];
  loading = true;
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  filtroTabla = '';
  filtroUsuario = '';
  filtroAccion = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  expandedLogs = new Set<number>();
  loadingDetail = false;
  detailFor: AuditLog | null = null;
  detailData: AuditLogDetail | null = null;
  detailError: string | null = null;

  stats = { totalRegistros: 0, creaciones: 0, modificaciones: 0, eliminaciones: 0 };

  constructor(
    private notificationService: NotificationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.loading = true;
    this.detailFor = null;
    this.detailData = null;
    this.detailError = null;

    const params: any = { page: this.page, size: this.size };
    if (this.filtroTabla) params.tabla = this.filtroTabla;
    if (this.filtroUsuario) params.usuario = this.filtroUsuario;
    if (this.filtroAccion) params.accion = this.filtroAccion;
    if (this.filtroFechaDesde) params.fechaDesde = this.filtroFechaDesde;
    if (this.filtroFechaHasta) params.fechaHasta = this.filtroFechaHasta;

    this.http.get<AuditLogResponse>(`${environment.apiUrl}/audit`, { params }).subscribe({
      next: (response: AuditLogResponse) => {
        const content = response.content || [];
        this.logs = content;
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.actualizarStats(content);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando auditoría:', err);
        this.notificationService.error('Error al cargar registros de auditoría', 'Error');
        this.loading = false;
      }
    });
  }

  cambiarPagina(page: number): void {
    this.page = page;
    this.cargarLogs();
  }

  limpiarFiltros(): void {
    this.filtroTabla = '';
    this.filtroUsuario = '';
    this.filtroAccion = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.page = 0;
    this.cargarLogs();
  }

  toggleLogExpand(log: AuditLog): void {
    if (this.expandedLogs.has(log.registroId) && this.detailFor === log) {
      this.expandedLogs.delete(log.registroId);
      this.detailFor = null;
      this.detailData = null;
      this.detailError = null;
      return;
    }

    this.expandedLogs.clear();
    this.expandedLogs.add(log.registroId);
    this.detailFor = log;
    this.detailData = null;
    this.detailError = null;
    this.cargarDetalle(log);
  }

  isExpanded(log: AuditLog): boolean {
    return this.expandedLogs.has(log.registroId);
  }

  cargarDetalle(log: AuditLog): void {
    if (!log.tablaAfectada || !log.registroId) {
      this.detailError = 'Registro inválido para detalle';
      return;
    }

    this.loadingDetail = true;
    this.detailError = null;

    const tabla = log.tablaAfectada.toLowerCase();
    const id = encodeURIComponent(String(log.registroId));

    this.http.get<AuditLogDetail>(`${environment.apiUrl}/audit/${tabla}/${id}/detalle`).subscribe({
      next: (res) => {
        this.detailData = res;
        this.loadingDetail = false;
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.detailError = 'No se pudo cargar el detalle de este registro';
        this.loadingDetail = false;
      }
    });
  }

  getAccionLabel(accion: string): string {
    const labels: Record<string, string> = {
      CREACION: 'Creación',
      MODIFICACION: 'Modificación',
      ELIMINACION: 'Eliminación',
      CREACIÓN: 'Creación',
      MODIFICACIÓN: 'Modificación',
      ELIMINACIÓN: 'Eliminación'
    };
    return labels[accion.toUpperCase()] || accion;
  }

  getAccionBadgeClass(accion: string): string {
    const key = accion.toUpperCase();
    switch (key) {
      case 'CREACION':
      case 'CREACIÓN':
        return 'badge badge-creation';
      case 'MODIFICACION':
      case 'MODIFICACIÓN':
        return 'badge badge-update';
      case 'ELIMINACION':
      case 'ELIMINACIÓN':
        return 'badge badge-delete';
      default:
        return 'badge badge-default';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('es-ES');
    } catch {
      return String(date);
    }
  }

  get usuarioActual(): string {
    return localStorage.getItem('currentUser') || 'Sistema';
  }

  getCurrentTipoAccion(log: AuditLog): string {
    return (log.tipoAccion || log.accion || '').toUpperCase();
  }

  private actualizarStats(content: AuditLog[]): void {
    let creaciones = 0;
    let modificaciones = 0;
    let eliminaciones = 0;
    for (const log of content) {
      const tipo = (log.tipoAccion || log.accion || '').toUpperCase();
      if (tipo.includes('CREACION') || tipo.includes('CREACIÓN')) creaciones++;
      else if (tipo.includes('MODIFICACION') || tipo.includes('MODIFICACIÓN')) modificaciones++;
      else if (tipo.includes('ELIMINACION') || tipo.includes('ELIMINACIÓN')) eliminaciones++;
    }
    this.stats = {
      totalRegistros: content.length,
      creaciones,
      modificaciones,
      eliminaciones
    };
  }
}
