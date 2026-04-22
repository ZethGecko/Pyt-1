import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfigDuracionTUC {
  id: number;
  formatoCodigo: string;
  tipoCalculoFecha?: string;
  duracionMeses?: number;
  toleranciaDias?: number;
  fechaInicio?: string;
  fechaFin?: string;
  aplicaDesde: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Relaciones como objetos (solo con id para enviar al backend)
  subtipoTransporte?: {
    id: number;
    nombre?: string;
  };
  tipoTransporte?: {
    id: number;
    nombre?: string;
  };
  categoriaTransporte?: {
    id: number;
    nombre?: string;
  };
  // Campo solo para UI (no se envía al backend)
  tipoDuracion?: 'DINAMICA' | 'FIJA';
}

export interface ConfigDuracionTUCResponse {
  content: ConfigDuracionTUC[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigDuracionTUCService {
  private apiUrl = `${environment.apiUrl}/config-duracion-tuc`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ConfigDuracionTUC[]> {
    return this.http.get<ConfigDuracionTUC[]>(this.apiUrl);
  }

  getById(id: number): Observable<ConfigDuracionTUC> {
    return this.http.get<ConfigDuracionTUC>(`${this.apiUrl}/${id}`);
  }

  create(config: Partial<ConfigDuracionTUC>): Observable<ConfigDuracionTUC> {
    return this.http.post<ConfigDuracionTUC>(this.apiUrl, config);
  }

  update(id: number, config: Partial<ConfigDuracionTUC>): Observable<ConfigDuracionTUC> {
    return this.http.put<ConfigDuracionTUC>(`${this.apiUrl}/${id}`, config);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActivo(id: number): Observable<ConfigDuracionTUC> {
    return this.http.patch<ConfigDuracionTUC>(`${this.apiUrl}/${id}/toggle`, {});
  }
}
