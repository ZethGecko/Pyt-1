// ==========================================
// VEHÍCULO
// ==========================================

export interface Vehiculo {
  id: number;
  placa: string;
  vin?: string;
  motor?: string;
  fechaFabricacion?: number;
  color?: string;
  marca?: string;
  modelo?: string;
  clase?: string;
  categoriaTransporteId?: number;
  empresaId?: number;
  numeroAsientos?: number;
  pesoNeto?: number;
  pesoBruto?: number;
  largo?: number;
  ancho?: number;
  alto?: number;
  cilindrada?: number;
  potencia?: number;
  combustible?: string;
  numeroEjes?: number;
  estado: string;
  fechaCreacion?: Date;
}

export interface VehiculoCreateRequest {
  placa: string;
  vin?: string;
  motor?: string;
  fechaFabricacion?: number;
  color?: string;
  marca?: string;
  modelo?: string;
  clase?: string;
  categoriaTransporteId?: number;
  empresaId?: number;
  numeroAsientos?: number;
  pesoNeto?: number;
  pesoBruto?: number;
  largo?: number;
  ancho?: number;
  alto?: number;
  cilindrada?: number;
  potencia?: number;
  combustible?: string;
  numeroEjes?: number;
}

export interface VehiculoUpdateRequest {
  vin?: string;
  motor?: string;
  fechaFabricacion?: number;
  color?: string;
  marca?: string;
  modelo?: string;
  empresaId?: number;
  numeroAsientos?: number;
  pesoNeto?: number;
  pesoBruto?: number;
  estado?: string;
}

export interface VehiculoEnriquecido {
  id: number;
  placa: string;
  vin?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  fechaFabricacion?: number;
  categoriaTransporteId?: number;
  categoriaTransporteNombre?: string;
  empresaId?: number;
  empresaRazonSocial?: string;
  numeroAsientos?: number;
  estado: string;
  estadoFormateado?: string;
  tucVigente?: boolean;
  tucFechaVencimiento?: Date;
  totalTucs?: number;
  inspeccionesCount?: number;
}

export interface FiltrosVehiculo {
  search?: string;
  placa?: string;
  empresaId?: number;
  categoriaTransporteId?: number;
  estado?: string;
}
