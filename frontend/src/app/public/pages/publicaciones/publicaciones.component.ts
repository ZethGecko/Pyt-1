import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ImagenSitioService, ImagenSitio } from '../../../shared/services/imagen-sitio.service';
import { PublicNavbarComponent } from '../../../public/components/public-navbar/public-navbar.component';
import { HttpClient } from '@angular/common/http';
import { ModalComponent } from '../../../shared/components/ui/modal.component';

interface ApiPublicacion {
  id_publicacion: number;
  tipo_publicacion: string;
  titulo: string;
  contenido: string;
  estado: string;
  fecha_publicacion: string | null;
  fecha_creacion: string | null;
  tipo_tramite: string | null;
}

interface Publicacion {
  id: number;
  titulo: string;
  fecha: string;
  resumen: string;
  contenido: string;
  categoria: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicNavbarComponent, ModalComponent],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.scss']
})
export class PublicacionesComponent implements OnInit {
  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];
  filtroCategoria: string = '';
  cargando: boolean = false;

  imagenes: Map<string, ImagenSitio> = new Map();
  modalAbierto = false;
  publicacionSeleccionada: Publicacion | null = null;

  constructor(
    private imagenSitioService: ImagenSitioService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarPublicaciones();
    this.imagenSitioService.listarTodas().subscribe({
      next: (data) => {
        this.imagenes.clear();
        const apiBase = environment.apiUrl;
        data.forEach(img => {
          const downloadUrl = `${apiBase}/imagenes-sitio/${img.id}/download`;
          this.imagenes.set(img.ubicacion, { ...img, url: downloadUrl });
        });
      },
      error: (err) => console.error('Error cargando imágenes:', err)
    });
  }

  cargarPublicaciones(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/publicaciones/publicadas`).subscribe({
      next: (data) => {
        this.publicaciones = this.mapBackendToUI(data || []);
        this.publicacionesFiltradas = [...this.publicaciones];
        this.cargando = false;
      },
      error: (err) => {
        console.error('[PublicacionesComponent] Error al cargar publicaciones:', err);
        this.publicaciones = [];
        this.publicacionesFiltradas = [];
        this.cargando = false;
      }
    });
  }

  private mapBackendToUI(items: ApiPublicacion[]): Publicacion[] {
    return items.map(p => {
      const tipo = (p.tipo_publicacion || 'Comunicado').toLowerCase();
      const mapping: Record<string, { categoria: string; icono: string; color: string }> = {
        'normativa':    { categoria: 'Normativa', icono: 'file-text',      color: '#3b82f6' },
        'comunicado':  { categoria: 'Comunicado', icono: 'megaphone',      color: '#8b5cf6' },
        'evento':       { categoria: 'Evento',     icono: 'calendar',       color: '#10b981' },
        'aviso':        { categoria: 'Aviso',      icono: 'alert-circle',   color: '#f97316' },
        'anuncio':      { categoria: 'Anuncio',    icono: 'megaphone',      color: '#a855f7' },
      };
      const m = mapping[tipo] || { categoria: p.tipo_publicacion || 'Comunicado', icono: 'file-text', color: '#6b7280' };

      const fechaRaw = p.fecha_publicacion || p.fecha_creacion || '';
      const fecha = fechaRaw ? new Date(fechaRaw).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric'
      }) : '';

      const textoContenido = (p.contenido || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const resumen = textoContenido.length > 180 ? textoContenido.slice(0, 180) + '...' : textoContenido;

      return {
        id: p.id_publicacion,
        titulo: p.titulo,
        fecha,
        resumen: resumen || 'Sin descripción',
        contenido: textoContenido,
        categoria: m.categoria,
        icono: m.icono,
        color: m.color
      };
    });
  }

  filtrarPublicaciones(): void {
    this.publicacionesFiltradas = this.publicaciones.filter(publi => {
      return !this.filtroCategoria || publi.categoria === this.filtroCategoria;
    });
  }

  getCategoriaColor(categoria: string): string {
    const colores: Record<string, string> = {
      'Normativa': 'bg-blue-100 text-blue-700 border-blue-200',
      'Aviso': 'bg-orange-100 text-orange-700 border-orange-200',
      'Evento': 'bg-green-100 text-green-700 border-green-200',
      'Comunicado': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colores[categoria] || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  getCategoriaClass(categoria: string): string {
    return this.getCategoriaColor(categoria);
  }

   getIconoPath(icono: string): string {
     const iconos: Record<string, string> = {
       'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
       'alert-circle': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
       'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
       'megaphone': 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
       'alert-triangle': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
       'award': 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
     };
     return iconos[icono] || iconos['file-text'];
   }

  verMas(publicacion: Publicacion): void {
    const pubCompleta = this.publicaciones.find(p => p.id === publicacion.id);
    if (pubCompleta) {
      this.publicacionSeleccionada = pubCompleta;
      this.modalAbierto = true;
    }
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.publicacionSeleccionada = null;
  }

  getImagenUrl(ubicacion: string): string | null {
    return this.imagenes.get(ubicacion)?.url || null;
  }

   tieneImagen(ubicacion: string): boolean {
     return !!this.imagenes.get(ubicacion);
   }
}
