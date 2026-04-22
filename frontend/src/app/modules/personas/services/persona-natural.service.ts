import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PersonaNaturalResponse {
  id: number;
  identificacion: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonaNaturalCreateRequest {
  identificacion: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

@Injectable({ providedIn: 'root' })
export class PersonaNaturalService {
  private apiUrl = `${environment.apiUrl}/personas-naturales`;

  constructor(private http: HttpClient) {}

  // ========== CRUD ==========
  obtener(id: number): Observable<PersonaNaturalResponse> {
    return this.http.get<PersonaNaturalResponse>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<PersonaNaturalResponse[]> {
    return this.http.get<PersonaNaturalResponse[]>(this.apiUrl);
  }

  listarActivos(): Observable<PersonaNaturalResponse[]> {
    return this.http.get<PersonaNaturalResponse[]>(`${this.apiUrl}/activos`);
  }

  crear(persona: PersonaNaturalCreateRequest): Observable<PersonaNaturalResponse> {
    return this.http.post<PersonaNaturalResponse>(this.apiUrl, persona);
  }

  actualizar(id: number, persona: Partial<PersonaNaturalCreateRequest>): Observable<PersonaNaturalResponse> {
    return this.http.put<PersonaNaturalResponse>(`${this.apiUrl}/${id}`, persona);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<PersonaNaturalResponse[]> {
    return this.http.get<PersonaNaturalResponse[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }

  obtenerPorIdentificacion(identificacion: string): Observable<PersonaNaturalResponse | null> {
    return this.http.get<PersonaNaturalResponse | null>(`${this.apiUrl}/identificacion/${identificacion}`);
  }

  // ========== AUTOCOMPLETE ==========
  autocomplete(termino: string): Observable<PersonaNaturalResponse[]> {
    return this.http.get<PersonaNaturalResponse[]>(`${this.apiUrl}/autocomplete`, {
      params: { q: termino }
    });
  }

  // ========== VERIFICACIÓN ==========
  existeConIdentificacion(identificacion: string): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/verificar/existe/${identificacion}`);
  }
}
