import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Ruta {
  idRuta: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  distanciaKm?: number;
  tiempoEstimadoMinutos?: number;
  estado?: string;
  tipo?: string;
  observaciones?: string;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  empresaId?: number;
  empresaNombre?: string;
  empresaRuc?: string;
  gerenteResponsableId?: number;
  gerenteResponsableNombre?: string;
  usuarioRegistraId?: number;
  usuarioRegistraNombre?: string;
  puntosRuta?: any[];
  kmlContent?: string;
}

export interface RoutePreview {
  name: string;
  description: string;
  points: Point[];
}

export interface Point {
  lat: number;
  lng: number;
}


@Injectable({
  providedIn: 'root'
})
export class RutaService {
  private apiUrl = `${environment.apiUrl}/rutas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(this.apiUrl);
  }

  getById(id: number): Observable<Ruta> {
    return this.http.get<Ruta>(`${this.apiUrl}/${id}`);
  }

  getByEmpresa(empresaId: number): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  getActivas(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${this.apiUrl}/activas`);
  }

  search(term: string): Observable<Ruta[]> {
    const params = new HttpParams().set('q', term);
    return this.http.get<Ruta[]>(`${this.apiUrl}/search`, { params });
  }

  create(ruta: Partial<Ruta>): Observable<Ruta> {
    return this.http.post<Ruta>(this.apiUrl, ruta);
  }

  update(id: number, ruta: Partial<Ruta>): Observable<Ruta> {
    return this.http.put<Ruta>(`${this.apiUrl}/${id}`, ruta);
  }

  toggleActivo(id: number): Observable<Ruta> {
    return this.http.patch<Ruta>(`${this.apiUrl}/${id}/toggle`, {});
  }

  uploadKml(id: number, file: File): Observable<Ruta> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Ruta>(`${this.apiUrl}/${id}/upload-kml`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  parseKml(file: File): Observable<RoutePreview[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<RoutePreview[]>(`${this.apiUrl}/parse-kml`, formData);
  }

    uploadKmlNew(file: File, routeIndex: number, nombre: string, descripcion: string, empresaId?: number, createPoints: boolean = true): Observable<Ruta> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('routeIndex', routeIndex.toString());
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        if (empresaId) {
            formData.append('empresaId', empresaId.toString());
        }
        formData.append('createPoints', createPoints.toString());
        return this.http.post<Ruta>(`${this.apiUrl}/upload-kml`, formData);
    }
}
