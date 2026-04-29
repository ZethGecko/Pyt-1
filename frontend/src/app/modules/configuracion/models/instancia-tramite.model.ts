export interface InstanciaTramite {
  idInstancia: number;
  tramiteId: number;
  identificador: string;
  descripcion?: string;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
  observaciones?: string;
  tramite?: {
    idTramite: number;
    codigoRut: string;
    tipoTramiteDescripcion?: string;
    estado?: string;
  };
}
