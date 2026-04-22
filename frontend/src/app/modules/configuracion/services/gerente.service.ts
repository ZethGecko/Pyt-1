import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Gerente {
  id: number;
  nombre: string;
  dni: number;
  telefono?: string;
  whatsapp?: string;
  partidaElectronica?: string;
  inicioVigenciaPoder: string;
  finVigenciaPoder?: string;
  fechaRegistro: string;
  fechaActualizacion: string;
  activo: boolean;
  empresas?: any[];
}

export interface GerenteResponse {
  content: Gerente[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class GerenteService {
  private apiUrl = `${environment.apiUrl}/gerente`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<GerenteResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<GerenteResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Gerente> {
    return this.http.get<Gerente>(`${this.apiUrl}/${id}`);
  }

  getByDni(dni: number): Observable<Gerente> {
    return this.http.get<Gerente>(`${this.apiUrl}/dni/${dni}`);
  }

  getActivos(): Observable<Gerente[]> {
    return this.http.get<Gerente[]>(`${this.apiUrl}/activos`);
  }

  search(term: string): Observable<Gerente[]> {
    const params = new HttpParams().set('q', term);
    return this.http.get<Gerente[]>(`${this.apiUrl}/search`, { params });
  }

  create(gerente: Partial<Gerente>): Observable<Gerente> {
    return this.http.post<Gerente>(this.apiUrl, gerente);
  }

  update(id: number, gerente: Partial<Gerente>): Observable<Gerente> {
    return this.http.put<Gerente>(`${this.apiUrl}/${id}`, gerente);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActivo(id: number): Observable<Gerente> {
    return this.http.patch<Gerente>(`${this.apiUrl}/${id}/toggle-activo`, {});
  }
}
