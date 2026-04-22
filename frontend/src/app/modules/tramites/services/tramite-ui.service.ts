import { Injectable, signal, computed } from '@angular/core';
import { TramiteEnriquecido } from '../models/tramite.model';
import { TramiteStatesUtils } from '../utils/tramite-states.utils';

export interface VistaConfig {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class TramiteUiService {
  // 🎯 SEÑALES REACTIVAS
  private _vistaActiva = signal<string>('mis-tramites');
  private _filtrosActivos = signal<any>({});
  private _tramiteSeleccionado = signal<TramiteEnriquecido | null>(null);
  private _mostrarFiltros = signal<boolean>(false);
  private _cargando = signal<boolean>(false);
  
  // 🎯 COMPUTADOS
  vistaActiva = computed(() => this._vistaActiva());
  filtrosActivos = computed(() => this._filtrosActivos());
  tramiteSeleccionado = computed(() => this._tramiteSeleccionado());
  mostrarFiltros = computed(() => this._mostrarFiltros());
  cargando = computed(() => this._cargando());
  
  // 🎯 VISTAS DISPONIBLES
  readonly vistas: VistaConfig[] = [
    { 
      id: 'mis-tramites', 
      nombre: 'Mis Trámites', 
      icono: '📋', 
      descripcion: 'Trámites asignados a ti',
      roles: ['SOLICITANTE', 'REVIEWER', 'INSPECTOR', 'ADMIN']
    },
    { 
      id: 'pendientes', 
      nombre: 'Pendientes', 
      icono: '⏳', 
      descripcion: 'Trámites pendientes de revisión',
      roles: ['REVIEWER', 'ADMIN']
    },
    { 
      id: 'todos', 
      nombre: 'Todos', 
      icono: '📊', 
      descripcion: 'Todos los trámites del sistema',
      roles: ['ADMIN', 'SUPER_ADMIN']
    },
    { 
      id: 'atrasados', 
      nombre: 'Atrasados', 
      icono: '⚠️', 
      descripcion: 'Trámites con plazo vencido',
      roles: ['REVIEWER', 'ADMIN']
    }
  ];
  
  // 🎯 CONFIGURACIÓN DE COLUMNAS
  getColumnasPorVista(vistaId: string): any[] {
    const columnasBase = [
      { 
        key: 'codigoRUT', 
        label: 'Código', 
        sortable: true, 
        width: '140px',
        type: 'text',
        class: 'font-mono text-sm'
      },
      { 
        key: 'solicitanteNombre', 
        label: 'Solicitante', 
        sortable: true,
        type: 'text',
        class: 'font-medium'
      },
      { 
        key: 'tipoTramiteDescripcion', 
        label: 'Tipo', 
        sortable: true,
        type: 'text',
        class: 'text-gray-600'
      },
      { 
        key: 'estadoFormateado', 
        label: 'Estado', 
        sortable: true, 
        type: 'badge',
        badgeConfig: {
          getColor: (item: any) => item.colorEstado,
          getIcon: (item: any) => item.iconoEstado
        }
      },
      { 
        key: 'departamentoActualNombre', 
        label: 'Departamento', 
        sortable: true,
        type: 'text'
      },
      { 
        key: 'fechaRegistroFormateada', 
        label: 'Fecha', 
        sortable: true, 
        type: 'date',
        format: 'dd/MM/yyyy'
      },
      { 
        key: 'acciones', 
        label: 'Acciones', 
        type: 'actions',
        width: '120px'
      }
    ];
    
    switch(vistaId) {
      case 'atrasados':
        return [
          ...columnasBase.filter(c => c.key !== 'acciones'),
          { 
            key: 'infoPlazo', 
            label: 'Plazo', 
            type: 'badge',
            badgeConfig: {
              getColor: () => 'bg-red-100 text-red-800 border-red-200',
              getIcon: () => '⚠️'
            }
          },
          ...columnasBase.filter(c => c.key === 'acciones')
        ];
        
      case 'pendientes':
        return columnasBase.filter(c => 
          c.key !== 'acciones' && 
          c.key !== 'departamentoActualNombre'
        );
        
      default:
        return columnasBase;
    }
  }
  
