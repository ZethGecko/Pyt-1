import { Injectable, signal, computed, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@env';
import { Subscription, interval, throwError, timer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface AuthNotification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  fechaCreacion: string | null;
  fechaPublicacion: string | null;
  fechaExpiracion: string | null;
  activo: boolean;
  prioridad: number;
  urlDestino: string | null;
  paraTodos: boolean;
  usuarioCreadorUsername: string;
  usuarioDestinoUsername: string | null;
  leido?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthNotificationService implements OnDestroy {
  private readonly api = `${environment.apiUrl}/auth/notificaciones`;
  private readonly SSE_URL = `${environment.apiUrl}/auth/notificaciones/stream`;
  private readonly POLL_INTERVAL_MS = 15_000; // 15 s polling fallback

  private isBrowser = false;
  private pollSub: Subscription | null = null;
  private sseEventSource: EventSource | null = null;
  private reconnectTimer: any = null;
  private _token: string | null = null;
  private _lastSeenId: number = 0;

  // Raw cache ------------------------------------------------
  private _notificaciones = signal<AuthNotification[]>([]);
  private _contador  = signal<number>(0);
  private _cargando  = signal<boolean>(false);
  private _error     = signal<string | null>(null);

  // Public reactive API --------------------------------------
  readonly notificaciones          = this._notificaciones.asReadonly();
  readonly contador               = this._contador.asReadonly();
  readonly cargando               = this._cargando.asReadonly();
  readonly error                  = this._error.asReadonly();

  /** Notificaciones personales (paraTodos=false & usuarioDestino=me) */
  notificacionesPersonales = computed(() =>
    this._notificaciones().filter(n => !n.paraTodos)
  );

  /** Notificaciones generales (paraTodos=true) */
  notificacionesGenerales = computed(() =>
    this._notificaciones().filter(n => n.paraTodos)
  );

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Constructor no arranca nada — start() debe ser llamado explícitamente
  }

  start(): void {
    this.refreshToken();
    if (this.isBrowser && this._token) {
      this.startPolling();
      timer(2_000).subscribe(() => {
        this.connectSSE();
      });
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.stopSSE();
  }

  // ── Helpers ───────────────────────────────────────────────

  private get authUrl(): string {
    const sep = this.SSE_URL.includes('?') ? '&' : '?';
    return this._token ? `${this.SSE_URL}${sep}token=${encodeURIComponent(this._token)}` : this.SSE_URL;
  }

  private refreshToken(): void {
    this._token = localStorage.getItem('access_token');
  }

  private updateCounter(): void {
    const items = this._notificaciones();
    this._contador.set(items.filter(n => !n.leido).length);
  }

  private upsert(notif: AuthNotification): void {
    const current = this._notificaciones();
    const idx = current.findIndex(n => n.id === notif.id);
    let updated: AuthNotification[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...current[idx], ...notif, leido: notif.leido ?? current[idx].leido };
    } else {
      updated = [notif, ...current];
    }
    this._notificaciones.set(updated);
    this.updateCounter();
  }

  private remove(id: number): void {
    const updated = this._notificaciones().filter(n => n.id !== id);
    this._notificaciones.set(updated);
    this.updateCounter();
  }

  // ── SSE ───────────────────────────────────────────────────

  connectSSE(): void {
    if (!this.isBrowser) return;
    if (this.sseEventSource) {
      this.sseEventSource.close();
    }
    this.refreshToken();
    if (!this._token) {
      this.stopSSE();
      return;
    }
    const url = this.authUrl;
    console.log('[AuthNotificationService] Conectando SSE a:', url.replace(/token=[^&]+/, 'token=***'));
    this.sseEventSource = new EventSource(url);

    this.sseEventSource.addEventListener('notification', ((evt: MessageEvent) => {
      try {
        const notif: AuthNotification = JSON.parse(evt.data);
        console.log('[AuthNotificationService] SSE notification recibida:', notif.id, notif.titulo);
        this.upsert(notif);
      } catch (e) {
        console.warn('[AuthNotificationService] SSE parse error:', e);
      }
    }) as EventListener);

    this.sseEventSource.addEventListener('delete', ((evt: MessageEvent) => {
      try {
        const data: { id: number } = JSON.parse(evt.data);
        console.log('[AuthNotificationService] SSE delete recibida:', data.id);
        this.remove(data.id);
      } catch (e) {
        console.warn('[AuthNotificationService] SSE delete parse error:', e);
      }
    }) as EventListener);

    this.sseEventSource.addEventListener('ping', (() => {
      // heartbeat
    }) as EventListener);

    this.sseEventSource.onopen = () => {
      console.log('[AuthNotificationService] SSE conectado');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.sseEventSource.onerror = () => {
      console.warn('[AuthNotificationService] SSE error — reconectando en 5s');
      if (this.sseEventSource) {
        this.sseEventSource.close();
      }
      this.sseEventSource = null;
      this.reconnectTimer = setTimeout(() => this.connectSSE(), 5_000);
    };
  }

  private stopSSE(): void {
    if (this.sseEventSource) {
      this.sseEventSource.close();
      this.sseEventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ── Polling fallback ──────────────────────────────────────

  private startPolling(): void {
    this.stopPolling();
    this.pollSub = interval(this.POLL_INTERVAL_MS).pipe(
      catchError(err => {
        console.warn('[AuthNotificationService] Poll error:', err);
        return throwError(() => err);
      })
    ).subscribe(() => {
      this.silentRefresh();
    });
  }

  private stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = null;
    }
  }

  private async silentRefresh(): Promise<void> {
    try {
      const items = await this.http
        .get<AuthNotification[]>(`${this.api}/active`, {
          headers: this._token ? { Authorization: `Bearer ${this._token}` } : undefined
        })
        .toPromise()
        .then((data: any) => {
          let content: any[] = [];
          if (data && Array.isArray(data.content)) {
            content = data.content;
          } else if (Array.isArray(data)) {
            content = data;
          }
          return content.map((n: any): AuthNotification => ({
            id: n.id ?? 0,
            titulo: n.titulo ?? '',
            mensaje: n.mensaje ?? '',
            tipo: n.tipo ?? '',
            fechaCreacion: n.fechaCreacion ?? null,
            fechaPublicacion: n.fechaPublicacion ?? null,
            fechaExpiracion: n.fechaExpiracion ?? null,
            activo: n.activo ?? true,
            prioridad: n.prioridad ?? 0,
            urlDestino: n.urlDestino ?? null,
            paraTodos: n.paraTodos ?? false,
            usuarioCreadorUsername: n.usuarioCreadorUsername ?? '',
            usuarioDestinoUsername: n.usuarioDestinoUsername ?? null,
            leido: n.leido ?? false,
          }));
        })
        .catch((err: unknown) => {
          console.warn('[AuthNotificationService] silentRefresh GET /active error:', err);
          return [] as AuthNotification[];
        });

      let hasNew = false;
      const currentIds = new Set(this._notificaciones().map(n => n.id));

      for (const item of items) {
        if (!currentIds.has(item.id)) {
          console.log('[AuthNotificationService] silentRefresh: nueva notificación', item.id, item.titulo);
          this.upsert(item);
          hasNew = true;
        }
      }

      if (!hasNew) {
        this.updateCounter();
      }
    } catch {
      // silent
    }
  }

  // ── Fetch ──────────────────────────────────────────────────

  cargar(): Promise<AuthNotification[]> {
    this._cargando.set(true);
    this._error.set(null);
    return this.http.get<any>(`${this.api}/active`).toPromise()
      .then((data: any) => {
        let content: any[] = [];
        if (data && Array.isArray(data.content)) {
          content = data.content;
        } else if (Array.isArray(data)) {
          content = data;
        }
        console.log('[AuthNotificationService] GET /active —', content.length, 'notificaciones recibidas');
        const items: AuthNotification[] = content.map((n: any) => ({
          id:               n.id ?? 0,
          titulo:           n.titulo ?? '',
          mensaje:          n.mensaje ?? '',
          tipo:             n.tipo ?? '',
          fechaCreacion:    n.fechaCreacion ?? null,
          fechaPublicacion: n.fechaPublicacion ?? null,
          fechaExpiracion:  n.fechaExpiracion ?? null,
          activo:           n.activo ?? true,
          prioridad:        n.prioridad ?? 0,
          urlDestino:       n.urlDestino ?? null,
          paraTodos:        n.paraTodos ?? false,
          usuarioCreadorUsername: n.usuarioCreadorUsername ?? '',
          usuarioDestinoUsername: n.usuarioDestinoUsername ?? null,
          leido:            n.leido ?? false,
        }));
        if (items.length > 0) {
          this._lastSeenId = Math.max(...items.map(i => i.id));
        }
        this._notificaciones.set(items);
        this._contador.set(items.filter(n => !n.leido).length);
        this._cargando.set(false);
        return items;
      })
      .catch((err: unknown) => {
        const msg = (err as any)?.message ?? 'Error al cargar notificaciones';
        console.warn('[AuthNotificationService] GET /active error:', msg);
        this._error.set(msg);
        this._cargando.set(false);
        return [] as AuthNotification[];
      });
  }

  async marcarComoLeido(id: number): Promise<void> {
    try {
      await this.http.post(`${this.api}/${id}/leer`, {}).toPromise();
      const current = this._notificaciones();
      const updated = current.map(n => n.id === id ? { ...n, leido: true } : n);
      this._notificaciones.set(updated);
      this.updateCounter();
    } catch (err) {
      console.warn('[AuthNotificationService] Error marcando como leído:', err);
    }
  }

  // Convenience: carga feed (counter se deriva automáticamente del contenido)
  cargarTodo(): Promise<void> {
    return this.cargar().then(() => {});
  }
}
