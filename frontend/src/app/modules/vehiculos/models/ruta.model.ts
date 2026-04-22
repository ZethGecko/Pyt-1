// ==========================================
// RUTA
// ==========================================

export interface Ruta {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  empresaId?: number;
  origenId?: number;
  destinoId?: number;
  tipoServicio?: string;
  frecuencia?: string;
  distanciaKm?: number;
  duracionHoras?: number;
  estado: boolean;
  fechaCreacion?: Date;
}

export interface RutaCreateRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  empresaId?: number;
  origenId: number;
  destinoId: number;
  tipoServicio?: string;
  frecuencia?: string;
  distanciaKm?: number;
  duracionHoras?: number;
}

export interface RutaUpdateRequest {
  nombre?: string;
  descripcion?: string;
  empresaId?: number;
  tipoServicio?: string;
  frecuencia?: string;
  distanciaKm?: number;
  duracionHoras?: number;
  estado?: boolean;
}

export interface PuntoRuta {
  id: number;
  rutaId: number;
  puntoGeograficoId: number;
  orden: number;
  tiempoParadaMinutos?: number;
  esOrigen: boolean;
  esDestino: boolean;
}

export interface PuntoGeografico {
  id: number;
  nombre: string;
  tipo: string;
  codigo?: string;
}

export interface RutaEnriquecida {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  empresaRazonSocial?: string;
  origenNombre?: string;
  destinoNombre?: string;
  tipoServicio: string;
  frecuencia: string;
  distanciaKm?: number;
  duracionHoras?: number;
  estado: boolean;
  totalParadas?: number;
}

export interface FiltrosRuta {
  search?: string;
  empresaId?: number;
  tipoServicio?: string;
  estado?: boolean;
}