  // 🎯 CONFIGURACIÓN DE TABS PARA DETALLE
  getTabsParaTramite(tramite: TramiteEnriquecido): any[] {
    const tabsBase = [
      { 
        id: 'informacion', 
        label: '📋 Información', 
        icon: 'info',
        visible: true
      },
      { 
        id: 'documentos', 
        label: '📄 Documentos', 
        icon: 'attachment',
        visible: true,
        badge: tramite.documentosPendientes || 0
      },
      { 
        id: 'seguimiento', 
        label: '🔄 Seguimiento', 
        icon: 'timeline',
        visible: true,
        badge: tramite.totalSeguimientos || 0
      }
    ];
    
    // Agregar tabs según estado
    if (tramite.estado === 'observado' || (tramite.documentosObservados && tramite.documentosObservados > 0)) {
      tabsBase.push({ 
        id: 'observaciones', 
        label: '💬 Observaciones', 
        icon: 'chat',
        visible: true,
        badge: tramite.documentosObservados || 0
      });
    }
    
    if (tramite.expedienteId) {
      tabsBase.push({ 
        id: 'expediente', 
        label: '📁 Expediente', 
        icon: 'folder',
        visible: true
      });
    }
    
    return tabsBase;
  }
  
  // 🎯 CONFIGURACIÓN DE ACCIONES
  getAccionesParaTramite(tramite: TramiteEnriquecido): any[] {
    const accionesDisponibles = tramite.accionesDisponibles || [];
    
    const accionesConfig = {
      'editar': {
        label: 'Editar',
        icon: '✏️',
        color: 'blue',
        visible: accionesDisponibles.includes('editar'),
        requireConfirmation: false
      },
      'aprobar': {
        label: 'Aprobar',
        icon: '✅',
        color: 'green',
        visible: accionesDisponibles.includes('aprobar'),
        requireConfirmation: true,
        confirmationMessage: '¿Está seguro de aprobar este trámite?'
      },
      'rechazar': {
        label: 'Rechazar',
        icon: '❌',
        color: 'red',
        visible: accionesDisponibles.includes('rechazar'),
        requireConfirmation: true,
        confirmationMessage: '¿Está seguro de rechazar este trámite?'
      },
      'observar': {
        label: 'Observar',
        icon: '⚠️',
        color: 'yellow',
        visible: accionesDisponibles.includes('observar'),
        requireConfirmation: false
      },
      'derivar': {
        label: 'Derivar',
        icon: '➡️',
        color: 'purple',
        visible: accionesDisponibles.includes('derivar'),
        requireConfirmation: false
      },
      'finalizar': {
        label: 'Finalizar',
        icon: '🏁',
        color: 'gray',
        visible: accionesDisponibles.includes('finalizar'),
        requireConfirmation: true
      },
      'cancelar': {
        label: 'Cancelar',
        icon: '🚫',
        color: 'red',
        visible: accionesDisponibles.includes('cancelar'),
        requireConfirmation: true
      },
      'reingresar': {
        label: 'Reingresar',
        icon: '🔄',
        color: 'orange',
        visible: accionesDisponibles.includes('reingresar'),
        requireConfirmation: true
      }
    };
    
    // Filtrar solo las acciones visibles
    return Object.entries(accionesConfig)
      .filter(([_, config]) => config.visible)
      .map(([key, config]) => ({
        id: key,
        ...config
      }));
  }
  
  // 🎯 MÉTODOS PARA MANIPULAR ESTADO
  cambiarVista(vistaId: string): void {
    this._vistaActiva.set(vistaId);
    this._filtrosActivos.set({});
  }
  
  aplicarFiltros(filtros: any): void {
    this._filtrosActivos.set(filtros);
  }
  
  seleccionarTramite(tramite: TramiteEnriquecido): void {
    this._tramiteSeleccionado.set(tramite);
  }
  
  limpiarSeleccion(): void {
    this._tramiteSeleccionado.set(null);
  }
  
  toggleFiltros(): void {
    this._mostrarFiltros.update(v => !v);
  }
  
  setCargando(cargando: boolean): void {
    this._cargando.set(cargando);
  }
  
  // 🎯 MÉTODOS DE VALIDACIÓN
  puedeAccederAVista(vistaId: string, rolUsuario: string): boolean {
    const vista = this.vistas.find(v => v.id === vistaId);
    return vista ? vista.roles.includes(rolUsuario) : false;
  }
  
  getVistaActual(): VistaConfig | undefined {
    return this.vistas.find(v => v.id === this._vistaActiva());
  }
}