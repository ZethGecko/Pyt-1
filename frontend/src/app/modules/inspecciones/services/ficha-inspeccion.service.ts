import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FichaInspeccion {
  id: number;
  inspeccionId: number;
  vehiculoId: number;
  solicitudId: number;
  estado: boolean;
  resultado?: string;
  fechaInspeccion?: string;
  observaciones?: string;
  usuarioInspectorId: number;
  inspeccion?: {
    id: number;
    fechaProgramada: string;
    estado: string;
  };
  vehiculo?: {
    id: number;
    placa: string;
    modelo: string;
  };
  solicitud?: {
    id: number;
    tipoSolicitud: string;
  };
  usuarioInspector?: {
    id: number;
    nombre: string;
  };
  evaluacionesParametros?: any[];
}

export interface FichaInspeccionResponse {
  content: FichaInspeccion[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class FichaInspeccionService {
  private apiUrl = `${environment.apiUrl}/fichas-inspeccion`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<FichaInspeccionResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<FichaInspeccionResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<FichaInspeccion> {
    return this.http.get<FichaInspeccion>(`${this.apiUrl}/${id}`);
  }

  getByInspeccion(inspeccionId: number): Observable<FichaInspeccion[]> {
    return this.http.get<FichaInspeccion[]>(`${this.apiUrl}/inspeccion/${inspeccionId}`);
  }

  getByVehiculo(vehiculoId: number): Observable<FichaInspeccion[]> {
    return this.http.get<FichaInspeccion[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`);
  }

  getBySolicitud(solicitudId: number): Observable<FichaInspeccion> {
    return this.http.get<FichaInspeccion>(`${this.apiUrl}/solicitud/${solicitudId}`);
  }

  create(ficha: Partial<FichaInspeccion>): Observable<FichaInspeccion> {
    return this.http.post<FichaInspeccion>(this.apiUrl, ficha);
  }

  update(id: number, ficha: Partial<FichaInspeccion>): Observable<FichaInspeccion> {
    return this.http.put<FichaInspeccion>(`${this.apiUrl}/${id}`, ficha);
  }

  finalize(id: number, resultado: string, observaciones: string): Observable<FichaInspeccion> {
    return this.http.patch<FichaInspeccion>(`${this.apiUrl}/${id}/finalizar`, {
      resultado,
      observaciones,
      estado: true
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Copia el modelo de la primera ficha a todas las demás de la inspección.
   */
  copiarModeloATodasLasFichas(inspeccionId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inspeccion/${inspeccionId}/copiar-modelo`, {});
  }
}
