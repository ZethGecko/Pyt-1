// ==========================================
// EXPEDIENTE
// ==========================================

export interface Expediente {
  id: number;
  codigo: string;
  empresaId: number;
  empresaRazonSocial?: string;
  tipoTramiteId: number;
  tipoTramiteNombre?: string;
  estado: string;
  fechaCreacion: Date;
  fechaCierre?: Date;
  usuarioRegistraId: number;
  usuarioRegistraNombre?: string;
  observaciones?: string;
}

export interface ExpedienteCreateRequest {
  empresaId: number;
  tipoTramiteId: number;
  observaciones?: string;
}

export interface ExpedienteUpdateRequest {
  observaciones?: string;
  estado?: string;
  fechaCierre?: Date;
}

export interface ExpedienteEnriquecido {
  id: number;
  codigo: string;
  empresaId: number;
  empresaRazonSocial?: string;
  empresaRuc?: string;
  tipoTramiteId: number;
  tipoTramiteNombre?: string;
  estado: string;
  estadoFormateado?: string;
  colorEstado?: string;
  fechaCreacion: Date;
  fechaCreacionFormateada?: string;
  fechaCierre?: Date;
  usuarioRegistraNombre?: string;
  totalSolicitudes: number;
  solicitudesCompletadas: number;
  solicitudesPendientes: number;
  porcentajeCompletado: number;
  observaciones?: string;
}

export interface FiltrosExpediente {
  search?: string;
  estado?: string;
  empresaId?: number;
  tipoTramiteId?: number;
}
