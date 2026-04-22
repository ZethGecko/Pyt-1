// ==========================================
// GERENTE
// ==========================================

export interface Gerente {
  id: number;
  personaNaturalId: number;
  empresaId: number;
  cargo: string;
  tipoGerente: string; // ADMINISTRADOR, GENERAL, OPERACIONES
  fechaDesignacion: Date;
  fechaCese?: Date;
  vigente: boolean;
  observaciones?: string;
  fechaCreacion?: Date;
}

export interface GerenteCreateRequest {
  personaNaturalId: number;
  empresaId: number;
  cargo: string;
  tipoGerente: string;
  fechaDesignacion: Date;
  observaciones?: string;
}

export interface GerenteUpdateRequest {
  cargo?: string;
  tipoGerente?: string;
  fechaDesignacion?: Date;
  fechaCese?: Date;
  vigente?: boolean;
  observaciones?: string;
}

export interface GerenteEnriquecido {
  id: number;
  personaNaturalId: number;
  personaNaturalNombreCompleto?: string;
  personaNaturalDni?: string;
  empresaId: number;
  empresaRazonSocial?: string;
  cargo: string;
  tipoGerente: string;
  tipoGerenteNombre?: string;
  fechaDesignacion: Date;
  vigente: boolean;
  aniosServicio?: number;
}

export interface FiltrosGerente {
  empresaId?: number;
  vigente?: boolean;
  tipoGerente?: string;
  search?: string;
}
