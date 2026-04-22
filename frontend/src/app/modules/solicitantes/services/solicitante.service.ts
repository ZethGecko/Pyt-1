import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Solicitante {
  id: number;
  tipoSolicitante: string;
  referencia: number | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  fechaRegistro: string;
  activo: boolean;
  // Relaciones (objetos completos desde backend)
  personaNatural?: {
    id: number;
    nombres: string;
    apellidos: string;
    dni: number;
  } | null;
  empresa?: {
    id: number;
    nombre: string;
    ruc: string;
  } | null;
  vehiculo?: {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
    color?: string;
  } | null;
  // Datos enriquecidos (calculados por backend)
  nombre?: string;
  identificacion?: string;
}

export interface SolicitantePage {
  content: Solicitante[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitanteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/solicitantes`;

  /**
   * Get all solicitantes with pagination
   */
  getSolicitantes(page: number = 0, size: number = 20): Observable<SolicitantePage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<SolicitantePage>(this.baseUrl, { params });
  }

  /**
   * Get active solicitantes
   */
  getActivos(): Observable<Solicitante[]> {
    return this.http.get<Solicitante[]>(`${this.baseUrl}/activos`);
  }

  /**
   * Get solicitante by ID
   */
  getById(id: number): Observable<Solicitante> {
    return this.http.get<Solicitante>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get solicitantes by type
   */
  getByTipo(tipo: string): Observable<Solicitante[]> {
    return this.http.get<Solicitante[]>(`${this.baseUrl}/tipo/${tipo}`);
  }

  /**
   * Search solicitantes
   */
  search(termino: string): Observable<Solicitante[]> {
    return this.http.get<Solicitante[]>(`${this.baseUrl}/buscar`, { 
      params: new HttpParams().set('termino', termino) 
    });
  }

  /**
   * Create solicitante
   */
  create(solicitante: Partial<Solicitante>): Observable<Solicitante> {
    return this.http.post<Solicitante>(this.baseUrl, solicitante);
  }

  /**
   * Update solicitante
   */
  update(id: number, solicitante: Partial<Solicitante>): Observable<Solicitante> {
    return this.http.put<Solicitante>(`${this.baseUrl}/${id}`, solicitante);
  }

  /**
   * Delete solicitante
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activate solicitante
   */
  activate(id: number): Observable<Solicitante> {
    return this.http.put<Solicitante>(`${this.baseUrl}/${id}/activar`, {});
  }

  /**
   * Deactivate solicitante
   */
  deactivate(id: number): Observable<Solicitante> {
    return this.http.put<Solicitante>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  // Helper methods
  getTipoIcon(tipo: string | null): string {
    if (!tipo) return 'user';
    switch (tipo) {
      case 'PersonaNatural': return 'user';
      case 'Empresa': return 'building';
      case 'Vehiculo': return 'truck';
      default: return 'user';
    }
  }

  getTipoLabel(tipo: string | null): string {
    if (!tipo) return 'Desconocido';
    switch (tipo) {
      case 'PersonaNatural': return 'Persona Natural';
      case 'Empresa': return 'Empresa';
      case 'Vehiculo': return 'Vehículo';
      default: return tipo;
    }
  }

  getEstadoClass(activo: boolean | null): string {
    if (activo === null) return 'bg-gray-100 text-gray-600';
    return activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  }

  getEstadoLabel(activo: boolean | null): string {
    if (activo === null) return 'Desconocido';
    return activo ? 'Activo' : 'Inactivo';
  }
}
