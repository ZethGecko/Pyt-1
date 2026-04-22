// FORMATO
export interface Formato {
  id: number;
  descripcion: string;
  archivoRuta: string;
}

export interface FormatoCreateRequest {
  descripcion: string;
}

export interface FormatoUpdateRequest {
  descripcion?: string;
}

export interface FormatoEnriquecido {
  id: number;
  descripcion: string;
  archivoRuta: string;
  requisitosCount?: number;
}
