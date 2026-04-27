import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { AuthStateService } from '../../../core/auth/state/auth.state';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {
  private router = inject(Router);
  private authState = inject(AuthStateService);

  title = 'Sistema de Gestión de Transporte';

   ngOnInit(): void {
     // Si está logueado, redirigir al dashboard privado (ya tiene sesión)
     if (this.authState.isLoggedIn()) {
       this.router.navigate(['/dashboard']);
     }
     // Si NO está logueado, se queda en la página pública (no hace nada)
   }
  
  menuItems: MenuItem[] = [
    {
      title: 'Buscar Rutas',
      description: 'Encuentra las mejores rutas de transporte según tu ubicación y destino',
      icon: 'route',
      route: '/busqueda-rutas',
      color: 'bg-blue-500'
    },
    {
      title: 'Publicaciones',
      description: 'Consulta las últimas noticias y comunicados oficiales',
      icon: 'megaphone',
      route: '/publicaciones',
      color: 'bg-green-500'
    },
    {
      title: 'Trámites',
      description: 'Información sobre todos los trámites disponibles',
      icon: 'file-text',
      route: '/tramites',
      color: 'bg-purple-500'
    },
    {
      title: 'Seguimiento',
      description: 'Consulta el estado de tus trámites en línea',
      icon: 'search',
      route: '/seguimiento',
      color: 'bg-orange-500'
    }
  ];

  features = [
    {
      icon: 'building',
      title: 'Gestión Empresarial',
      description: 'Administra empresas del sector transporte con todos sus datos y documentación.'
    },
    {
      icon: 'truck',
      title: 'Control de Vehículos',
      description: 'Registro y seguimiento de todos los vehículos con sus permisos y documentación.'
    },
    {
      icon: 'file-check',
      title: 'Trámites Digitales',
      description: 'Realiza y sigue tus trámites en línea de manera rápida y segura.'
    },
    {
      icon: 'shield-check',
      title: 'Seguridad Total',
      description: 'Sistema de permisos y roles para garantizar la seguridad de tus datos.'
    }
  ];
}
