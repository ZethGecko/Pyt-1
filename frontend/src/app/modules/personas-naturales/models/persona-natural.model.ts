// ==========================================
// PERSONA NATURAL - Modelo alineado con Backend
// ==========================================

export interface PersonaNatural {
  id: number;
  nombres: string;
  apellidos: string;
  dni: number;
  genero?: string; // 'MASCULINO', 'FEMENINO', 'OTRO'
  telefono?: string;
  email?: string;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  observaciones?: string;
}

export interface PersonaNaturalCreateRequest {
  nombres: string;
  apellidos: string;
  dni: number;
  genero?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
}

export interface PersonaNaturalUpdateRequest {
  nombres?: string;
  apellidos?: string;
  dni?: number;
  genero?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
}

// PROYECCIÓN ENRIQUECIDA
export interface PersonaNaturalProjection {
  id: number;
  nombres: string;
  apellidos: string;
  dni: number;
  genero?: string;
  telefono?: string;
  email?: string;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  observaciones?: string;
  // Campos calculados
  nombreCompleto?: string;
  infoContacto?: string;
}

// ESTADÍSTICAS
export interface PersonaNaturalEstadisticas {
  total: number;
  conEmail: number;
  conTelefono: number;
  porGenero: Map<string, number>;
}

// FILTROS
export interface FiltrosPersonaNatural {
  search?: string;
  genero?: string;
  conEmail?: boolean;
  conTelefono?: boolean;
  dni?: number;
}

// CONSTANTES
export const GENEROS = ['MASCULINO', 'FEMENINO', 'OTRO'] as const;
export type Genero = typeof GENEROS[number];
