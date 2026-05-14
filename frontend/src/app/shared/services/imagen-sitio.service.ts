import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImagenSitio {
  id: number;
  ubicacion: string;
  url: string;
  descripcion?: string;
  fechaSubida: string;
  tipoArchivo: string;
  tamanoArchivo: number;
}

export interface UbicacionConfig {
  key: string;
  label: string;
  description: string;
  recommendedDimensions?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagenSitioService {
   private apiUrl = `${environment.apiUrl}/imagenes-sitio`;
  
  constructor(private http: HttpClient) {}
  
  uploadImagen(ubicacion: string, archivo: File, descripcion?: string): Observable<ImagenSitio> {
    const formData = new FormData();
    formData.append('ubicacion', ubicacion);
    formData.append('archivo', archivo);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    return this.http.post<ImagenSitio>(`${this.apiUrl}/upload`, formData);
  }
  
  listarTodas(): Observable<ImagenSitio[]> {
    return this.http.get<ImagenSitio[]>(`${this.apiUrl}`);
  }
  
  obtenerPorUbicacion(ubicacion: string): Observable<ImagenSitio | null> {
    return this.http.get<ImagenSitio>(`${this.apiUrl}/${ubicacion}`);
  }
  
  eliminarImagen(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
  getUbicacionesConfig(): UbicacionConfig[] {
    return [
      // Navbar
      {
        key: 'HEADER_LOGO_LEFT',
        label: 'Logo del Encabezado (Navbar)',
        description: 'Imagen del logo que aparece en la barra de navegación superior',
        recommendedDimensions: '100x100 px (recomendado)'
      },
      {
        key: 'HEADER_LOGO_RIGHT',
        label: 'Logo Derecho del Encabezado',
        description: 'Segundo logo en la barra de navegación (opcional)',
        recommendedDimensions: '100x100 px (recomendado)'
      },
      // Hero
      {
        key: 'HERO_BLUE_BOX',
        label: 'Cuadro Azul del Hero (Inicio)',
        description: 'Imagen dentro del recuadro azul de la sección principal',
        recommendedDimensions: '400x300 px (recomendado)'
      },
      {
        key: 'HERO_TITLE_LEFT',
        label: 'Título Izquierdo (Hero Inicio)',
        description: 'Imagen en el espacio en blanco a la izquierda del título "Sistema Integral"',
        recommendedDimensions: '300x200 px (recomendado)'
      },
      {
        key: 'HERO_TITLE_RIGHT',
        label: 'Título Derecho (Hero Inicio)',
        description: 'Imagen en el espacio en blanco a la derecha de "Gestión de Transporte"',
        recommendedDimensions: '300x200 px (recomendado)'
      },
      // Páginas públicas - Encabezados
      {
        key: 'PAGE_HEADER_SEGUIMIENTO',
        label: 'Encabezado - Seguimiento de Trámites',
        description: 'Imagen/logo en el header de la página de seguimiento',
        recommendedDimensions: '80x80 px (recomendado)'
      },
      {
        key: 'PAGE_HEADER_PUBLICACIONES',
        label: 'Encabezado - Publicaciones',
        description: 'Imagen/logo en el header de la página de publicaciones',
        recommendedDimensions: '80x80 px (recomendado)'
      },
      {
        key: 'PAGE_HEADER_BUSQUEDA_RUTAS',
        label: 'Encabezado - Búsqueda de Rutas',
        description: 'Imagen/logo en el header de la página de búsqueda de rutas',
        recommendedDimensions: '80x80 px (recomendado)'
      },
      {
        key: 'PAGE_HEADER_TRAMITES',
        label: 'Encabezado - Trámites Públicos',
        description: 'Imagen/logo en el header de la página de trámites',
        recommendedDimensions: '80x80 px (recomendado)'
      },
      {
        key: 'PAGE_HEADER_CONSULTA',
        label: 'Encabezado - Consulta de Trámites',
        description: 'Imagen/logo en el header de la página de consulta',
        recommendedDimensions: '80x80 px (recomendado)'
      },
      // Footer
      {
        key: 'FOOTER_LOGO',
        label: 'Logo del Footer',
        description: 'Logo pequeño en la sección de pie de página',
        recommendedDimensions: '80x80 px (recomendado)'
      },
      {
        key: 'FOOTER_BANNER',
        label: 'Banner del Footer',
        description: 'Imagen decorativa en la sección de pie de página',
        recommendedDimensions: '1200x200 px (recomendado)'
      }
    ];
  }
}
