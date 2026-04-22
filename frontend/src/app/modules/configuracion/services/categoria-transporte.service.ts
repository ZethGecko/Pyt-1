import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CategoriaTransporteResponse {
  id: number;
  nombre: string;
}

export interface CategoriaTransporteCreateRequest {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaTransporteService {
  private apiUrl = `${environment.apiUrl}/categorias-transporte`;

  constructor(private http: HttpClient) {}

  // ========== CRUD ==========
  obtener(id: number): Observable<CategoriaTransporteResponse> {
    return this.http.get<CategoriaTransporteResponse>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<CategoriaTransporteResponse[]> {
    return this.http.get<CategoriaTransporteResponse[]>(this.apiUrl);
  }

  listarTodosConTipos(): Observable<CategoriaTransporteResponse[]> {
    return this.http.get<CategoriaTransporteResponse[]>(`${this.apiUrl}/con-tipos`);
  }

  listarActivos(): Observable<CategoriaTransporteResponse[]> {
    return this.http.get<CategoriaTransporteResponse[]>(`${this.apiUrl}/activos`);
  }

  crear(categoria: CategoriaTransporteCreateRequest): Observable<CategoriaTransporteResponse> {
    return this.http.post<CategoriaTransporteResponse>(this.apiUrl, categoria);
  }

  actualizar(id: number, categoria: Partial<CategoriaTransporteCreateRequest>): Observable<CategoriaTransporteResponse> {
    return this.http.put<CategoriaTransporteResponse>(`${this.apiUrl}/${id}`, categoria);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<CategoriaTransporteResponse[]> {
    return this.http.get<CategoriaTransporteResponse[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }
}
