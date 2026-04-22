import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ObservacionesInspeccion {
  id: number;
  observacion: string;
  fichaInspeccionId: number;
  fichaInspeccion?: {
    id: number;
    resultado: string;
    fechaInspeccion: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ObservacionesInspeccionService {
  private apiUrl = `${environment.apiUrl}/observaciones-inspeccion`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ObservacionesInspeccion[]> {
    return this.http.get<ObservacionesInspeccion[]>(this.apiUrl);
  }

  getById(id: number): Observable<ObservacionesInspeccion> {
    return this.http.get<ObservacionesInspeccion>(`${this.apiUrl}/${id}`);
  }

  getByFichaInspeccion(fichaId: number): Observable<ObservacionesInspeccion[]> {
    return this.http.get<ObservacionesInspeccion[]>(`${this.apiUrl}/ficha/${fichaId}`);
  }

  create(observacion: Partial<ObservacionesInspeccion>): Observable<ObservacionesInspeccion> {
    return this.http.post<ObservacionesInspeccion>(this.apiUrl, observacion);
  }

  createMultiple(fichaId: number, observaciones: string[]): Observable<ObservacionesInspeccion[]> {
    return this.http.post<ObservacionesInspeccion[]>(`${this.apiUrl}/multiple/${fichaId}`, observaciones);
  }

  update(id: number, observacion: Partial<ObservacionesInspeccion>): Observable<ObservacionesInspeccion> {
    return this.http.put<ObservacionesInspeccion>(`${this.apiUrl}/${id}`, observacion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
