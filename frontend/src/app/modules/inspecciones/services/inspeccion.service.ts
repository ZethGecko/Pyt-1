import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface InspeccionResponse {
  id: number;
  codigo: string;
  tipo: string;
  fechaProgramada: Date;
  horaProgramada: string;
  lugar: string;
  expedienteId?: number;
  expedienteCodigo?: string;
  empresaId?: number;
  empresaNombre?: string;
  vehiculoId?: number;
  vehiculoPlaca?: string;
  inspectorId?: number;
  inspectorNombre?: string;
  estado: string;
  resultado?: string;
  resultadoGeneral?: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InspeccionCreateRequest {
  tipo: string;
  fechaProgramada: Date;
  horaProgramada: string;
  lugar: string;
  observaciones?: string;
  expedienteId?: number;
  empresaId?: number;
  vehiculoId?: number;
  inspectorId?: number;
}

export interface FichaInspeccionResponse {
  id: number;
  inspeccionId: number;
  parametroId: number;
  parametroNombre?: string;
  valor?: string;
  cumple: boolean;
  observaciones?: string;
  evidenciaUrl?: string;
}

export interface ParametroInspeccionResponse {
  id: number;
  parametro: string;
  observacion?: string;
  tipoEvaluacion?: string;
  fichaInspeccionId?: number;
  fichaInspeccion?: {
    id: number;
    resultado?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class InspeccionService {
  private apiUrl = `${environment.apiUrl}/inspecciones`;
  private fichaUrl = `${environment.apiUrl}/fichas-inspeccion`;
  private parametrosUrl = `${environment.apiUrl}/parametros-inspeccion`;

  constructor(private http: HttpClient) {}

  // ========== FICHAS DE INSPECCIÓN ==========
  crearParaInspeccion(inspeccionId: number, ficha: {
    parametroId?: number;
    valor?: string;
    cumple?: boolean;
    observaciones?: string;
  }): Observable<FichaInspeccionResponse> {
    return this.http.post<FichaInspeccionResponse>(`${this.fichaUrl}/inspeccion/${inspeccionId}`, ficha);
  }

  // ========== CRUD ==========
  obtener(id: number): Observable<InspeccionResponse> {
    return this.http.get<InspeccionResponse>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<InspeccionResponse[]> {
    return this.http.get<InspeccionResponse[]>(this.apiUrl);
  }

  listarPorEstado(estado: string): Observable<InspeccionResponse[]> {
    return this.http.get<InspeccionResponse[]>(`${this.apiUrl}/estado/${estado}`);
  }

  listarPorFecha(fecha: Date): Observable<InspeccionResponse[]> {
    return this.http.get<InspeccionResponse[]>(`${this.apiUrl}/fecha`, {
      params: { fecha: fecha.toISOString().split('T')[0] }
    });
  }

  listarPorInspector(inspectorId: number): Observable<InspeccionResponse[]> {
    return this.http.get<InspeccionResponse[]>(`${this.apiUrl}/inspector/${inspectorId}`);
  }

  crear(inspeccion: InspeccionCreateRequest): Observable<InspeccionResponse> {
    return this.http.post<InspeccionResponse>(this.apiUrl, inspeccion);
  }

  actualizar(id: number, inspeccion: Partial<InspeccionCreateRequest>): Observable<InspeccionResponse> {
    return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}`, inspeccion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== PROGRAMACIÓN ==========
  reprogramar(id: number, nuevaFecha: Date, nuevaHora: string): Observable<InspeccionResponse> {
    return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/reprogramar`, {
      fechaProgramada: nuevaFecha,
      horaProgramada: nuevaHora
    });
  }

  asignarInspector(id: number, inspectorId: number): Observable<InspeccionResponse> {
    return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/asignar-inspector`, { inspectorId });
  }

  // ========== RESULTADOS ==========
  registrarResultado(id: number, resultado: {
    resultado: string;
    observaciones?: string;
  }): Observable<InspeccionResponse> {
    return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/resultado`, resultado);
  }

  // ========== CANCELAR ==========
  cancelar(id: number): Observable<InspeccionResponse> {
    return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  completar(id: number, fichas: any[]): Observable<InspeccionResponse> {
    return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/completar`, { fichas });
  }

  // ========== FICHAS ==========
  obtenerFichas(inspeccionId: number): Observable<FichaInspeccionResponse[]> {
    return this.http.get<FichaInspeccionResponse[]>(`${this.apiUrl}/${inspeccionId}/fichas`);
  }

  guardarFichas(inspeccionId: number, fichas: Partial<FichaInspeccionResponse>[]): Observable<FichaInspeccionResponse[]> {
    return this.http.put<FichaInspeccionResponse[]>(`${this.apiUrl}/${inspeccionId}/fichas`, fichas);
  }

  subirEvidencia(fichaId: number, archivo: File): Observable<FichaInspeccionResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<FichaInspeccionResponse>(`${this.fichaUrl}/${fichaId}/evidencia`, formData);
  }

 // ========== PARÁMETROS ==========
 listarParametros(): Observable<ParametroInspeccionResponse[]> {
   return this.http.get<ParametroInspeccionResponse[]>(this.parametrosUrl);
 }

 listarParametrosPorCategoria(categoria: string): Observable<ParametroInspeccionResponse[]> {
   return this.http.get<ParametroInspeccionResponse[]>(`${this.parametrosUrl}/categoria/${categoria}`);
 }

 crearParametro(fichaInspeccionId: number, parametro: {
   parametro: string;
   observacion?: string;
   tipoEvaluacion?: string;
 }): Observable<ParametroInspeccionResponse> {
   return this.http.post<ParametroInspeccionResponse>(`${this.parametrosUrl}/ficha/${fichaInspeccionId}`, parametro);
 }

 actualizarParametro(id: number, parametro: {
   parametro?: string;
   observacion?: string;
   tipoEvaluacion?: string;
 }): Observable<ParametroInspeccionResponse> {
   return this.http.put<ParametroInspeccionResponse>(`${this.parametrosUrl}/${id}`, parametro);
 }

 eliminarParametro(id: number): Observable<void> {
   return this.http.delete<void>(`${this.parametrosUrl}/${id}`);
 }

 obtenerParametrosDisponibles(): Observable<{id: number, parametro: string, observacion?: string}[]> {
   return this.http.get<{id: number, parametro: string, observacion?: string}[]>(`${this.parametrosUrl}/disponibles`);
 }

 crearParametrosBasicos(fichaInspeccionId: number): Observable<ParametroInspeccionResponse[]> {
   return this.http.post<ParametroInspeccionResponse[]>(`${this.parametrosUrl}/ficha/${fichaInspeccionId}/basicos`, {});
 }

  // ========== EXPEDIENTES ==========
  listarPorExpediente(expedienteId: number): Observable<InspeccionResponse[]> {
    return this.http.get<InspeccionResponse[]>(`${this.apiUrl}/expediente/${expedienteId}`);
  }

  // ========== CALENDARIO ==========
  obtenerCalendario(mes: number, año: number): Observable<InspeccionResponse[]> {
    return this.http.get<InspeccionResponse[]>(`${this.apiUrl}/calendario`, {
      params: { mes: mes.toString(), año: año.toString() }
    });
  }

  // ========== ESTADÍSTICAS ==========
  obtenerEstadisticas(inspeccionId: number): Observable<{
    totalParametros: number;
    cumplen: number;
    noCumplen: number;
    observados: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${inspeccionId}/estadisticas`);
  }
}
