// DEPARTAMENTO
export interface Departamento {
  id: number;
  nombre: string;
  descripcion?: string;
  responsableId?: number;
  responsableNombre?: string;
  activo: boolean;
  ordenPrioridad?: number;
  puedeDerivarA?: number[];
  fechaCreacion?: Date;
}

export interface DepartamentoCreateRequest {
  nombre: string;
  descripcion?: string;
  ordenPrioridad?: number;
}

export interface DepartamentoUpdateRequest {
  nombre?: string;
  descripcion?: string;
  ordenPrioridad?: number;
  activo?: boolean;
}

export interface DepartamentoEnriquecido {
  id: number;
  nombre: string;
  descripcion?: string;
  responsableId?: number;
  responsableNombre?: string;
  activo: boolean;
  ordenPrioridad?: number;
  totalDerivaciones?: number;
  tramitesActivos?: number;
}
