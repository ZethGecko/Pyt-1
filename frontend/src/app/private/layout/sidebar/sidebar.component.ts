import { Component, inject, signal, OnInit, OnDestroy, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { AuthNotificationService, AuthNotification } from '../../../core/auth/services/auth-notification.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface MenuState {
  inicio: boolean;
  gestion: boolean;
  configuracion: boolean;
  auditoria: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  authState = inject(AuthStateService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private authNotificationService = inject(AuthNotificationService);

  expandedMenus = signal<MenuState>({
    inicio: true,
    gestion: true,
    configuracion: false,
    auditoria: false
  });

  showNotificationPanel = signal(false);
  loadingNotificaciones = signal(false);

  notificaciones$ = this.authNotificationService.notificaciones;

  notificacionesRecientes = computed(() => {
    const all = this.authNotificationService.notificaciones()
      .filter(n => n.activo)
      .sort((a, b) => new Date(b.fechaPublicacion || b.fechaCreacion || '').getTime() -
                      new Date(a.fechaPublicacion || a.fechaCreacion || '').getTime());
    return all.slice(0, 10);
  });

  unreadCount = computed(() => {
    return this.notificacionesRecientes().filter(n => !n.leido).length;
  });

  isSuperAdmin = computed(() => this.authState.userRole() === 'SUPER_ADMIN');

  isAdmin = computed(() => this.authState.userRole() === 'ADMIN');

  isAdminOrSuperAdmin = computed(() => this.isAdmin() || this.isSuperAdmin());

  ngOnInit(): void {
    this.updateExpandedMenus(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(event => {
      this.updateExpandedMenus((event as NavigationEnd).urlAfterRedirects);
    });

    this.authNotificationService.cargarTodo().then(() => {
      console.log('[Sidebar] Notificaciones precargadas via SSE/polling');
    }).catch(err => {
      console.warn('[Sidebar] Error precargando notificaciones:', err);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateExpandedMenus(url: string): void {
    let inicio = false;
    let gestion = false;
    let configuracion = false;
    let auditoria = false;

    if (url === '/' ||
        url.startsWith('/publicaciones') ||
        url.startsWith('/busqueda-rutas') ||
        url.startsWith('/seguimiento') ||
        url.startsWith('/auth')) {
      inicio = true;
    }

    if (url.startsWith('/tramites') ||
        url.startsWith('/empresas') ||
        url.startsWith('/vehiculos') ||
        url.startsWith('/inspecciones') ||
        url.startsWith('/examenes') ||
        url.startsWith('/admin/publicaciones') ||
        url.startsWith('/admin/notificaciones')) {
      gestion = true;
    }

    if (url.startsWith('/configuracion') ||
        url.startsWith('/tipos-transporte') ||
        url.startsWith('/tipos-tramite') ||
        url.startsWith('/tupac') ||
        url.startsWith('/departamentos') ||
        url.startsWith('/admin/users') ||
        url.startsWith('/admin/roles') ||
        url.startsWith('/admin/imagenes') ||
        url.startsWith('/requisitos-tupac')) {
      configuracion = true;
    }

    if (url.startsWith('/admin/auditoria')) {
      auditoria = true;
    }

    this.expandedMenus.set({ inicio, gestion, configuracion, auditoria });
  }

  toggleMenu(menu: keyof MenuState): void {
    this.expandedMenus.update(current => ({
      ...current,
      [menu]: !current[menu]
    }));
  }

  getUserInitial(): string {
    const username = this.authState.currentUser()?.username || 'U';
    return username.charAt(0).toUpperCase();
  }

  toggleNotificationPanel(): void {
    this.showNotificationPanel.update(v => !v);
    if (this.showNotificationPanel()) {
      this.cargarNotificaciones();
    }
  }

  async cargarNotificaciones(): Promise<void> {
    this.loadingNotificaciones.set(true);
    try {
      await this.authNotificationService.cargarTodo();
    } catch (err) {
      console.warn('[Sidebar] Error cargando notificaciones:', err);
    } finally {
      this.loadingNotificaciones.set(false);
    }
  }

  getNotificacionIcono(notif: AuthNotification): string {
    switch (notif.tipo) {
      case 'SUCCESS':
      case 'INFO':
        return 'check-circle';
      case 'WARNING':
        return 'alert-triangle';
      case 'ERROR':
        return 'alert-circle';
      case 'ANUNCIO':
        return 'megaphone';
      default:
        return 'bell';
    }
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  }

  async marcarComoLeido(notif: any): Promise<void> {
    if (notif.leido) return;
    await this.authNotificationService.marcarComoLeido(notif.id);
    notif.leido = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-panel') && !target.closest('.bell-btn')) {
      this.showNotificationPanel.set(false);
    }
  }
}
