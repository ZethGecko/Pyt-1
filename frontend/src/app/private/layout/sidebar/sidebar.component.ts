import { Component, inject, signal, OnInit, OnDestroy, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import type { Event as RouterEvent } from '@angular/router';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { AuthNotificationService, AuthNotification } from '../../../core/auth/services/auth-notification.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface MenuState {
  inicio: boolean;
  gestion: boolean;
  configuracion: boolean;
  preferencias: boolean;
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

   // Estado de menús expandibles
   expandedMenus = signal<MenuState>({
     inicio: true,
     gestion: true,
     configuracion: false,
     preferencias: false
   });

   // Preferencias del usuario
   isDarkMode = signal(false);
   isCompactMode = signal(false);
   notificationsEnabled = signal(true);

    // Panel de notificaciones
    showNotificationPanel = signal(false);
    loadingNotificaciones = signal(false);

    // Observable reactivo — se actualiza solo por SSE o polling (no NgZone needed)
    notificaciones$ = this.authNotificationService.notificaciones;

    notificacionesRecientes = computed(() => {
      // Para ordenar: convertir signal a array; AsyncPipe maneja la reactividad en el template
      const all = this.authNotificationService.notificaciones()
        .filter(n => n.activo)
        .sort((a, b) => new Date(b.fechaPublicacion || b.fechaCreacion || '').getTime() -
                        new Date(a.fechaPublicacion || a.fechaCreacion || '').getTime());
      return all.slice(0, 10);
    });

    unreadCount = computed(() => {
       return this.notificacionesRecientes().filter(n => !n.leido).length;
    });

    ngOnInit(): void {
      // Expandir menú según la ruta actual
      this.updateExpandedMenus(this.router.url);

      // Escuchar cambios de ruta
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      ).subscribe(event => {
        this.updateExpandedMenus((event as NavigationEnd).urlAfterRedirects);
      });

      // Precargar notificaciones al iniciar (SSE ya conecta automáticamente en el servicio)
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
    let preferencias = false;

    // Rutas de Inicio (páginas públicas)
    if (url === '/' || 
        url.startsWith('/publicaciones') || 
        url.startsWith('/busqueda-rutas') || 
        url.startsWith('/seguimiento') ||
        url.startsWith('/auth')) {
      inicio = true;
    }
    // Rutas de Gestión
    else if (url.startsWith('/tramites') || 
        url.startsWith('/empresas') || 
        url.startsWith('/vehiculos') || 
        url.startsWith('/inspecciones') || 
        url.startsWith('/examenes') ||
        url.startsWith('/admin/publicaciones') ||
        url.startsWith('/admin/notificaciones')) {
      gestion = true;
    }
    // Rutas de Configuración
    else if (url.startsWith('/configuracion') ||
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
    // Rutas de Preferencias (si aplica)
    else if (url.startsWith('/preferencias') || url === '/') {
      preferencias = true;
    }

    this.expandedMenus.set({ inicio, gestion, configuracion, preferencias });
  }

  // Alternar menú expandible
  toggleMenu(menu: keyof MenuState): void {
    this.expandedMenus.update(current => ({
      ...current,
      [menu]: !current[menu]
    }));
  }

  // Obtener inicial del usuario
  getUserInitial(): string {
    const username = this.authState.currentUser()?.username || 'U';
    return username.charAt(0).toUpperCase();
  }

  // Alternar tema oscuro/claro
  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    document.documentElement.classList.toggle('dark');
  }

  // Alternar modo compacto
  toggleCompactMode(): void {
    this.isCompactMode.update(v => !v);
    document.body.classList.toggle('compact-mode');
  }

  // Alternar notificaciones (preferencia toggle)
  toggleNotifications(): void {
    this.notificationsEnabled.update(v => !v);
  }

  // ── Panel de notificaciones ──────────────────────────────────

  toggleNotificationPanel(): void {
    this.showNotificationPanel.update(v => !v);
    if (this.showNotificationPanel()) {
      this.cargarNotificaciones();
    }
  }

   async cargarNotificaciones(): Promise<void> {
    this.loadingNotificaciones.set(true);
    try {
      // cargarTodo() actualiza el cache del servicio que el | async lee directamente
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

   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-panel') && !target.closest('.bell-btn')) {
      this.showNotificationPanel.set(false);
    }
  }
}
