import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PuntoRuta {
  id: number;
  rutaId: number;
  nombre?: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
  orden?: number;
  ruta?: {
    id: number;
    nombre: string;
  };
}

export interface PuntoRutaResponse {
  content: PuntoRuta[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class PuntoRutaService {
  private apiUrl = `${environment.apiUrl}/punto-ruta`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PuntoRuta[]> {
    return this.http.get<PuntoRuta[]>(this.apiUrl);
  }

  getById(id: number): Observable<PuntoRuta> {
    return this.http.get<PuntoRuta>(`${this.apiUrl}/${id}`);
  }

  getByRuta(rutaId: number): Observable<PuntoRuta[]> {
    return this.http.get<PuntoRuta[]>(`${this.apiUrl}/ruta/${rutaId}`);
  }

  create(punto: Partial<PuntoRuta>): Observable<PuntoRuta> {
    return this.http.post<PuntoRuta>(this.apiUrl, punto);
  }

  createMultiple(rutaId: number, puntos: Partial<PuntoRuta>[]): Observable<PuntoRuta[]> {
    return this.http.post<PuntoRuta[]>(`${this.apiUrl}/multiple/${rutaId}`, puntos);
  }

  update(id: number, punto: Partial<PuntoRuta>): Observable<PuntoRuta> {
    return this.http.put<PuntoRuta>(`${this.apiUrl}/${id}`, punto);
  }

  reorder(id: number, nuevoOrden: number): Observable<PuntoRuta> {
    return this.http.patch<PuntoRuta>(`${this.apiUrl}/${id}/reorder`, { orden: nuevoOrden });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
