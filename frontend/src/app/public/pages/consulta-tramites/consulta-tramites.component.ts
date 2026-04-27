import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TipoTramite {
  id: number;
  nombre: string;
  descripcion: string;
  requisitos: string[];
  tiempoEstimado: string;
  costo: string;
  icono: string;
  color: string;
  informacionAdicional?: string;
}

@Component({
  selector: 'app-consulta-tramites',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './consulta-tramites.component.html',
  styleUrls: ['./consulta-tramites.component.scss']
})
export class ConsultaTramitesComponent {
  tramites: TipoTramite[] = [
    {
      id: 1,
      nombre: 'Registro de Empresa',
      descripcion: 'Registro inicial de empresas de transporte ante la autoridad competente.',
      requisitos: ['Documento de identidad', 'Escritura constitutive', 'Registro tributario', 'Licencia de operación'],
      tiempoEstimado: '15 días hábiles',
      costo: '$500.00',
      icono: 'building',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      nombre: 'Alta de Vehículo',
      descripcion: 'Registro de vehículos para prestación de servicios de transporte.',
      requisitos: ['Tarjeta de circulación', 'Seguro vigente', 'Inspección técnica', 'Factura del vehículo'],
      tiempoEstimado: '7 días hábiles',
      costo: '$150.00',
      icono: 'truck',
      color: 'bg-green-500'
    },
    {
      id: 3,
      nombre: 'Renovación de Permiso',
      descripcion: 'Renovación de permisos de operación vencidos.',
      requisitos: ['Solicitud escrita', 'Pago de derechos', 'Documentación vigente'],
      tiempoEstimado: '5 días hábiles',
      costo: '$200.00',
      icono: 'refresh',
      color: 'bg-orange-500'
    },
    {
      id: 4,
      nombre: 'Licencia de Conductor',
      descripcion: 'Obtención de licencia para operadores de transporte.',
      requisitos: ['Curso de capacitación', 'Examen médico', 'Documento de identidad', 'Foto reciente'],
      tiempoEstimado: '10 días hábiles',
      costo: '$100.00',
      icono: 'id-card',
      color: 'bg-purple-500'
    },
    {
      id: 5,
      nombre: 'Autorización de Ruta',
      descripcion: 'Solicitud de autorización para operar en rutas específicas.',
      requisitos: ['Estudio de demanda', 'Plan de operaciones', 'Flota disponible'],
      tiempoEstimado: '20 días hábiles',
      costo: '$800.00',
      icono: 'route',
      color: 'bg-cyan-500'
    },
    {
      id: 6,
      nombre: 'Constancia de Operación',
      descripcion: 'Documento que certifica la operación legal del vehículo.',
      requisitos: ['Pagos al día', 'Vehículo vigente', 'Conductor autorizado'],
      tiempoEstimado: '3 días hábiles',
      costo: '$50.00',
      icono: 'file-check',
      color: 'bg-teal-500'
    }
  ];

  tramitesFiltrados: TipoTramite[] = [...this.tramites];
  filtroBusqueda: string = '';
  filtroTipo: string = '';
  cargando: boolean = false;
  tramiteExpandido: number | null = null;

  constructor() {
    this.tramitesFiltrados = [...this.tramites];
  }

  filtrarTramites(): void {
    this.tramitesFiltrados = this.tramites.filter(tramite => {
      const coincideBusqueda = !this.filtroBusqueda || 
        tramite.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        tramite.descripcion.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      const coincideTipo = !this.filtroTipo || this.clasificarTipo(tramite.nombre) === this.filtroTipo;
      
      return coincideBusqueda && coincideTipo;
    });
  }

   private clasificarTipo(nombre: string): string {
     const nombreLower = nombre.toLowerCase();
     if (nombreLower.includes('licencia') || nombreLower.includes('conductor')) return 'licencia';
     if (nombreLower.includes('permiso') || nombreLower.includes('renovación')) return 'permiso';
     if (nombreLower.includes('certificado')) return 'certificado';
     if (nombreLower.includes('registro') || nombreLower.includes('alta')) return 'registro';
     return '';
   }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroTipo = '';
    this.tramitesFiltrados = [...this.tramites];
  }

  toggleTramite(id: number): void {
    this.tramiteExpandido = this.tramiteExpandido === id ? null : id;
  }

  getIconoPath(icono: string): string {
    const iconos: Record<string, string> = {
      'building': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      'truck': 'M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zM20 17H8l2-6h8l2 6zM5 17h14v-4H5v4zM5 9V6a2 2 0 012-2h10a2 2 0 012 2v3',
      'refresh': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'id-card': 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
      'route': 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      'file-check': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return iconos[icono] || iconos['building'];
  }
}
