import { RequisitoTUPAC } from './requisito-tupac.model';

export interface TUPAC {
  id?: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  subtipoTransporte?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  estado: string;
  fechaVigencia?: string;
  requisitos?: RequisitoTUPAC[];
}

export interface TUPACCreateRequest {
  codigo: string;
  descripcion: string;
  categoria: string;
  subtipoTransporteId?: number | null;
  estado?: string;
  fechaVigencia?: string;
}

export interface TUPACUpdateRequest {
  codigo?: string;
  descripcion?: string;
  categoria?: string;
  subtipoTransporteId?: number | null;
  estado?: string;
  fechaVigencia?: string;
}

export interface TUPACEnriquecidoProjection {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  subtipoTransporte?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  estado: string;
  fechaVigencia?: string;
  nombreCompleto: string;
  cantidadRequisitos: number;
}

export const ESTADOS_TUPAC = ['vigente', 'en_revision', 'archivado'] as const;
export type EstadoTUPAC = typeof ESTADOS_TUPAC[number];
