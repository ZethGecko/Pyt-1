import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ObservacionSolicitud {
  id: number;
  solicitudId: number;
  observacion: string;
  fechaObservacion: string;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre: string;
  };
  solicitud?: {
    id: number;
    tipoSolicitud: string;
    expedienteId: number;
  };
}

export interface ObservacionSolicitudResponse {
  content: ObservacionSolicitud[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ObservacionSolicitudService {
  private apiUrl = `${environment.apiUrl}/observacion-solicitud`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<ObservacionSolicitudResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ObservacionSolicitudResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ObservacionSolicitud> {
    return this.http.get<ObservacionSolicitud>(`${this.apiUrl}/${id}`);
  }

  getBySolicitud(solicitudId: number): Observable<ObservacionSolicitud[]> {
    return this.http.get<ObservacionSolicitud[]>(`${this.apiUrl}/solicitud/${solicitudId}`);
  }

  getByExpediente(expedienteId: number): Observable<ObservacionSolicitud[]> {
    return this.http.get<ObservacionSolicitud[]>(`${this.apiUrl}/expediente/${expedienteId}`);
  }

  create(observacion: Partial<ObservacionSolicitud>): Observable<ObservacionSolicitud> {
    return this.http.post<ObservacionSolicitud>(this.apiUrl, observacion);
  }

  update(id: number, observacion: Partial<ObservacionSolicitud>): Observable<ObservacionSolicitud> {
    return this.http.put<ObservacionSolicitud>(`${this.apiUrl}/${id}`, observacion);
  }

  createMasivo(expedienteId: number, observaciones: Partial<ObservacionSolicitud>[]): Observable<ObservacionSolicitud[]> {
    return this.http.post<ObservacionSolicitud[]>(`${this.apiUrl}/masivo/${expedienteId}`, observaciones);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
