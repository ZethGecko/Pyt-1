// ==========================================
// Modelos para Búsqueda de Rutas con Mapas
// ==========================================

export interface Ubicacion {
  latitud: number;
  longitud: number;
  direccion?: string;
}

export interface SolicitudBusquedaRuta {
  ubicacionActual: Ubicacion;
  puntoPartida?: Ubicacion;
  puntoDestino: Ubicacion;
  radioBusquedaKm?: number;
}

export interface ResultadoBusquedaRuta {
  rutaId: number;
  nombreRuta: string;
  codigoRuta: string;
  empresaId: number;
  nombreEmpresa: string;
  distanciaDesdePartida: number;
  distanciaAlDestino: number;
  puntosGeograficos: PuntoGeograficoRuta[];
  scoreRelevancia: number;
}

export interface PuntoGeograficoRuta {
  latitud: number;
  longitud: number;
  nombre: string;
  orden: number;
  tipo: string;
}

export interface EmpresaInfo {
  id: number;
  nombre: string;
  ruc: string;
  contactoTelefono?: string;
  email?: string;
  estadoOperativo: string;
  subtipoTransporte?: string;
}

export interface RutaCompleta {
  id: number;
  empresaId: number;
  nombreRuta: string;
  codigoRuta: string;
  tipoRuta?: string;
  colorRuta?: string;
  puntosGeograficos: PuntoGeograficoRuta[];
  empresa?: EmpresaInfo;
}

export interface FiltrosBusqueda {
  radioKm: number;
  soloActivas: boolean;
  tipoRuta?: string;
}
