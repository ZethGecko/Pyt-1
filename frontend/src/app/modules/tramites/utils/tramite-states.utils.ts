export class TramiteStatesUtils {
  
  static getEstadoFormateado(estado: string): string {
    const estados: { [key: string]: string } = {
      'registrado': 'Registrado',
      'en_revision': 'En Revisión',
      'derivado': 'Derivado',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado',
      'observado': 'Observado',
      'finalizado': 'Finalizado',
      'pendiente': 'Pendiente',
      'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
  }
  
  static getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'aprobado': 'bg-green-100 text-green-800 border-green-200',
      'finalizado': 'bg-gray-100 text-gray-800 border-gray-200',
      'rechazado': 'bg-red-100 text-red-800 border-red-200',
      'cancelado': 'bg-red-100 text-red-800 border-red-200',
      'observado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'en_revision': 'bg-blue-100 text-blue-800 border-blue-200',
      'derivado': 'bg-blue-100 text-blue-800 border-blue-200',
      'registrado': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  static getIconoEstado(estado: string): string {
    const iconos: { [key: string]: string } = {
      'registrado': '📝',
      'en_revision': '🔍',
      'derivado': '➡️',
      'aprobado': '✅',
      'rechazado': '❌',
      'observado': '⚠️',
      'finalizado': '🏁',
      'pendiente': '⏳',
      'cancelado': '🚫'
    };
    return iconos[estado] || '📋';
  }
  
  static getPrioridadFormateada(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      'urgente': 'Urgente',
      'alta': 'Alta',
      'normal': 'Normal',
      'baja': 'Baja'
    };
    return prioridades[prioridad] || prioridad;
  }
  
  static getColorPrioridad(prioridad: string): string {
    const colores: { [key: string]: string } = {
      'urgente': 'bg-red-100 text-red-800',
      'alta': 'bg-orange-100 text-orange-800',
      'normal': 'bg-blue-100 text-blue-800',
      'baja': 'bg-gray-100 text-gray-800'
    };
    return colores[prioridad] || 'bg-gray-100 text-gray-800';
  }
  
  static getAccionesDisponibles(estado: string): string[] {
    const acciones: { [key: string]: string[] } = {
      'registrado': ['editar', 'cancelar'],
      'en_revision': ['aprobar', 'rechazar', 'observar', 'derivar'],
      'derivado': ['aprobar', 'rechazar', 'observar'],
      'observado': ['aprobar', 'rechazar', 'editar'],
      'aprobado': ['finalizar'],
      'rechazado': ['reingresar'],
      'pendiente': ['editar', 'cancelar']
    };
    return acciones[estado] || [];
  }
  
  static puedeRealizarAccion(estado: string, accion: string): boolean {
    const acciones = this.getAccionesDisponibles(estado);
    return acciones.includes(accion);
  }
  
  static calcularInfoPlazo(fechaLimite?: Date): string {
    if (!fechaLimite) return 'Sin fecha límite';
    
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    const diasRestantes = Math.floor((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes > 0) {
      return `${diasRestantes} días restantes`;
    } else if (diasRestantes === 0) {
      return 'Vence hoy';
    } else {
      return `Vencido hace ${Math.abs(diasRestantes)} días`;
    }
  }
  
  static calcularPorcentajeCompletado(documentosAprobados: number = 0, totalDocumentos: number = 0): number {
    if (totalDocumentos === 0) return 0;
    return Math.round((documentosAprobados / totalDocumentos) * 100);
  }
  
  static requiereAtencion(tramite: any): boolean {
    if (!tramite.fechaLimite) return false;
    
    const hoy = new Date();
    const limite = new Date(tramite.fechaLimite);
    const diasRestantes = Math.floor((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    return diasRestantes <= 3 || 
           tramite.estado === 'observado' ||
           tramite.documentosObservados > 0;
  }
  
   static formatearFecha(fecha?: Date): string {
     if (!fecha) return '';
     return new Date(fecha).toLocaleDateString('es-ES', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric'
     });
   }

   // En versiones anteriores se usaba este método para convertir objetos del backend al frontend
   // Ahora simplemente devuelve el objeto, asumiendo que ya está enriquecido
    static enriquecerTramite(tramite: any): any {
      return tramite;
    }
  }