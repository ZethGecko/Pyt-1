import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export interface PublicacionAdminDTO {
  idPublicacion: number;
  tipoPublicacion: string;
  titulo: string;
  contenido: string;
  estado: string;
  paraTodos: boolean;
  fechaPublicacion: string | null;
  fechaCreacion: string | null;
  fechaModificacion: string | null;
  usuarioCreadorUsername: string;
  usuarioActualizadorUsername: string | null;
  tipoTramiteId: number | null;
}

export interface PublicacionCreateDTO {
  tipoPublicacion: string;
  titulo: string;
  contenido: string;
  paraTodos: boolean;
  estado?: string;                   // BORRADOR por defecto
  fechaPublicacion?: string | null;
  fechaModificacion?: string | null;
  fechaActualizacion?: string | null;
  tipoTramiteId?: number | null;
  formatoId?: number | null;
}

export interface PublicacionUpdateDTO {
  tipoPublicacion?: string;
  titulo?: string;
  contenido?: string;
  paraTodos?: boolean;
  estado?: string;
  fechaPublicacion?: string | null;
  fechaModificacion?: string | null;
  fechaActualizacion?: string | null;
  tipoTramiteId?: number | null;
  formatoId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesAdminService {
  private apiUrl = `${environment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient) {}

  /** Lista todas — sin paginación en backend; filtra en cliente */
  listarTodas(): Observable<PublicacionAdminDTO[]> {
    return this.http.get<PublicacionAdminDTO[]>(this.apiUrl);
  }

  /** Solo publicadas */
  listarPublicadas(): Observable<PublicacionAdminDTO[]> {
    return this.http.get<PublicacionAdminDTO[]>(`${this.apiUrl}/publicadas`);
  }

  listarPorTipo(tipo: string): Observable<PublicacionAdminDTO[]> {
    return this.http.get<PublicacionAdminDTO[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  listarPorEstado(estado: string): Observable<PublicacionAdminDTO[]> {
    return this.http.get<PublicacionAdminDTO[]>(`${this.apiUrl}/estado/${estado}`);
  }

  obtenerPorId(id: number): Observable<PublicacionAdminDTO> {
    return this.http.get<PublicacionAdminDTO>(`${this.apiUrl}/${id}`);
  }

  crear(data: PublicacionCreateDTO): Observable<PublicacionAdminDTO> {
    return this.http.post<PublicacionAdminDTO>(this.apiUrl, data);
  }

  actualizar(id: number, data: PublicacionUpdateDTO): Observable<PublicacionAdminDTO> {
    return this.http.put<PublicacionAdminDTO>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publicar(id: number): Observable<PublicacionAdminDTO> {
    return this.http.patch<PublicacionAdminDTO>(`${this.apiUrl}/${id}/publicar`, {});
  }

  archivar(id: number): Observable<PublicacionAdminDTO> {
    return this.http.patch<PublicacionAdminDTO>(`${this.apiUrl}/${id}/archivar`, {});
  }

  desarchivar(id: number): Observable<PublicacionAdminDTO> {
    return this.http.patch<PublicacionAdminDTO>(`${this.apiUrl}/${id}/desarchivar`, {});
  }
}
