export interface ReglaTipoTramitePermiso {
  id?: number;
  tipoTramite: {
    id: number;
    codigo: string;
    nombre: string;
  };
  permiteEmpresa: boolean;
  permitePersonaNatural: boolean;
  permiteVehiculo: boolean;
  requiereEmpresaActiva: boolean;
  requiereLicenciaConductor: boolean;
  edadMinima?: number;
  antiguedadMaximaVehiculo?: number;
  activo: boolean;
  observaciones?: string;
  diasValidezDocumentos?: number;
  requiereInspeccionTecnica: boolean;
  requiereHabilitacionAnterior: boolean;
  plazoMaximoSolicitudDias?: number;
}

export interface ReglaTipoTramitePermisoCreateRequest {
  tipoTramiteId: number;
  permiteEmpresa?: boolean;
  permitePersonaNatural?: boolean;
  permiteVehiculo?: boolean;
  requiereEmpresaActiva?: boolean;
  requiereLicenciaConductor?: boolean;
  edadMinima?: number | null;
  antiguedadMaximaVehiculo?: number | null;
  activo?: boolean;
  observaciones?: string;
  diasValidezDocumentos?: number | null;
  requiereInspeccionTecnica?: boolean;
  requiereHabilitacionAnterior?: boolean;
  plazoMaximoSolicitudDias?: number | null;
}

export interface ReglaTipoTramitePermisoUpdateRequest {
  tipoTramiteId?: number;
  permiteEmpresa?: boolean;
  permitePersonaNatural?: boolean;
  permiteVehiculo?: boolean;
  requiereEmpresaActiva?: boolean;
  requiereLicenciaConductor?: boolean;
  edadMinima?: number | null;
  antiguedadMaximaVehiculo?: number | null;
  activo?: boolean;
  observaciones?: string;
  diasValidezDocumentos?: number | null;
  requiereInspeccionTecnica?: boolean;
  requiereHabilitacionAnterior?: boolean;
  plazoMaximoSolicitudDias?: number | null;
}

export interface ReglaTipoTramitePermisoEnriquecidoProjection {
  id: number;
  tipoTramite: {
    id: number;
    codigo: string;
    nombre: string;
  };
  permiteEmpresa: boolean;
  permitePersonaNatural: boolean;
  permiteVehiculo: boolean;
  requiereEmpresaActiva: boolean;
  requiereLicenciaConductor: boolean;
  edadMinima?: number;
  antiguedadMaximaVehiculo?: number;
  activo: boolean;
  observaciones?: string;
  diasValidezDocumentos?: number;
  requiereInspeccionTecnica: boolean;
  requiereHabilitacionAnterior: boolean;
  plazoMaximoSolicitudDias?: number;
  tiposSolicitantesPermitidos: string;
  requisitosEspeciales: string;
}

export interface ReglaTipoTramitePermisoStats {
  total: number;
  activas: number;
  inactivas: number;
  conEmpresa: number;
  conPersonaNatural: number;
  conVehiculo: number;
  conRequisitosEspeciales: number;
}
