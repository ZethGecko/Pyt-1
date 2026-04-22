export interface EtapaTramite {
  id: number;
  tipoTramite: {
    id: number;
    codigo: string;
    descripcion: string;
  };
  nombreEtapa: string;
  orden: number;
  departamento?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  tiempoEstimadoDias?: number;
  estadoEsperado?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacion?: string;
  usuarioActualizacion?: string;
}

export interface EtapaTramiteProjection {
  id: number;
  nombreEtapa: string;
  orden: number;
  departamentoNombre?: string;
  tiempoEstimadoDias?: number;
  activo: boolean;
}
