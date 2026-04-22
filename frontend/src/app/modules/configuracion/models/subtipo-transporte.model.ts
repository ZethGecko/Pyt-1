// SUBTIPO DE TRANSPORTE
export interface SubtipoTransporte {
  id: number;
  nombre: string;
  codigo: string;
  tipoTransporteId: number;
  tipoTransporteNombre?: string;
  estado: boolean;
  configDuracionesTUC?: any[];
}

export interface SubtipoTransporteCreateRequest {
  nombre: string;
  codigo: string;
  tipoTransporteId: number;
  estado?: boolean;
}

export interface SubtipoTransporteUpdateRequest {
  nombre?: string;
  tipoTransporteId?: number;
  estado?: boolean;
}

export interface SubtipoTransporteEnriquecido {
  id: number;
  nombre: string;
  codigo: string;
  tipoTransporteId: number;
  tipoTransporteNombre?: string;
  estado: boolean;
  vigenciaTUC?: string;
  configDuracionActiva?: any;
}
