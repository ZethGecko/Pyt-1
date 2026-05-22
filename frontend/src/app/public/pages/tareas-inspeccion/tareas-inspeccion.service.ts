import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TareaColumnaDTO {
  header: string;
  field: string;
  esUtil: boolean;
  orden?: number;
}

export interface TareasInspeccionResponse {
  columnas: TareaColumnaDTO[];
  filas: Record<string, unknown>[];
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class TareasInspeccionService {
  private baseUrl = `${environment.apiUrl}/inspecciones`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las tareas de inspección (columnas + filas) para una inspección dada.
   *
   * @param inspeccionId identificador de la inspección
   * @returns observable con la respuesta completa de columnas/filas/cantidad
   */
  obtenerTareasPorInspeccion(inspeccionId: number): Observable<TareasInspeccionResponse> {
    return this.http.get<TareasInspeccionResponse>(`${this.baseUrl}/tareas-inspeccion/${inspeccionId}`);
  }
}
