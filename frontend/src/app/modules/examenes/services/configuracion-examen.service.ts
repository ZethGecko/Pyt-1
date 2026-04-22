import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracionExamen {
  id: number;
  tipoExamen: string;
  nombre: string;
  descripcion?: string;
  capacidadGrupo: number;
  diasDisponibles?: number[];
  horariosDisponibles?: string[];
  tiempoValidezMeses: number;
  requiereExamenPractico: boolean;
  requiereExamenTeorico: boolean;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConfiguracionExamenResponse {
  content: ConfiguracionExamen[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionExamenService {
  private apiUrl = `${environment.apiUrl}/configuracion-examen`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ConfiguracionExamen[]> {
    return this.http.get<ConfiguracionExamen[]>(this.apiUrl);
  }

  getById(id: number): Observable<ConfiguracionExamen> {
    return this.http.get<ConfiguracionExamen>(`${this.apiUrl}/${id}`);
  }

  getByTipo(tipoExamen: string): Observable<ConfiguracionExamen> {
    return this.http.get<ConfiguracionExamen>(`${this.apiUrl}/tipo/${tipoExamen}`);
  }

  getActivos(): Observable<ConfiguracionExamen[]> {
    return this.http.get<ConfiguracionExamen[]>(`${this.apiUrl}/activos`);
  }

  create(config: Partial<ConfiguracionExamen>): Observable<ConfiguracionExamen> {
    return this.http.post<ConfiguracionExamen>(this.apiUrl, config);
  }

  update(id: number, config: Partial<ConfiguracionExamen>): Observable<ConfiguracionExamen> {
    return this.http.put<ConfiguracionExamen>(`${this.apiUrl}/${id}`, config);
  }

  toggleActivo(id: number): Observable<ConfiguracionExamen> {
    return this.http.patch<ConfiguracionExamen>(`${this.apiUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
