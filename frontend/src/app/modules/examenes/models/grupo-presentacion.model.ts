// ==========================================
// GRUPO DE PRESENTACIÓN
// ==========================================

export interface GrupoPresentacion {
  id: number;
  requisitoExamen: {
    id: number;
  };
  requisitoTUPACNombre?: string;
  fecha: string | Date;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  cuposDisponibles: number;
  observaciones?: string;
  estado: string;
}

export interface GrupoPresentacionCreateRequest {
  codigo: string;
  requisitoExamenId: number | null;
  fecha: string | Date;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  observaciones?: string;
}

export interface GrupoPresentacionEnriquecido {
  id: number;
  requisitoExamen: {
    id: number;
    descripcion?: string;
  };
  fecha: string | Date;
  fechaFormateada?: string;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  cuposDisponibles: number;
  estado: string;
  estadoFormateado?: string;
  colorEstado?: string;
}

export interface AsignarExamenRequest {
  documentoTramiteId: number;
  grupoPresentacionId: number;
}
