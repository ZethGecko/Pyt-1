import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PuntoGeografico {
  id: number;
  empresaId: number;
  rutaId?: number;
  nombreReferencia: string;
  tipo: string;
  latitud: number;
  longitud: number;
  altitud?: number;
  orden?: number;
  esPrincipal: boolean;
  empresa?: {
    id: number;
    razonSocial: string;
  };
  ruta?: {
    id: number;
    nombre: string;
  };
}

export interface PuntoGeograficoResponse {
  content: PuntoGeografico[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class PuntoGeograficoService {
  private apiUrl = `${environment.apiUrl}/punto-geografico`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 50): Observable<PuntoGeograficoResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PuntoGeograficoResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<PuntoGeografico> {
    return this.http.get<PuntoGeografico>(`${this.apiUrl}/${id}`);
  }

  getByEmpresa(empresaId: number): Observable<PuntoGeografico[]> {
    return this.http.get<PuntoGeografico[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  getByRuta(rutaId: number): Observable<PuntoGeografico[]> {
    return this.http.get<PuntoGeografico[]>(`${this.apiUrl}/ruta/${rutaId}`);
  }

  getByTipo(tipo: string): Observable<PuntoGeografico[]> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.get<PuntoGeografico[]>(`${this.apiUrl}/tipo`, { params });
  }

  getByCoordenadas(latitud: number, longitud: number, radioKm: number = 1): Observable<PuntoGeografico[]> {
    const params = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString())
      .set('radio', radioKm.toString());
    return this.http.get<PuntoGeografico[]>(`${this.apiUrl}/cercanos`, { params });
  }

  create(punto: Partial<PuntoGeografico>): Observable<PuntoGeografico> {
    return this.http.post<PuntoGeografico>(this.apiUrl, punto);
  }

  createMultiple(empresaId: number, puntos: Partial<PuntoGeografico>[]): Observable<PuntoGeografico[]> {
    return this.http.post<PuntoGeografico[]>(`${this.apiUrl}/multiple/${empresaId}`, puntos);
  }

  update(id: number, punto: Partial<PuntoGeografico>): Observable<PuntoGeografico> {
    return this.http.put<PuntoGeografico>(`${this.apiUrl}/${id}`, punto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
