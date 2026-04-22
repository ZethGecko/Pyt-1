import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface GrupoPresentacionResponse {
  id: number;
  codigo: string;
  fecha: string | Date;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  cuposDisponibles: number;
  estado: string;
  requisitoExamen: {
    id: number;
    descripcion?: string;
  };
}

export interface GrupoPresentacionUpdateRequest {
  codigo?: string;
  requisitoExamenId?: number | null;
  fecha?: string | Date;
  horaInicio?: string;
  horaFin?: string;
  capacidad?: number;
  observaciones?: string;
  estado?: string;
}

export interface GrupoPresentacionCreateRequest {
  codigo: string;
  requisitoExamenId: number | null;
  fecha: string | Date;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  observaciones?: string;
}

export interface CandidatoAsignado {
  id: number;
  grupoPresentacionId: number;
  solicitanteId: number;
  solicitanteNombre?: string;
  solicitanteIdentificacion?: string;
  estado: string;
  nota?: number;
  asistio: boolean;
  resultado?: string;
}

@Injectable({ providedIn: 'root' })
export class GrupoPresentacionService {
  private apiUrl = `${environment.apiUrl}/grupos-presentacion`;
  private candidatosUrl = `${environment.apiUrl}/candidatos-grupo`;

  constructor(private http: HttpClient) {}

  // ========== CRUD ==========
  obtener(id: number): Observable<GrupoPresentacionResponse> {
    return this.http.get<GrupoPresentacionResponse>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<GrupoPresentacionResponse[]> {
    return this.http.get<GrupoPresentacionResponse[]>(this.apiUrl);
  }

  listarPorEstado(estado: string): Observable<GrupoPresentacionResponse[]> {
    return this.http.get<GrupoPresentacionResponse[]>(`${this.apiUrl}/estado/${estado}`);
  }

  listarProximos(): Observable<GrupoPresentacionResponse[]> {
    return this.http.get<GrupoPresentacionResponse[]>(`${this.apiUrl}/proximos`);
  }

  crear(grupo: GrupoPresentacionCreateRequest): Observable<GrupoPresentacionResponse> {
    const { requisitoExamenId, ...rest } = grupo;
    const payload = {
      ...rest,
      requisitoExamen: requisitoExamenId ? { id: requisitoExamenId } : null
    };
    return this.http.post<GrupoPresentacionResponse>(this.apiUrl, payload);
  }

   actualizar(id: number, grupo: GrupoPresentacionUpdateRequest): Observable<GrupoPresentacionResponse> {
     const { requisitoExamenId, ...rest } = grupo;
     const payload = {
       ...rest,
       ...(requisitoExamenId !== undefined && { requisitoExamen: requisitoExamenId ? { id: requisitoExamenId } : null })
     };
     return this.http.put<GrupoPresentacionResponse>(`${this.apiUrl}/${id}`, payload);
   }

  // ========== REQUISITOS ==========
  obtenerRequisitosActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requisitos/activos`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== CANDIDATOS ==========
  asignarCandidato(grupoId: number, solicitanteId: number): Observable<CandidatoAsignado> {
    return this.http.post<CandidatoAsignado>(`${this.apiUrl}/${grupoId}/candidatos`, { solicitanteId });
  }

  removerCandidato(grupoId: number, candidatoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${grupoId}/candidatos/${candidatoId}`);
  }

  listarCandidatos(grupoId: number): Observable<CandidatoAsignado[]> {
    return this.http.get<CandidatoAsignado[]>(`${this.apiUrl}/${grupoId}/candidatos`);
  }

  asignarMultiple(grupoId: number, solicitanteIds: number[]): Observable<CandidatoAsignado[]> {
    return this.http.post<CandidatoAsignado[]>(`${this.apiUrl}/${grupoId}/candidatos/masivo`, { solicitanteIds });
  }

  // ========== RESULTADOS ==========
  registrarResultado(candidatoId: number, resultado: {
    asistio: boolean;
    nota?: number;
    resultado?: string;
  }): Observable<CandidatoAsignado> {
    return this.http.put<CandidatoAsignado>(`${this.candidatosUrl}/${candidatoId}/resultado`, resultado);
  }

  publicarResultados(grupoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${grupoId}/publicar-resultados`, {});
  }

  ocultarResultados(grupoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${grupoId}/ocultar-resultados`, {});
  }

  // ========== CALENDARIO ==========
  obtenerCalendario(mes: number, año: number): Observable<GrupoPresentacionResponse[]> {
    return this.http.get<GrupoPresentacionResponse[]>(`${this.apiUrl}/calendario`, {
      params: { mes: mes.toString(), año: año.toString() }
    });
  }

  // ========== ESTADÍSTICAS ==========
  obtenerEstadisticas(grupoId: number): Observable<{
    total: number;
    asistentes: number;
    aprobados: number;
    desaprobados: number;
    noShow: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${grupoId}/estadisticas`);
  }
}
