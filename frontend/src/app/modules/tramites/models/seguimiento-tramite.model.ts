export interface SeguimientoTramite {
  id: number;
  tramite?: {
    id: number;
    codigoRUT: string;
  } | null;
  etapaActual?: {
    id: number;
    nombreEtapa: string;
    orden: number;
  } | null;
  usuarioResponsable?: {
    id: number;
    username: string;
    nombre?: string;
  } | null;
  departamentoResponsable?: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
  fechaInicioEtapa: string | Date;
  fechaFinEtapa?: string | Date;
  estadoEtapa: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'BLOQUEADA';
  tiempoTranscurridoHoras?: number;
  observaciones?: string;
  fechaCreacion: string | Date;
  fechaActualizacion: string | Date;
}

export interface TimelineItem {
  id: number;
  title: string;
  description?: string;
  date: Date | string;
  status: 'completed' | 'current' | 'pending' | 'error';
  details?: Record<string, any>;
  // Campos adicionales para compatibilidad con template existente
  etapa?: string;
  departamento?: string;
  fecha?: Date | string;
}
