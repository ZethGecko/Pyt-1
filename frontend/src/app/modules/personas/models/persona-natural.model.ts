// ==========================================
// GRUPO 2: ACTORES DEL SISTEMA
// PERSONA NATURAL
// ==========================================

export interface PersonaNatural {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  estado: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface PersonaNaturalCreateRequest {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  direccion?: string;
}

export interface PersonaNaturalUpdateRequest {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  direccion?: string;
}

// PROPIEDADES CALCULADAS (para uso en componentes)
export type PersonaNaturalConCalculos = PersonaNatural & {
  nombreCompleto?: string;
  edad?: number;
};

// PROYECCIÓN ENRIQUECIDA
export interface PersonaNaturalEnriquecida {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto?: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  edad?: number;
  direccion?: string;
  estado: boolean;
  totalTramites?: number;
  tramitesActivos?: number;
  licenciasCount?: number;
}
