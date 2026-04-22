import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface HistorialTramite {
  id: number;
  tramiteId: number;
  usuarioAccionId?: number;
  departamentoOrigenId?: number;
  departamentoDestinoId?: number;
  accion: string;
  observacion?: string;
  fechaAccion: string;
  tramite?: {
    id: number;
    numeroExpediente: string;
    estado: string;
  };
  usuarioAccion?: {
    id: number;
    nombre: string;
  };
  departamentoOrigen?: {
    id: number;
    nombre: string;
  };
  departamentoDestino?: {
    id: number;
    nombre: string;
  };
}

export interface HistorialTramiteResponse {
  content: HistorialTramite[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialTramiteService {
  private apiUrl = `${environment.apiUrl}/historial-tramite`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 50): Observable<HistorialTramiteResponse> {
    return this.http.get<HistorialTramiteResponse>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getById(id: number): Observable<HistorialTramite> {
    return this.http.get<HistorialTramite>(`${this.apiUrl}/${id}`);
  }

  getByTramite(tramiteId: number): Observable<HistorialTramite[]> {
    return this.http.get<HistorialTramite[]>(`${this.apiUrl}/tramite/${tramiteId}`);
  }

  getByUsuario(usuarioId: number): Observable<HistorialTramite[]> {
    return this.http.get<HistorialTramite[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  create(historial: Partial<HistorialTramite>): Observable<HistorialTramite> {
    return this.http.post<HistorialTramite>(this.apiUrl, historial);
  }

  createDerivacion(tramiteId: number, destinoId: number, observacion: string): Observable<HistorialTramite> {
    return this.http.post<HistorialTramite>(`${this.apiUrl}/derivar`, {
      tramiteId,
      departamentoDestinoId: destinoId,
      observacion,
      accion: 'derivar'
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
