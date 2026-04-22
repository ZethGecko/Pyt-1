import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TipoSolicitud {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TipoSolicitudResponse {
  content: TipoSolicitud[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class TipoSolicitudService {
  private apiUrl = `${environment.apiUrl}/tipo-solicitud`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 50): Observable<TipoSolicitudResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<TipoSolicitudResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<TipoSolicitud> {
    return this.http.get<TipoSolicitud>(`${this.apiUrl}/${id}`);
  }

  getActivos(): Observable<TipoSolicitud[]> {
    return this.http.get<TipoSolicitud[]>(`${this.apiUrl}/activos`);
  }

  create(tipo: Partial<TipoSolicitud>): Observable<TipoSolicitud> {
    return this.http.post<TipoSolicitud>(this.apiUrl, tipo);
  }

  update(id: number, tipo: Partial<TipoSolicitud>): Observable<TipoSolicitud> {
    return this.http.put<TipoSolicitud>(`${this.apiUrl}/${id}`, tipo);
  }

  toggleActivo(id: number): Observable<TipoSolicitud> {
    return this.http.patch<TipoSolicitud>(`${this.apiUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
