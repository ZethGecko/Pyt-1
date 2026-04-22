export interface RequisitoTUPAC {
  id?: number;
  tupac: {
    id: number;
    codigo: string;
    nombre: string;
  };
  descripcion: string;
  codigo: string;
  obligatorio: boolean;
  tipoDocumento: string;
  esExamen: boolean;
  observaciones?: string;
  activo: boolean;
  diasValidez?: number;
  formato?: {
    id: number;
    descripcion: string;
    archivoRuta: string;
  } | null;
  formatoId?: number | null;
}

export interface RequisitoTUPACCreateRequest {
  tupac: { id: number };
  descripcion: string;
  codigo: string;
  obligatorio?: boolean;
  tipoDocumento: string;
  esExamen?: boolean;
  observaciones?: string;
  activo?: boolean;
  diasValidez?: number | null;
  formatoId?: number | null;
}

export interface RequisitoTUPACUpdateRequest {
  tupac?: { id: number };
  descripcion?: string;
  codigo?: string;
  obligatorio?: boolean;
  tipoDocumento?: string;
  esExamen?: boolean;
  observaciones?: string;
  activo?: boolean;
  diasValidez?: number | null;
  formatoId?: number | null;
}

export interface RequisitoTUPACEnriquecidoProjection {
  id: number;
  codigo: string;
  descripcion: string;
  obligatorio: boolean;
  tipoDocumento: string;
  esExamen: boolean;
  observaciones?: string;
  activo: boolean;
  diasValidez?: number;
  
  // Datos del TUPAC
  tupacId: number;
  tupacCodigo: string;
  tupacDescripcion: string;
  tupacCategoria?: string;
  tupacEstado: string;
  
  // Datos del Formato
  formatoId?: number;
  formatoDescripcion?: string;
  formatoArchivoRuta?: string;
  
  // Estadísticas
  totalDocumentos: number;
  documentosAprobados: number;
  documentosPendientes: number;
  gruposProgramados: number;
  
  // Métodos calculados (no son propiedades reales, se calculan en el backend)
  // pero los incluimos para TypeScript
  tipoDocumentoFormateado?: string;
  estado?: string;
  obligatorioTexto?: string;
  esExamenTexto?: string;
  infoResumen?: string;
  
  // Métodos helper
  tieneFormato?: boolean;
  formatoInfo?: string;
}

export type TipoDocumento = 
  | 'Constancia' 
  | 'Certificado' 
  | 'Documento' 
  | 'Foto Copia' 
  | 'Otro';

export const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: 'Constancia', label: 'Constancia' },
  { value: 'Certificado', label: 'Certificado' },
  { value: 'Documento', label: 'Documento' },
  { value: 'Foto Copia', label: 'Foto Copia' },
  { value: 'Otro', label: 'Otro' }
];
