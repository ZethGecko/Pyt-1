import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TUCResponse {
  id: number;
  numero: string;
  vehiculoId: number;
  vehiculoPlaca?: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  estado: string;
  categoria: string;
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

@Injectable({ providedIn: 'root' })
export class TucService {
  private apiUrl = `${environment.apiUrl}/tucs`;

  constructor(private http: HttpClient) {}

  // ========== CRUD ==========
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

  // ========== UTILIDADES ==========
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
