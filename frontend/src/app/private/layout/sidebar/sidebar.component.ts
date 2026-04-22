import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import type { Event as RouterEvent } from '@angular/router';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { IconComponent } from '../../../shared/components/ui/icon.component';
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
        url.startsWith('/expedientes') || 
        url.startsWith('/inspecciones') || 
        url.startsWith('/examenes')) {
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
             url.startsWith('/tipo-tramite-solicitante') ||
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

  // Alternar notificaciones
  toggleNotifications(): void {
    this.notificationsEnabled.update(v => !v);
  }
}
