// TIPO DE TRANSPORTE
export interface TipoTransporte {
  id: number;
  nombre: string;
  codigo: string;
  categoriaTransporteId: number;
  categoriaTransporteNombre?: string;
  estado: boolean;
  subtiposCount?: number;
  fechaCreacion?: Date;
}

export interface TipoTransporteCreateRequest {
  nombre: string;
  codigo: string;
  categoriaTransporteId: number;
  estado?: boolean;
}

export interface TipoTransporteUpdateRequest {
  nombre?: string;
  categoriaTransporteId?: number;
  estado?: boolean;
}

export interface TipoTransporteEnriquecido {
  id: number;
  nombre: string;
  codigo: string;
  categoriaTransporteId: number;
  categoriaTransporteNombre?: string;
  estado: boolean;
  subtipos: any[]; // any[] para evitar referencia circular
  totalSubtipos?: number;
}
