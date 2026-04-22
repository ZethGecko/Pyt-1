export interface TipoTramite {
  id: number;
  codigo: string;
  descripcion: string;
  diasDescargo?: number;
  tupac?: {
    id: number;
    codigo: string;
    nombre: string;
    categoria?: string;
    descripcion?: string;
    activo?: boolean;
  } | null;
  // Campos de auditoría
  fechaCreacion: string;
  fechaModificacion?: string;
  usuarioCreacion: string;
  usuarioModificacion?: string;
}

export interface TipoTramiteEnriquecido {
  id: number;
  codigo: string;
  descripcion: string;
  diasDescargo?: number;
  tupacId?: number;
  tupacCodigo?: string;
  tupacDescripcion?: string;
  tupacEstado?: string;
  // Enriquecido con estadísticas
  totalTramites?: number;
  tramitesPendientes?: number;
  tramitesRechazados?: number;
  totalEtapas?: number;
  totalRequisitos?: number;
  // IDs de requisitos asociados (JSON)
  requisitosIds?: number[];
}

export interface TipoTramiteCreateRequest {
  codigo: string;
  descripcion: string;
  diasDescargo?: number;
  tupacId: number | null;
}

export interface TipoTramiteUpdateRequest {
  codigo?: string;
  descripcion?: string;
  diasDescargo?: number;
  estado?: boolean;
  tupacId: number | null;
}
