// ==========================================
// GRUPO 1: CONFIGURACIÓN REGULATORIA
// CATEGORÍA DE TRANSPORTE
// ==========================================

export interface CategoriaTransporte {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  estado: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface CategoriaTransporteCreateRequest {
  nombre: string;
  codigo: string;
  descripcion: string;
  estado?: boolean;
}

export interface CategoriaTransporteUpdateRequest {
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
}

export interface CategoriaTransporteEnriquecida {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  estado: boolean;
  totalTiposTransporte?: number;
  tiposTransporteActivos?: number;
  tupacsCount?: number;
}
