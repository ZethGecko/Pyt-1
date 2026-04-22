import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EstiloRuta {
  id: number;
  rutaId: number;
  tipoEstilo: string;
  color: string;
  anchoLinea: number;
  urlIcono?: string;
  opacidad: number;
  descripcion?: string;
  ruta?: {
    id: number;
    nombre: string;
  };
}

export interface EstiloRutaResponse {
  content: EstiloRuta[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstiloRutaService {
  private apiUrl = `${environment.apiUrl}/estilo-ruta`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 50): Observable<EstiloRutaResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<EstiloRutaResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<EstiloRuta> {
    return this.http.get<EstiloRuta>(`${this.apiUrl}/${id}`);
  }

  getByRuta(rutaId: number): Observable<EstiloRuta[]> {
    return this.http.get<EstiloRuta[]>(`${this.apiUrl}/ruta/${rutaId}`);
  }

  getByTipo(tipoEstilo: string): Observable<EstiloRuta[]> {
    const params = new HttpParams().set('tipo', tipoEstilo);
    return this.http.get<EstiloRuta[]>(`${this.apiUrl}/tipo`, { params });
  }

  create(estilo: Partial<EstiloRuta>): Observable<EstiloRuta> {
    return this.http.post<EstiloRuta>(this.apiUrl, estilo);
  }

  createMultiple(rutaId: number, estilos: Partial<EstiloRuta>[]): Observable<EstiloRuta[]> {
    return this.http.post<EstiloRuta[]>(`${this.apiUrl}/multiple/${rutaId}`, estilos);
  }

  update(id: number, estilo: Partial<EstiloRuta>): Observable<EstiloRuta> {
    return this.http.put<EstiloRuta>(`${this.apiUrl}/${id}`, estilo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
