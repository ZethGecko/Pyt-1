import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface NotificacionEnriquecida {
  id: number;
  tipoNotificacion: string;
  asunto: string;
  mensaje: string;
  estado: string;
  fechaCreacion: string;
  fechaLeida: string | null;
  prioridad: number;
  accionRequerida: string | null;
  fechaLimite: string | null;
  // Información relacionada
  tramiteId: number | null;
  tramiteNumero: string | null;
  usuarioRemitenteId: number | null;
  usuarioRemitenteNombre: string | null;
  usuarioDestinatarioId: number;
  usuarioDestinatarioNombre: string;
  departamentoDestinoId: number | null;
  departamentoDestinoNombre: string | null;
}

export interface NotificacionPage {
  content: NotificacionEnriquecida[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface NotificacionStats {
  derivacion: number;
  pendiente: number;
  alerta: number;
  recordatorio: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/notificaciones`;

  // Signals for reactive state
  private notificacionesSubject = new BehaviorSubject<NotificacionEnriquecida[]>([]);
  private pendientesSubject = new BehaviorSubject<NotificacionEnriquecida[]>([]);
  private urgentesSubject = new BehaviorSubject<NotificacionEnriquecida[]>([]);
  private statsSubject = new BehaviorSubject<NotificacionStats | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  notificaciones$ = this.notificacionesSubject.asObservable();
  pendientes$ = this.pendientesSubject.asObservable();
  urgentes$ = this.urgentesSubject.asObservable();
  stats$ = this.statsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  // Get user ID from auth state (you may need to adjust this based on your auth implementation)
  private getCurrentUserId(): number {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.idUsuario || 1;
    }
    return 1; // Default fallback
  }

  /**
   * Get all notifications for current user with pagination
   */
  getNotificaciones(page: number = 0, size: number = 20): Observable<NotificacionPage> {
    this.loadingSubject.next(true);
    const userId = this.getCurrentUserId();
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'fechaCreacion,desc');

    return this.http.get<NotificacionPage>(`${this.baseUrl}/usuario/${userId}`, { params }).pipe(
      tap(response => {
        this.notificacionesSubject.next(response.content);
        this.loadingSubject.next(false);
      })
    );
  }

  /**
   * Get pending notifications for current user
   */
  getPendientes(): Observable<NotificacionEnriquecida[]> {
    const userId = this.getCurrentUserId();
    return this.http.get<NotificacionEnriquecida[]>(`${this.baseUrl}/usuario/${userId}/pendientes`).pipe(
      tap(notificaciones => {
        this.pendientesSubject.next(notificaciones);
      })
    );
  }

  /**
   * Get urgent notifications for current user
   */
  getUrgentes(): Observable<NotificacionEnriquecida[]> {
    const userId = this.getCurrentUserId();
    return this.http.get<NotificacionEnriquecida[]>(`${this.baseUrl}/usuario/${userId}/urgentes`).pipe(
      tap(notificaciones => {
        this.urgentesSubject.next(notificaciones);
      })
    );
  }

  /**
   * Get notification statistics by type
   */
  getStats(): Observable<NotificacionStats> {
    const userId = this.getCurrentUserId();
    return this.http.get<NotificacionStats>(`${this.baseUrl}/usuario/${userId}/estadisticas-tipo`).pipe(
      tap(stats => {
        this.statsSubject.next(stats);
      })
    );
  }

  /**
   * Count pending notifications
   */
  getCountPendientes(): Observable<number> {
    const userId = this.getCurrentUserId();
    return this.http.get<number>(`${this.baseUrl}/usuario/${userId}/contar-pendientes`);
  }

  /**
   * Mark notification as read
   */
  marcarComoLeida(notificacionId: number): Observable<void> {
    const userId = this.getCurrentUserId();
    return this.http.put<void>(`${this.baseUrl}/${notificacionId}/marcar-leida`, {}, { 
      params: new HttpParams().set('usuarioId', userId.toString()) 
    });
  }

  /**
   * Mark multiple notifications as read
   */
  marcarComoLeidaMultiple(notificacionIds: number[]): Observable<void> {
    const userId = this.getCurrentUserId();
    return this.http.put<void>(`${this.baseUrl}/marcar-leida-multiple`, notificacionIds, {
      params: new HttpParams().set('usuarioId', userId.toString())
    });
  }

  /**
   * Archive notification
   */
  archivarNotificacion(notificacionId: number): Observable<void> {
    const userId = this.getCurrentUserId();
    return this.http.put<void>(`${this.baseUrl}/${notificacionId}/archivar`, {}, {
      params: new HttpParams().set('usuarioId', userId.toString())
    });
  }

  /**
   * Get notifications by tramite
   */
  getNotificacionesPorTramite(tramiteId: number): Observable<NotificacionEnriquecida[]> {
    return this.http.get<NotificacionEnriquecida[]>(`${this.baseUrl}/tramite/${tramiteId}`);
  }

  /**
   * Get notification by ID
   */
  getNotificacionById(id: number): Observable<NotificacionEnriquecida> {
    return this.http.get<NotificacionEnriquecida>(`${this.baseUrl}/${id}`);
  }

  /**
   * Check if user has pending notifications
   */
  tienePendientes(): Observable<boolean> {
    const userId = this.getCurrentUserId();
    return this.http.get<boolean>(`${this.baseUrl}/usuario/${userId}/tiene-pendientes`);
  }

  /**
   * Check if user has urgent notifications
   */
  tieneUrgentes(): Observable<boolean> {
    const userId = this.getCurrentUserId();
    return this.http.get<boolean>(`${this.baseUrl}/usuario/${userId}/tiene-urgentes`);
  }

  // Helper methods for template
  getTipoIcon(tipo: string | null): string {
    if (!tipo) return 'bell';
    switch (tipo) {
      case 'derivacion': return 'repeat';
      case 'pendiente': return 'clock';
      case 'alerta': return 'alert-triangle';
      case 'recordatorio': return 'bell';
      default: return 'bell';
    }
  }

  getTipoLabel(tipo: string | null): string {
    if (!tipo) return 'Notificación';
    switch (tipo) {
      case 'derivacion': return 'Derivación';
      case 'pendiente': return 'Pendiente';
      case 'alerta': return 'Alerta';
      case 'recordatorio': return 'Recordatorio';
      default: return tipo;
    }
  }

  getPrioridadClass(prioridad: number | null): string {
    if (!prioridad) return 'bg-gray-100 text-gray-600';
    switch (prioridad) {
      case 3: return 'bg-red-100 text-red-700'; // Alta
      case 2: return 'bg-yellow-100 text-yellow-700'; // Media
      case 1: return 'bg-blue-100 text-blue-700'; // Baja
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getEstadoClass(estado: string | null): string {
    if (!estado) return 'bg-gray-100 text-gray-600';
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'leida': return 'bg-blue-100 text-blue-700';
      case 'archivada': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getEstadoLabel(estado: string | null): string {
    if (!estado) return 'Desconocido';
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'leida': return 'Leída';
      case 'archivada': return 'Archivada';
      default: return estado;
    }
  }
}
