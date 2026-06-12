import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export interface TUCResponse {
  id?: number;
  idTuc?: number;
  numero?: string;
  codigo?: string;
  tipo?: string;
  vehiculoId?: number;
  vehiculoPlaca?: string;
  vehiculoMarca?: string;
  vehiculoModelo?: string;
  fechaEmision?: Date;
  fechaVencimiento?: Date;
  estado?: string;
  categoria?: string;
  empresaId?: number;
  empresaNombre?: string;
  empresaRuc?: string;
  observaciones?: string;
  archivoUrl?: string;
}

export interface TUCCreateRequest {
  vehiculoId: number;
  categoria: string;
  observaciones?: string;
}

export interface TUCRenovacionRequest {
  nuevoVehiculoId?: number;
  observaciones?: string;
}

export interface TucInspeccionResponse {
  idInspeccion: number;
  codigo: string;
  fechaProgramada: string;
  hora?: string;
  lugar: string;
  estado?: string;
  resultadoGeneral?: string;
  fechaEjecucion?: string;
  fechaCreacion?: string;
  empresaId?: number;
  empresaNombre?: string;
  empresaRuc?: string;
  vehiculos?: TucVehiculoResponse[];
}

export interface TucVehiculoResponse {
  idVehiculo?: number;
  fichaId?: number;
  inspeccionId?: number;
  placa?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  categoria?: string;
  anioFabricacion?: number;
  subtipoTransporteId?: number;
  empresaId?: number;
  estado?: string;
  resultadoFicha?: string;
  estadoFicha?: boolean;
  tieneTucActivo?: boolean;
  fechaVencimientoTuc?: string;
  observaciones?: string;
}

export interface TucHabilitacionRequest {
  empresaId: number;
  inspeccionId: number;
  tipo: '12_MESES' | 'HASTA_FIN_ANIO';
  anioVencimiento?: number;
  vehiculos: Array<{
    idVehiculo?: number;
    placa?: string;
    marca?: string;
    modelo?: string;
    anioFabricacion?: number;
    color?: string;
    categoria?: string;
    subtipoTransporteId?: number;
    pesoNeto?: number;
    observaciones?: string;
  }>;
}

export interface TucHabilitacionResponse {
  inspeccion?: TucInspeccionResponse;
  tucs: TUCResponse[];
  totalHabilitados: number;
}

@Injectable({ providedIn: 'root' })
export class TucService {
  private apiUrl = `${environment.apiUrl}/tuc`;

  constructor(private http: HttpClient) {}

  obtener(id: number): Observable<TUCResponse> {
    return this.http.get<TUCResponse>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<TUCResponse[]> {
    return this.http.get<TUCResponse[]>(this.apiUrl);
  }

  listarPorVehiculo(vehiculoId: number): Observable<TUCResponse[]> {
    return this.http.get<TUCResponse[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`);
  }

  listarVigentes(): Observable<TUCResponse[]> {
    return this.http.get<TUCResponse[]>(`${this.apiUrl}/vigentes`);
  }

  listarPorVencer(dias: number): Observable<TUCResponse[]> {
    return this.http.get<TUCResponse[]>(`${this.apiUrl}/por-vencer`, {
      params: { dias: dias.toString() }
    });
  }

  listarInspeccionesParaHabilitar(empresaId: number): Observable<TucInspeccionResponse[]> {
    return this.http.get<TucInspeccionResponse[]>(`${this.apiUrl}/empresa/${empresaId}/inspecciones-para-habilitar`);
  }

  habilitarPorInspeccion(request: TucHabilitacionRequest): Observable<TucHabilitacionResponse> {
    return this.http.post<TucHabilitacionResponse>(`${this.apiUrl}/emitir-habilitacion`, request);
  }

  crear(tuc: TUCCreateRequest): Observable<TUCResponse> {
    return this.http.post<TUCResponse>(this.apiUrl, tuc);
  }

  renovar(id: number, renovacion: TUCRenovacionRequest): Observable<TUCResponse> {
    return this.http.post<TUCResponse>(`${this.apiUrl}/${id}/renovar`, renovacion);
  }

  suspender(id: number, motivo: string): Observable<TUCResponse> {
    return this.http.put<TUCResponse>(`${this.apiUrl}/${id}/suspender`, null, {
      params: { motivo }
    });
  }

  cancelar(id: number, motivo: string): Observable<TUCResponse> {
    return this.http.put<TUCResponse>(`${this.apiUrl}/${id}/cancelar`, null, {
      params: { motivo }
    });
  }

  obtenerPorNumero(numero: string): Observable<TUCResponse | null> {
    return this.http.get<TUCResponse | null>(`${this.apiUrl}/numero/${numero}`);
  }

  verificarVigencia(id: number): Observable<{ vigente: boolean; diasRestantes: number }> {
    return this.http.get<{ vigente: boolean; diasRestantes: number }>(`${this.apiUrl}/${id}/verificar-vigencia`);
  }

  generarCertificado(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/certificado`, { responseType: 'blob' });
  }
}
