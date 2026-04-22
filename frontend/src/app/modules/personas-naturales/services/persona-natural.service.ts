import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  PersonaNatural,
  PersonaNaturalCreateRequest,
  PersonaNaturalUpdateRequest,
  PersonaNaturalProjection,
  PersonaNaturalEstadisticas,
  FiltrosPersonaNatural
} from '../models/persona-natural.model';

// Re-export models for convenience
export type {
  PersonaNatural,
  PersonaNaturalCreateRequest,
  PersonaNaturalUpdateRequest,
  PersonaNaturalProjection,
  PersonaNaturalEstadisticas,
  FiltrosPersonaNatural
};

@Injectable({ providedIn: 'root' })
export class PersonaNaturalService {
  private apiUrl = `${environment.apiUrl}/personas-naturales`;

  constructor(private http: HttpClient) {}

  // ========== CRUD BÁSICO ==========
  obtener(id: number): Observable<PersonaNatural> {
    return this.http.get<PersonaNatural>(`${this.apiUrl}/${id}`);
  }

  obtenerProjected(id: number): Observable<PersonaNaturalProjection> {
    return this.http.get<PersonaNaturalProjection>(`${this.apiUrl}/${id}/projected`);
  }

  listarTodos(): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(this.apiUrl);
  }

  listarPaginado(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paginado`, {
      params: new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
    });
  }

  listarProjected(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/projected`, {
      params: new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
    });
  }

  crear(persona: PersonaNaturalCreateRequest): Observable<PersonaNatural> {
    return this.http.post<PersonaNatural>(this.apiUrl, persona);
  }

  actualizar(id: number, persona: PersonaNaturalUpdateRequest): Observable<PersonaNatural> {
    return this.http.put<PersonaNatural>(`${this.apiUrl}/${id}`, persona);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/buscar/termino`, {
      params: { termino }
    });
  }

  buscarProjected(termino: string): Observable<PersonaNaturalProjection[]> {
    return this.http.get<PersonaNaturalProjection[]>(`${this.apiUrl}/buscar/termino/projected`, {
      params: { termino }
    });
  }

  buscarPorNombre(nombre: string): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/buscar/nombre`, {
      params: { nombre }
    });
  }

  buscarPorApellido(apellido: string): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/buscar/apellido`, {
      params: { apellido }
    });
  }

  buscarPorNombreCompleto(nombreCompleto: string): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/buscar/nombre-completo`, {
      params: { nombreCompleto }
    });
  }

  // ========== BÚSQUEDA POR DNI ==========
  obtenerPorDni(dni: number): Observable<PersonaNatural> {
    return this.http.get<PersonaNatural>(`${this.apiUrl}/dni/${dni}`);
  }

  obtenerPorDniProjected(dni: number): Observable<PersonaNaturalProjection> {
    return this.http.get<PersonaNaturalProjection>(`${this.apiUrl}/dni/${dni}/projected`);
  }

  existePorDni(dni: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/dni/${dni}/existe`);
  }

  dniEstaDisponible(dni: number, idExcluir?: number): Observable<boolean> {
    const path = idExcluir
      ? `${this.apiUrl}/dni/${dni}/disponible/${idExcluir}`
      : `${this.apiUrl}/dni/${dni}/disponible`;
    return this.http.get<boolean>(path);
  }

  // ========== BÚSQUEDA POR EMAIL ==========
  existePorEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/email/${email}/existe`);
  }

  emailEstaDisponible(email: string, idExcluir?: number): Observable<boolean> {
    const path = idExcluir
      ? `${this.apiUrl}/email/${email}/disponible/${idExcluir}`
      : `${this.apiUrl}/email/${email}/disponible`;
    return this.http.get<boolean>(path);
  }

  // ========== FILTROS ESPECÍFICOS ==========
  listarPorGenero(genero: string): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/genero/${genero}`);
  }

  listarActivos(): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/activos`);
  }

  // ========== ESTADÍSTICAS ==========
  obtenerEstadisticasPorGenero(): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.apiUrl}/estadisticas/genero`);
  }

  // ========== VALIDACIONES ==========
  validarDniUnico(dni: number, idExcluir?: number): Observable<{existe: boolean, mensaje: string}> {
    return this.dniEstaDisponible(dni, idExcluir).pipe(
      map((disponible: boolean) => ({
        existe: !disponible,
        mensaje: !disponible ? 'El DNI ya está registrado' : 'DNI disponible'
      }))
    );
  }

  validarEmailUnico(email: string, idExcluir?: number): Observable<{existe: boolean, mensaje: string}> {
    return this.emailEstaDisponible(email, idExcluir).pipe(
      map((disponible: boolean) => ({
        existe: !disponible,
        mensaje: !disponible ? 'El email ya está registrado' : 'Email disponible'
      }))
    );
  }

  // ========== UTILIDADES ==========
  obtenerNombreCompleto(id: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/nombre-completo`);
  }

  obtenerContactoCompleto(id: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/contacto`);
  }

  // ========== VALIDACIÓN PARA TRÁMITES ==========
  esPersonaValidaParaTramite(personaId: number, tipoTramite: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${personaId}/valida-tramite/${tipoTramite}`);
  }

  // ========== PERMISOS ==========
  verificarPermisosUsuario(): Observable<{
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
  }> {
    return this.http.get<{
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canManage: boolean;
    }>(`${this.apiUrl}/permisos/verificar`);
  }

  // ========== AUTOCOMPLETE ==========
  autocomplete(termino: string): Observable<PersonaNaturalProjection[]> {
    return this.buscarProjected(termino);
  }

  // ========== HELPER METHODS ==========
  formatNombreCompleto(persona: PersonaNatural): string {
    return `${persona.nombres} ${persona.apellidos}`.trim();
  }

  formatDni(persona: PersonaNatural): string {
    return persona.dni.toString();
  }

  formatContacto(persona: PersonaNatural): string {
    const parts: string[] = [];
    if (persona.telefono) parts.push(`Tel: ${persona.telefono}`);
    if (persona.email) parts.push(`Email: ${persona.email}`);
    return parts.length > 0 ? parts.join(' | ') : 'Sin contactos';
  }

  getGeneroLabel(genero?: string): string {
    if (!genero) return 'No especificado';
    const labels: Record<string, string> = {
      'MASCULINO': 'Masculino',
      'FEMENINO': 'Femenino',
      'OTRO': 'Otro'
    };
    return labels[genero] || genero;
  }

  getGeneroClass(genero?: string): string {
    if (!genero) return 'bg-gray-100 text-gray-600';
    const classes: Record<string, string> = {
      'MASCULINO': 'bg-blue-100 text-blue-700',
      'FEMENINO': 'bg-pink-100 text-pink-700',
      'OTRO': 'bg-purple-100 text-purple-700'
    };
    return classes[genero] || 'bg-gray-100 text-gray-600';
  }
}
