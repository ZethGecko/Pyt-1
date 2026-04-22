export interface EtapaTramite {
  id: number;
  tipoTramiteId: number;
  tipoTramiteNombre?: string;
  nombreEtapa: string;
  orden: number;
  departamentoId?: number;
  departamentoNombre?: string;
  tiempoEstimadoDias?: number;
  estadoEsperado?: string;
  activo: boolean;
  // Campos de auditoría
  fechaCreacion: string;
  fechaModificacion?: string;
  usuarioCreacion: string;
  usuarioModificacion?: string;
}

export interface EtapaTramiteCreateRequest {
  tipoTramiteId: number;
  nombreEtapa: string;
  orden: number;
  departamentoId?: number;
  tiempoEstimadoDias?: number;
  estadoEsperado?: string;
  activo?: boolean;
}

export interface EtapaTramiteUpdateRequest {
  tipoTramiteId?: number;
  nombreEtapa?: string;
  orden?: number;
  departamentoId?: number;
  tiempoEstimadoDias?: number;
  estadoEsperado?: string;
  activo?: boolean;
}
