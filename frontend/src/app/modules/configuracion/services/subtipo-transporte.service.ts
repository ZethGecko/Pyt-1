import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SubtipoTransporte {
  id: number;
  nombre: string;
  tipoTransporte: {
    id: number;
    nombre?: string;
  };
}

export interface SubtipoTransporteResponse {
  content: SubtipoTransporte[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubtipoTransporteService {
  private apiUrl = `${environment.apiUrl}/subtipos-transporte`;

  constructor(private http: HttpClient) {}

  // Endpoint sin paginación
  getAll(): Observable<SubtipoTransporte[]> {
    return this.http.get<SubtipoTransporte[]>(this.apiUrl);
  }

  // Endpoint con paginación (si el backend lo soporta)
  getAllPaged(page: number = 0, size: number = 50): Observable<SubtipoTransporteResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SubtipoTransporteResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<SubtipoTransporte> {
    return this.http.get<SubtipoTransporte>(`${this.apiUrl}/${id}`);
  }

  getByTipoTransporte(tipoTransporteId: number): Observable<SubtipoTransporte[]> {
    return this.http.get<SubtipoTransporte[]>(`${this.apiUrl}/tipo/${tipoTransporteId}`);
  }

  create(subtipo: any): Observable<SubtipoTransporte> {
    return this.http.post<SubtipoTransporte>(this.apiUrl, subtipo);
  }

  update(id: number, subtipo: any): Observable<SubtipoTransporte> {
    return this.http.put<SubtipoTransporte>(`${this.apiUrl}/${id}`, subtipo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
