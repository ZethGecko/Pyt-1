export interface Tramite {
  id: number;
  codigoRUT: string;
  estado: string;
  prioridad: string;
  fechaRegistro: Date;
  fechaLimite?: Date;
  fechaFinalizacion?: Date;
  observaciones?: string;
  motivoRechazo?: string;
  
  // Relaciones (IDs)
  tipoTramiteId: number;
  solicitanteId: number;
  expedienteId?: number;
  usuarioRegistraId: number;
  departamentoActualId?: number;
  tramiteOrigenId?: number;
}

export interface TramiteEnriquecido {
    // Datos básicos
    id: number;
    codigoRUT: string;
    estado: string;
    prioridad: string;
    fechaRegistro: Date;
    fechaLimite?: Date;
    fechaFinalizacion?: Date;
    observaciones?: string;
    motivoRechazo?: string;
    // Propiedades calculadas
    estaAtrasado?: boolean;

    // Datos enriquecidos
    tipoTramiteId: number;
    tipoTramiteCodigo: string;
    tipoTramiteDescripcion: string;
    tipoTramiteCategoria: string;

    // Tipo de solicitante (para filtrado)
    solicitanteTipo: 'Empresa' | 'Gerente' | 'PersonaNatural' | string;
    solicitanteId: number;
    solicitanteNombre: string;
    solicitanteIdentificacion: string;
   solicitanteEmail?: string;
   solicitanteTelefono?: string;

   expedienteCodigo?: string;
   expedienteId?: number;
   expedienteEstado?: string;

   usuarioRegistraNombre: string;
   usuarioRegistraEmail: string;

   usuarioResponsableId?: number;
   usuarioResponsableNombre?: string;
   usuarioResponsableEmail?: string;

   departamentoActualNombre?: string;
   departamentoActualResponsable?: string;

   tramiteOrigenCodigo?: string;

   // Estadísticas de documentos
   totalDocumentos?: number;
   documentosAprobados?: number;
   documentosPendientes?: number;
   documentosObservados?: number;
   documentosRechazados?: number;
   totalSeguimientos?: number;
   ultimoSeguimientoFecha?: Date;

   // Propiedades calculadas para UI
   estadoFormateado?: string;
   colorEstado?: string;
   iconoEstado?: string;
   porcentajeCompletado?: number;
   requiereAtencion?: boolean;
   infoPlazo?: string;
   fechaRegistroFormateada?: string;
   fechaLimiteFormateada?: string;
   fechaActualizacion?: Date;

   // Acciones disponibles
   accionesDisponibles?: string[];
}

export interface TramiteCreateRequest {
  tipoTramiteId: number;
  solicitanteId: number;
  tipoSolicitante: 'Empresa' | 'Gerente' | 'PersonaNatural';
  codigoRUT: string;
  prioridad?: string;
  observaciones?: string;
  expedienteId?: number;
}

export interface TramiteUpdateRequest {
  observaciones?: string;
  prioridad?: string;
  tipoTramiteId?: number;
  solicitanteId?: number;
  tipoSolicitante?: 'Empresa' | 'Gerente' | 'PersonaNatural';
}

export interface FiltrosTramite {
  estado?: string;
  prioridad?: string;
  tipoTramiteId?: number;
  solicitanteId?: number;
  departamentoId?: number;
  search?: string;
  desde?: Date;
  hasta?: Date;
}

export interface TramiteDocumento {
  id: number;
  tramiteId: number;
  nombre: string;
  descripcion?: string;
  estado: string;
  obligatorio: boolean;
  esExamen: boolean;
  fechaPresentacion?: Date;
  fechaRevision?: Date;
  archivoUrl?: string;
  observacion?: string;
  notasRevision?: string;
}

export interface TramiteSeguimiento {
  id: number;
  tramiteId: number;
  etapa: string;
  etapaNombre?: string;
  usuario: string;
  usuarioNombre?: string;
  fechaMovimiento: Date;
  departamentoOrigen?: string;
  departamentoDestino?: string;
  instrucciones?: string;
  observacion?: string;
}

export interface TimelineEvent {
  id: number;
  title: string;
  description?: string;
  date: Date;
  icon?: string;
  color?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
}