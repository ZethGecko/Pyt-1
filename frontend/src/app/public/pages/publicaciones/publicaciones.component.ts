import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Publicacion {
  id: number;
  titulo: string;
  fecha: string;
  resumen: string;
  categoria: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.scss']
})
export class PublicacionesComponent {
  publicaciones: Publicacion[] = [
    {
      id: 1,
      titulo: 'Nuevo Reglamento de Transporte',
      fecha: '2024-01-15',
      resumen: 'Actualización del reglamento general de transporte terrestre. Se establecen nuevas normativas para la operación de vehículos de transporte público.',
      categoria: 'Normativa',
      icono: 'file-text',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      titulo: 'Plazo para Renovación de Permisos',
      fecha: '2024-01-10',
      resumen: 'Recordatorio del plazo para renovación de permisos de operación. Asegúrese de completar su trámite antes de la fecha límite.',
      categoria: 'Aviso',
      icono: 'alert-circle',
      color: 'bg-orange-500'
    },
    {
      id: 3,
      titulo: 'Curso de Capacitación',
      fecha: '2024-01-05',
      resumen: 'Capacitación en seguridad vial para conductores. Modalidad presencial y virtual disponible.',
      categoria: 'Evento',
      icono: 'calendar',
      color: 'bg-green-500'
    },
    {
      id: 4,
      titulo: 'Ampliación de Flota Vehicular',
      fecha: '2024-01-03',
      resumen: 'Se abre la convocatoria para la ampliación de la flota vehicular en el transporte público metropolitan.',
      categoria: 'Comunicado',
      icono: 'megaphone',
      color: 'bg-purple-500'
    },
    {
      id: 5,
      titulo: 'Mantenimiento de Rutas',
      fecha: '2024-01-01',
      resumen: 'Cronograma de mantenimiento preventivo para las principales rutas de transporte.',
      categoria: 'Aviso',
      icono: 'alert-triangle',
      color: 'bg-yellow-500'
    },
    {
      id: 6,
      titulo: 'Certificaciones Disponibles',
      fecha: '2023-12-28',
      resumen: 'Nuevos programas de certificación para operadores de transporte.',
      categoria: 'Normativa',
      icono: 'award',
      color: 'bg-indigo-500'
    }
  ];

  publicacionesFiltradas: Publicacion[] = [...this.publicaciones];
  filtroCategoria: string = '';
  cargando: boolean = false;

  constructor() {
    this.publicacionesFiltradas = [...this.publicaciones];
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

  leerMas(publicacion: Publicacion): void {
    // Implementar navegación a detalle o modal
    console.log('Leer más:', publicacion.titulo);
    alert(`Detalles de: ${publicacion.titulo}\n\n${publicacion.resumen}`);
  }
}
