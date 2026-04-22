import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Solicitud {
  id: number;
  expedienteId: number;
  vehiculoId: number;
  tipoSolicitud: string;
  estadoSolicitud: string;
  fechaSolicitud: string;
  motivoRechazo?: string;
  observaciones?: string;
  fechaAprobacion?: string;
  fechaRechazo?: string;
  usuarioApruebaId?: number;
  usuarioRechazaId?: number;
  numeroOrden?: number;
  fechaActualizacion?: string;
  expediente?: {
    id: number;
    codigoExpediente: string;
    empresa?: {
      id: number;
      razonSocial: string;
    };
  };
  vehiculo?: {
    id: number;
    placa: string;
    modelo: string;
  };
  usuarioAprueba?: {
    id: number;
    nombre: string;
  };
  usuarioRechaza?: {
    id: number;
    nombre: string;
  };
  tucs?: any[];
  tramites?: any[];
}

export interface SolicitudResponse {
  content: Solicitud[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface SolicitudCreateRequest {
  expedienteId: number;
  vehiculoId: number;
  tipoSolicitud: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitud`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<SolicitudResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SolicitudResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.apiUrl}/${id}`);
  }

  getByExpediente(expedienteId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.apiUrl}/expediente/${expedienteId}`);
  }

  getByVehiculo(vehiculoId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`);
  }

  getByEstado(estado: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.apiUrl}/estado/${estado}`);
  }

  create(solicitud: SolicitudCreateRequest): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.apiUrl, solicitud);
  }

  createLote(expedienteId: number, solicitudes: SolicitudCreateRequest[]): Observable<Solicitud[]> {
    return this.http.post<Solicitud[]>(`${this.apiUrl}/lote/${expedienteId}`, solicitudes);
  }

  update(id: number, solicitud: Partial<Solicitud>): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.apiUrl}/${id}`, solicitud);
  }

  approve(id: number, usuarioApruebaId: number): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.apiUrl}/${id}/aprobar`, { usuarioApruebaId });
  }

  reject(id: number, motivoRechazo: string, usuarioRechazaId: number): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.apiUrl}/${id}/rechazar`, {
      motivoRechazo,
      usuarioRechazaId
    });
  }

  observe(id: number, observaciones: string): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.apiUrl}/${id}/observar`, { observaciones });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
