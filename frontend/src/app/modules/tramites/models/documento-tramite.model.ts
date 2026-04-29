// ==========================================
// GRUPO 3: PROCESO DE TRÁMITES
// DOCUMENTO DE TRÁMITE
// ==========================================

 export interface DocumentoTramite {
   id: number;
   tramiteId: number;
   requisitoId: number;
   requisitoTUPACId?: number; // Alias para compatibilidad
   requisitoNombre?: string;
   nombre?: string;
   estado: string;
   fechaPresentacion?: Date;
   fechaRevision?: Date;
   rutaArchivo?: string;
   nombreArchivo?: string;
   tipoArchivo?: string;
   tamanoArchivo?: number;
   observaciones?: string;
   notasRevision?: string;
   certificadoNumero?: string;
   revisionUsuarioId?: number;
   usuarioRevisaNombre?: string;
   usuarioAsignadoId?: number;
   usuarioAsignadoNombre?: string;
   grupoPresentacionId?: number;
   grupoPresentacion?: any;
   fechaAsignacion?: Date;
   calificacion?: number;
   intentosRevision?: number;
   estadoFormateado?: string;
   colorEstado?: string;
   iconoEstado?: string;
   esExamen?: boolean;
   obligatorio?: boolean;
   instanciaTramiteId?: number; // <-- añadido
   // Relación con requisito (para mostrar código y descripción)
   requisito?: {
     id: number;
     codigo: string;
     descripcion: string;
   };
 }

export interface DocumentoTramiteCreateRequest {
  tramiteId: number;
  requisitoId: number;
  archivoUrl?: string;
  observacion?: string;
}

export interface DocumentoTramiteUpdateRequest {
  estado?: string;
  archivoUrl?: string;
  observacion?: string;
  notasRevision?: string;
}

export interface DocumentoTramiteRevisionRequest {
  estado: string;
  notasRevision?: string;
  calificacion?: number;
}

// PROYECCIÓN ENRIQUECIDA
export interface DocumentoTramiteEnriquecido {
  id: number;
  tramiteId: number;
  tramiteCodigoRUT?: string;
  requisitoId: number;
  requisitoNombre?: string;
  descripcion?: string;
  esExamen?: boolean;
  estado: string;
  estadoFormateado?: string;
  colorEstado?: string;
  iconoEstado?: string;
  fechaPresentacion?: Date;
  fechaRevision?: Date;
  archivoUrl?: string;
  archivoNombre?: string;
  observacion?: string;
  notasRevision?: string;
  revisionUsuarioNombre?: string;
  grupoPresentacion?: any;
  calificacion?: number;
  diasEnRevision?: number;
}
