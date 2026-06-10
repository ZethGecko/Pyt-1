import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export interface NotificacionAdminDTO {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  fechaPublicacion: string | null;
  fechaExpiracion: string | null;
  activo: boolean;
  prioridad: number;
  urlDestino: string | null;
  paraTodos: boolean;
  usuarioCreadorUsername: string;
  usuarioDestinoUsername: string | null;
}

export interface NotificacionCreateDTO {
  titulo: string;
  mensaje: string;
  tipo: string;
  fechaExpiracion?: string | null;
  prioridad?: number;
  urlDestino?: string | null;
  paraTodos?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<NotificacionAdminDTO[]> {
    return this.http.get<NotificacionAdminDTO[]>(this.apiUrl);
  }

  crear(data: NotificacionCreateDTO): Observable<NotificacionAdminDTO> {
    return this.http.post<NotificacionAdminDTO>(this.apiUrl, data);
  }

  actualizar(id: number, data: NotificacionCreateDTO & { activo?: boolean }): Observable<NotificacionAdminDTO> {
    return this.http.put<NotificacionAdminDTO>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publicar(id: number): Observable<NotificacionAdminDTO> {
    return this.http.post<NotificacionAdminDTO>(`${this.apiUrl}/${id}/publicar`, {});
  }

  despublicar(id: number): Observable<NotificacionAdminDTO> {
    return this.http.post<NotificacionAdminDTO>(`${this.apiUrl}/${id}/despublicar`, {});
  }
}
