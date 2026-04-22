import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SeguimientoTramiteResponse {
  id: number;
  tramiteId: number;
  etapaId: number;
  etapaNombre?: string;
  etapaOrden?: number;
  departamentoOrigenId?: number;
  departamentoOrigenNombre?: string;
  departamentoDestinoId?: number;
  departamentoDestinoNombre?: string;
  usuarioMovimientoId: number;
  usuarioMovimientoNombre?: string;
  fechaMovimiento: Date;
  instrucciones?: string;
  observacion?: string;
}

export interface SeguimientoTramiteCreateRequest {
  tramiteId: number;
  etapaId?: number;
  departamentoOrigenId?: number;
  departamentoDestinoId: number;
  instrucciones?: string;
}

@Injectable({ providedIn: 'root' })
export class SeguimientoTramiteService {
  private apiUrl = `${environment.apiUrl}/seguimiento-tramites`;
  
  constructor(private http: HttpClient) {}
  
  // ========== CRUD ==========
  obtener(id: number): Observable<SeguimientoTramiteResponse> {
    return this.http.get<SeguimientoTramiteResponse>(`${this.apiUrl}/${id}`);
  }
  
  obtenerPorTramite(tramiteId: number): Observable<SeguimientoTramiteResponse[]> {
    return this.http.get<SeguimientoTramiteResponse[]>(`${this.apiUrl}/tramite/${tramiteId}`);
  }
  
  crear(seguimiento: SeguimientoTramiteCreateRequest): Observable<SeguimientoTramiteResponse> {
    return this.http.post<SeguimientoTramiteResponse>(this.apiUrl, seguimiento);
  }
  
  actualizar(id: number, seguimiento: Partial<SeguimientoTramiteCreateRequest>): Observable<SeguimientoTramiteResponse> {
    return this.http.put<SeguimientoTramiteResponse>(`${this.apiUrl}/${id}`, seguimiento);
  }
  
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // ========== LISTADOS ==========
  obtenerUltimo(tramiteId: number): Observable<SeguimientoTramiteResponse> {
    return this.http.get<SeguimientoTramiteResponse>(`${this.apiUrl}/tramite/${tramiteId}/ultimo`);
  }
  
  obtenerPorEtapa(tramiteId: number, etapaId: number): Observable<SeguimientoTramiteResponse[]> {
    return this.http.get<SeguimientoTramiteResponse[]>(`${this.apiUrl}/tramite/${tramiteId}/etapa/${etapaId}`);
  }
  
  obtenerPorDepartamento(departamentoId: number): Observable<SeguimientoTramiteResponse[]> {
    return this.http.get<SeguimientoTramiteResponse[]>(`${this.apiUrl}/departamento/${departamentoId}`);
  }
  
  // ========== EXPORTACIÓN ==========
  exportarHistorial(tramiteId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tramite/${tramiteId}/exportar`, {
      responseType: 'blob'
    });
  }
}
