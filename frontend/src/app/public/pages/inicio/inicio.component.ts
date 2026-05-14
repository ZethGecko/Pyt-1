import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { ImagenSitioService, ImagenSitio } from '../../../shared/services/imagen-sitio.service';
import { Subscription } from 'rxjs';
import { PublicNavbarComponent } from '../../../public/components/public-navbar/public-navbar.component';

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
  imports: [CommonModule, RouterLink, IconComponent, PublicNavbarComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authState = inject(AuthStateService);
  private imagenSitioService = inject(ImagenSitioService);
  
  title = 'Sistema de Gestión de Transporte';
  
  // Map to store image URLs by ubicacion key
  imagenes: Map<string, ImagenSitio> = new Map();
  private subscription?: Subscription;

  ngOnInit(): void {
    if (this.authState.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
    this.cargarImagenes();
  }
  
  cargarImagenes(): void {
    this.imagenSitioService.listarTodas().subscribe({
      next: (data) => {
        this.imagenes.clear();
        data.forEach(img => {
          const downloadUrl = `/api/imagenes-sitio/${img.id}/download`;
          this.imagenes.set(img.ubicacion, { ...img, url: downloadUrl });
        });
      },
      error: (err) => {
        console.error('Error cargando imágenes:', err);
      }
    });
  }
  
  getImagenUrl(ubicacion: string): string | null {
    return this.imagenes.get(ubicacion)?.url || null;
  }
  
  tieneImagen(ubicacion: string): boolean {
    return !!this.imagenes.get(ubicacion);
  }
  
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
