import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Publicacion {
  id: number;
  titulo: string;
  contenido: string;
  tipoPublicacion: string;
  tipoTramiteId?: number;
  formatoId?: number;
  estado: string;
  fechaPublicacion?: string;
  fechaActualizacion?: string;
  tipoTramite?: {
    id: number;
    nombre: string;
  };
  formato?: {
    id: number;
    nombre: string;
  };
}

export interface PublicacionResponse {
  content: Publicacion[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {
  private apiUrl = `${environment.apiUrl}/publicacion`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<PublicacionResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PublicacionResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
  }

  getPublicadas(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicadas`);
  }

  getByTipo(tipo: string): Observable<Publicacion[]> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.get<Publicacion[]>(`${this.apiUrl}/tipo`, { params });
  }

  getByTipoTramite(tipoTramiteId: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.apiUrl}/tipo-tramite/${tipoTramiteId}`);
  }

  search(term: string): Observable<Publicacion[]> {
    const params = new HttpParams().set('q', term);
    return this.http.get<Publicacion[]>(`${this.apiUrl}/search`, { params });
  }

  create(publicacion: Partial<Publicacion>): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.apiUrl, publicacion);
  }

  update(id: number, publicacion: Partial<Publicacion>): Observable<Publicacion> {
    return this.http.put<Publicacion>(`${this.apiUrl}/${id}`, publicacion);
  }

  publish(id: number): Observable<Publicacion> {
    return this.http.patch<Publicacion>(`${this.apiUrl}/${id}/publicar`, {});
  }

  archive(id: number): Observable<Publicacion> {
    return this.http.patch<Publicacion>(`${this.apiUrl}/${id}/archivar`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
