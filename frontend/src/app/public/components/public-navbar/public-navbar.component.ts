import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '@app/shared/components/ui/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <nav class="public-navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">
          <div class="brand-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="brand-text">MPSRJ - Transporte</span>
        </a>

        <div class="navbar-menu">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="navbar-menu-item"
              [title]="item.label">
              <app-icon [name]="item.icon" size="sm"></app-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </div>

        <div class="navbar-actions">
          <a routerLink="/auth/login" class="btn-login">
            <app-icon name="login" size="sm"></app-icon>
            Iniciar Sesión
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .public-navbar {
      background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
      padding: 0.75rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: white;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-icon svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .brand-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: white;
    }

    .navbar-menu {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .navbar-menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .navbar-menu-item:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .navbar-menu-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-weight: 600;
    }

    .navbar-menu-item app-icon {
      margin-right: 0.25rem;
    }

    .navbar-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-login {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-login:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    @media (max-width: 768px) {
      .navbar-container {
        flex-direction: column;
        gap: 0.75rem;
      }

      .navbar-menu {
        width: 100%;
        justify-content: center;
      }

      .navbar-menu-item {
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
      }

      .brand-text {
        font-size: 1.125rem;
      }
    }
  `]
})
export class PublicNavbarComponent implements OnInit {
  navItems: NavItem[] = [];

  ngOnInit(): void {
    this.navItems = [
      { label: 'Inicio', route: '/', icon: 'home' },
      { label: 'Rutas', route: '/busqueda-rutas', icon: 'route' },
      { label: 'Publicaciones', route: '/publicaciones', icon: 'megaphone' },
      { label: 'Trámites', route: '/tramites', icon: 'file-text' },
      { label: 'Seguimiento', route: '/seguimiento', icon: 'search' },
      { label: 'Inspecciones', route: '/inspecciones', icon: 'clipboard-check' }
    ];
  }
}
