import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { signal } from '@angular/core';
import { SidebarComponent } from './private/layout/sidebar/sidebar.component';
import { AuthStateService } from './core/auth/state/auth.state';
import { AuthService } from './core/auth/services/auth.service';
import { AuthNotificationService, AuthNotification } from './core/auth/services/auth-notification.service';
import { NotificationContainerComponent } from './shared/components/notification-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NotificationContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private authNotificationService = inject(AuthNotificationService);
  authState = inject(AuthStateService);
  private tokenCheckSubscription?: Subscription;

  showSidebar = true;
  isSidebarOpen = true;
  showNotificationPanel = signal(false);

   ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentRoute = event.urlAfterRedirects;
      this.showSidebar = this.authState.isLoggedIn() &&
                          !['/auth/login', '/auth/register'].includes(currentRoute);
    });

    // Check authentication status on app start
    if (!this.authState.isLoggedIn()) {
      // No valid token, redirect to login ONLY if accessing a private route
      const currentUrl = this.router.url;
      const pathWithoutQuery = currentUrl.split('?')[0];
      const publicRoutes = ['/', '/seguimiento', '/publicaciones', '/busqueda-rutas'];
      const isPublicRoute = publicRoutes.includes(pathWithoutQuery);
      
      if (!isPublicRoute && !currentUrl.startsWith('/auth/')) {
        console.log('[AppComponent] No valid authentication, redirecting to login');
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: currentUrl }
        });
      }
    } else {
      // Validate token with backend
      this.authService.validateToken().subscribe({
        error: (error) => {
          console.log('[AppComponent] Token validation failed on startup:', error);
          this.logout();
        }
      });

      // Iniciar servicio de notificaciones autenticadas (ya hay token en storage)
      this.authNotificationService.start();
      // Load notifications badge count on startup
      this.authNotificationService.cargar().then(() => {}).catch(() => {});
    }

    // Periodic token validation every 5 minutes
    this.tokenCheckSubscription = interval(300000).pipe(
      filter(() => this.authState.isLoggedIn())
    ).subscribe(() => {
      this.authService.validateToken().subscribe({
        error: (error) => {
          console.log('[AppComponent] Periodic token validation failed:', error);
          this.logout();
        }
      });
    });
  }

  toggleNotifyPanel(): void {
    this.showNotificationPanel.update(v => !v);
    if (this.showNotificationPanel()) {
      this.authNotificationService.cargar().then(() => {}).catch(() => {});
    }
  }

  /** Formatea una fecha ISO o null a texto compacto */
  formatNotifDate(value: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }

  loadingNotifications(): boolean {
    return this.authNotificationService.cargando();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnDestroy(): void {
    this.tokenCheckSubscription?.unsubscribe();
  }

   logout(): void {
     this.authService.logout();
     this.router.navigate(['/']);
   }
}