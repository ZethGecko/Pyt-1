import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { SidebarComponent } from './private/layout/sidebar/sidebar.component';
import { AuthStateService } from './core/auth/state/auth.state';
import { AuthService } from './core/auth/services/auth.service';
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
  authState = inject(AuthStateService);
  private tokenCheckSubscription?: Subscription;

  showSidebar = true;
  isSidebarOpen = true;

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
      // No valid token, redirect to login if not already there
      const currentUrl = this.router.url;
      if (!currentUrl.startsWith('/auth/')) {
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

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnDestroy(): void {
    this.tokenCheckSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}