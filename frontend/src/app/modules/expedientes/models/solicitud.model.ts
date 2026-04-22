// ==========================================
// SOLICITUD
// ==========================================

export interface Solicitud {
  id: number;
  expedienteId: number;
  vehiculoId?: number;
  vehiculoPlaca?: string;
  tipoSolicitudId: number;
  tipoSolicitudNombre?: string;
  estado: string;
  fechaSolicitud: Date;
  tramiteId?: number;
  tramiteCodigoRUT?: string;
  observacion?: string;
}

export interface SolicitudCreateRequest {
  expedienteId: number;
  vehiculoId?: number;
  tipoSolicitudId: number;
  observacion?: string;
}

export interface SolicitudUpdateRequest {
  vehiculoId?: number;
  tipoSolicitudId?: number;
  observacion?: string;
  estado?: string;
}

export interface SolicitudEnriquecida {
  id: number;
  expedienteId: number;
  expedienteCodigo?: string;
  vehiculoId?: number;
  vehiculoPlaca?: string;
  tipoSolicitudId: number;
  tipoSolicitudNombre?: string;
  estado: string;
  estadoFormateado?: string;
  colorEstado?: string;
  fechaSolicitud: Date;
  fechaFormateada?: string;
  tramiteId?: number;
  tramiteCodigoRUT?: string;
  tramiteEstado?: string;
  observacion?: string;
}

export interface ObservacionSolicitud {
  id: number;
  solicitudId: number;
  texto: string;
  fechaCreacion: Date;
  usuarioCreaId: number;
  usuarioCreaNombre?: string;
  esRequerimiento: boolean;
  atendida: boolean;
  fechaAtencion?: Date;
}
