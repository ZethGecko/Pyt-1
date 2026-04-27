// ==========================================
// MÓDULO TRÁMITES
// MODELO REQUISITO TUPAC
// ==========================================

export interface RequisitoTUPAC {
  id: number;
  codigo: string;
  descripcion: string;
  tipoDocumento: string;
  obligatorio: boolean;
  esExamen: boolean;
  formatoReferencia?: string;
  observaciones?: string;
  activo: boolean;
  diasValidez?: number;
  entidadEmisora?: string;
  costoAproximado?: number;
  
  // Campos calculados/auxiliares
  nombreCompleto?: string;
  tipoDocumentoFormateado?: string;
}

export interface RequisitoTUPACEnriquecido extends RequisitoTUPAC {
  // Campos adicionales de proyecciones
  tupacId?: number;
  tupacNombre?: string;
  tupacCodigo?: string;
  totalDocumentos?: number;
  documentosAprobados?: number;
  documentosPendientes?: number;
  // Campos de formato
  formatoId?: number | null;
  formatoDescripcion?: string;
  formatoArchivoRuta?: string;
}

export interface RequisitoTUPACSelectOption {
  id: number;
  codigo: string;
  descripcion: string;
  nombreCompleto: string;
  tipoDocumento: string;
  obligatorio: boolean;
  esExamen: boolean;
}

export interface EstadisticasRequisito {
  totalDocumentos: number;
  documentosAprobados: number;
  documentosPendientes: number;
  documentosObservados: number;
  documentosRechazados: number;
  tasaAprobacion: number;
  ultimaActualizacion: Date;
}
