import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ParametrosInspeccion {
  id: number;
  parametro: string;
  observacion?: string;
  fichaInspeccionId: number;
  fichaInspeccion?: {
    id: number;
    resultado: string;
  };
}

export interface ParametrosInspeccionResponse {
  content: ParametrosInspeccion[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParametrosInspeccionService {
  private apiUrl = `${environment.apiUrl}/parametros-inspeccion`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ParametrosInspeccion[]> {
    return this.http.get<ParametrosInspeccion[]>(this.apiUrl);
  }

  getById(id: number): Observable<ParametrosInspeccion> {
    return this.http.get<ParametrosInspeccion>(`${this.apiUrl}/${id}`);
  }

  getByFichaInspeccion(fichaId: number): Observable<ParametrosInspeccion[]> {
    return this.http.get<ParametrosInspeccion[]>(`${this.apiUrl}/ficha/${fichaId}`);
  }

  create(parametro: Partial<ParametrosInspeccion>): Observable<ParametrosInspeccion> {
    return this.http.post<ParametrosInspeccion>(this.apiUrl, parametro);
  }

  createMultiple(fichaId: number, parametros: Partial<ParametrosInspeccion>[]): Observable<ParametrosInspeccion[]> {
    return this.http.post<ParametrosInspeccion[]>(`${this.apiUrl}/multiple/${fichaId}`, parametros);
  }

  update(id: number, parametro: Partial<ParametrosInspeccion>): Observable<ParametrosInspeccion> {
    return this.http.put<ParametrosInspeccion>(`${this.apiUrl}/${id}`, parametro);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
