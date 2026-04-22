import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TipoTransporteResponse {
  id: number;
  nombre: string;
  categoriaTransporte: {
    id: number;
    nombre?: string;
  };
}

export interface TipoTransporteCreateRequest {
  nombre: string;
  categoriaTransporte: { idCategoriaTransporte: number; nombre?: string };
}

export interface SubtipoTransporteResponse {
  id: number;
  nombre: string;
  tipoTransporte: {
    id: number;
    nombre?: string;
  };
}

export interface SubtipoTransporteCreateRequest {
  nombre: string;
  tipoTransporte: { idTipoTransporte: number; nombre?: string };
}

@Injectable({ providedIn: 'root' })
export class TipoTransporteService {
  private apiUrl = `${environment.apiUrl}/tipos-transporte`;
  private subtiposUrl = `${environment.apiUrl}/subtipos-transporte`;

  constructor(private http: HttpClient) {}

  // ========== TIPO TRANSPORTE CRUD ==========
  obtener(id: number): Observable<TipoTransporteResponse> {
    return this.http.get<TipoTransporteResponse>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<TipoTransporteResponse[]> {
    return this.http.get<TipoTransporteResponse[]>(this.apiUrl);
  }

  listarActivos(): Observable<TipoTransporteResponse[]> {
    return this.http.get<TipoTransporteResponse[]>(`${this.apiUrl}/activos`);
  }

  crear(tipo: TipoTransporteCreateRequest): Observable<TipoTransporteResponse> {
    return this.http.post<TipoTransporteResponse>(this.apiUrl, tipo);
  }

  actualizar(id: number, tipo: TipoTransporteCreateRequest): Observable<TipoTransporteResponse> {
    return this.http.put<TipoTransporteResponse>(`${this.apiUrl}/${id}`, tipo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<TipoTransporteResponse[]> {
    return this.http.get<TipoTransporteResponse[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }

  listarPorCategoria(categoriaId: number): Observable<TipoTransporteResponse[]> {
    return this.http.get<TipoTransporteResponse[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  // ========== SUBTIPOS ==========
  obtenerSubtipos(tipoId: number): Observable<SubtipoTransporteResponse[]> {
    return this.http.get<SubtipoTransporteResponse[]>(`${this.subtiposUrl}/tipo/${tipoId}`);
  }

  obtenerSubtipo(id: number): Observable<SubtipoTransporteResponse> {
    return this.http.get<SubtipoTransporteResponse>(`${this.subtiposUrl}/${id}`);
  }

  listarSubtiposTodos(): Observable<SubtipoTransporteResponse[]> {
    return this.http.get<SubtipoTransporteResponse[]>(this.subtiposUrl);
  }

  crearSubtipo(subtipo: SubtipoTransporteCreateRequest): Observable<SubtipoTransporteResponse> {
    return this.http.post<SubtipoTransporteResponse>(this.subtiposUrl, subtipo);
  }

  actualizarSubtipo(id: number, subtipo: Partial<SubtipoTransporteCreateRequest>): Observable<SubtipoTransporteResponse> {
    return this.http.put<SubtipoTransporteResponse>(`${this.subtiposUrl}/${id}`, subtipo);
  }

  eliminarSubtipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.subtiposUrl}/${id}`);
  }
}
