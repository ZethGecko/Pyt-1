// TIPO DE SOLICITUD
export interface TipoSolicitud {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  requiereVehiculo: boolean;
  estado: boolean;
}

export interface TipoSolicitudCreateRequest {
  nombre: string;
  codigo: string;
  descripcion?: string;
  requiereVehiculo?: boolean;
}

export interface TipoSolicitudUpdateRequest {
  nombre?: string;
  descripcion?: string;
  requiereVehiculo?: boolean;
  estado?: boolean;
}

export interface TipoSolicitudEnriquecido {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  requiereVehiculo: boolean;
  estado: boolean;
  solicitudesCount?: number;
  tramitesCount?: number;
}
