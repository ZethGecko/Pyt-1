import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';

interface ConfiguracionModulo {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent {
  
  modulos: ConfiguracionModulo[] = [
    {
      titulo: 'Categorías de Transporte',
      descripcion: 'Gestiona las categorías de transporte (Personas, Carga, mixto)',
      icono: 'folder',
      ruta: '/app/categorias',
      color: 'blue'
    },
    {
      titulo: 'Tipos de Transporte',
      descripcion: 'Configura tipos de transporte dentro de cada categoría',
      icono: 'layers',
      ruta: '/app/tipos-transporte',
      color: 'indigo'
    },
    {
      titulo: 'TUPA',
      descripcion: 'Administra Tablas de Requisitos Únicos de Procedimientos',
      icono: 'clipboard',
      ruta: '/app/tupac',
      color: 'purple'
    },
    {
      titulo: 'Departamentos',
      descripcion: 'Configura departamentos y áreas de procesamiento',
      icono: 'building',
      ruta: '/app/departamentos',
      color: 'green'
    },
    {
      titulo: 'Tipos de Trámite',
      descripcion: 'Define los tipos de trámite disponibles',
      icono: 'edit',
      ruta: '/app/configuracion/tipos-tramite',
      color: 'yellow'
    },
    {
      titulo: 'Etapas de Trámite',
      descripcion: 'Configura las etapas de cada tipo de trámite',
      icono: 'git-branch',
      ruta: '/app/etapas-tramite',
      color: 'lime'
    },
    {
      titulo: 'Requisitos TUPA',
      descripcion: 'Gestiona requisitos del Texto Único de Procedimientos',
      icono: 'clipboard-list',
      ruta: '/app/requisitos-tupac',
      color: 'rose'
    },
    {
      titulo: 'Permisos por Solicitante',
      descripcion: 'Asigna qué tipos de solicitante pueden usar cada trámite',
      icono: 'users',
      ruta: '/app/tipo-tramite-solicitante',
      color: 'teal'
    },
    {
      titulo: 'Parámetros de Inspección',
      descripcion: 'Configura parámetros para inspecciones técnicas',
      icono: 'search',
      ruta: '/app/inspecciones/plantillas',
      color: 'red'
    },
    {
      titulo: 'Configuración de Exámenes',
      descripcion: 'Administra exámenes teóricos y prácticos',
      icono: 'clipboard-check',
      ruta: '/app/examenes',
      color: 'teal'
    },
    {
      titulo: 'Usuarios y Roles',
      descripcion: 'Gestiona usuarios del sistema y sus permisos',
      icono: 'users',
      ruta: '/app/admin/users',
      color: 'gray'
    },
    {
      titulo: 'Configuración TUC',
      descripcion: 'Configura duración y vigencia de TUCs',
      icono: 'calendar',
      ruta: '/app/config-duracion-tuc',
      color: 'orange'
    }
  ];
}
