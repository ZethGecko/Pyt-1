import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Departamento, DepartamentoCreateRequest, DepartamentoUpdateRequest } from '../models/departamento.model';

export interface UsuarioResumen {
  id: number;
  username: string;
  email: string;
  role: {
    id: number;
    name: string;
    description: string;
  };
  activo: boolean;
  asignado: boolean;
}

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private apiUrl = `${environment.apiUrl}/departamentos`;

  constructor(private http: HttpClient) {}

  // ========== CRUD ==========
  obtener(id: number): Observable<Departamento> {
    return this.http.get<Departamento>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(this.apiUrl);
  }

  listarActivos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/activos`);
  }

  crear(departamento: DepartamentoCreateRequest): Observable<Departamento> {
    return this.http.post<Departamento>(this.apiUrl, departamento);
  }

  actualizar(id: number, departamento: Partial<DepartamentoUpdateRequest>): Observable<Departamento> {
    return this.http.put<Departamento>(`${this.apiUrl}/${id}`, departamento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }

  // ========== RESPONSABLE ==========
  asignarResponsable(departamentoId: number, responsableId: number): Observable<Departamento> {
    return this.http.put<Departamento>(`${this.apiUrl}/${departamentoId}/responsable`, {
      responsableId
    });
  }

  // ========== ACTIVACIÓN ==========
  activar(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  // ========== GESTIÓN DE USUARIOS ==========
  
  obtenerUsuarios(departamentoId: number): Observable<UsuarioResumen[]> {
    return this.http.get<UsuarioResumen[]>(`${this.apiUrl}/${departamentoId}/usuarios`);
  }

  asignarUsuario(departamentoId: number, usuarioId: number): Observable<Departamento> {
    return this.http.post<Departamento>(`${this.apiUrl}/${departamentoId}/asignar-usuario/${usuarioId}`, {});
  }

  desasignarUsuario(departamentoId: number, usuarioId: number): Observable<Departamento> {
    return this.http.delete<Departamento>(`${this.apiUrl}/${departamentoId}/desasignar-usuario/${usuarioId}`, {});
  }
}
