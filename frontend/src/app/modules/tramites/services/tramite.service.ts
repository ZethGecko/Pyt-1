import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Tramite,
  TramiteEnriquecido,
  TramiteCreateRequest,
  TramiteUpdateRequest
} from '../models/tramite.model';
import { TramiteStatesUtils } from '../utils/tramite-states.utils';
import { RequisitoTUPAC } from '../models/requisito-tupac.model';

export interface TipoTramiteOption {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
}

export interface SolicitanteOption {
  id: number;
  identificacion: string;
  nombre: string;
  tipo: 'PersonaNatural' | 'Empresa';
  email?: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class TramiteService {
  private apiUrl = `${environment.apiUrl}/tramites`;
  private tiposTramiteUrl = `${environment.apiUrl}/tipos-tramite`;
  private solicitantesUrl = `${environment.apiUrl}/solicitantes`;
  private requisitosUrl = `${environment.apiUrl}/requisitos-tupac`;
  private historialUrl = `${environment.apiUrl}/historial-tramites`;
  
  constructor(private http: HttpClient) {}

  // ========== BÚSQUEDAS POR CÓDIGO RUT ==========
  obtenerPorCodigoRUT(codigoRUT: string): Observable<TramiteEnriquecido> {
    return this.http.get<any>(`${this.apiUrl}/codigo/${codigoRUT}`).pipe(
      map(tramite => this.enriquecerTramite(tramite))
    );
  }

  obtenerTipoTramitePorCodigoRUT(codigoRUT: string): Observable<{tipoTramiteId: number, tipoTramiteDescripcion: string, tipoTramiteCodigo: string}> {
    return this.http.get<{tipoTramiteId: number, tipoTramiteDescripcion: string, tipoTramiteCodigo: string}>(`${this.apiUrl}/codigo/${codigoRUT}/tipo-tramite`);
  }

  verificarExisteCodigoRUT(codigoRUT: string): Observable<{existe: boolean}> {
    return this.http.get<{existe: boolean}>(`${this.apiUrl}/verificar/existe-codigo/${codigoRUT}`);
  }
  
  // ========== CRUD BÁSICO ==========
  crear(tramite: TramiteCreateRequest): Observable<Tramite> {
    return this.http.post<Tramite>(this.apiUrl, tramite);
  }
  
  obtener(id: number): Observable<TramiteEnriquecido> {
    return this.http.get<any>(`${this.apiUrl}/${id}/enriquecido`).pipe(
      map(tramite => this.enriquecerTramite(tramite))
    );
  }
  
  actualizar(id: number, tramite: TramiteUpdateRequest): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.apiUrl}/${id}`, tramite);
  }
  
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // ========== LISTADOS ==========
  listarTodos(): Observable<TramiteEnriquecido[]> {
    return this.http.get<any>(`${this.apiUrl}/enriquecidos`).pipe(
      map((response: any) => {
        const tramites = response.content || response;
        return (tramites as any[]).map(t => this.enriquecerTramite(t));
      })
    );
  }

  listarTodosEnriquecidos(): Observable<TramiteEnriquecido[]> {
    return this.listarTodos();
  }

  listarPorDepartamento(departamentoId: number): Observable<TramiteEnriquecido[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departamento/${departamentoId}`).pipe(
      map(tramites => tramites.map(t => this.enriquecerTramite(t)))
    );
  }

  listarPorUsuarioRegistraId(usuarioId: number): Observable<TramiteEnriquecido[]> {
    return this.http.get<any>(`${this.apiUrl}/usuario/${usuarioId}/registrados/enriquecidos`).pipe(
      map((response: any) => {
        const tramites = response.content || response;
        return (tramites as any[]).map(t => this.enriquecerTramite(t));
      })
    );
  }

  listarPendientesPorDepartamento(departamentoId: number): Observable<TramiteEnriquecido[]> {
    return this.http.get<any>(`${this.apiUrl}/departamento/${departamentoId}/pendientes`).pipe(
      map((response: any) => {
        const tramites = response.content || response;
        return (tramites as any[]).map(t => this.enriquecerTramite(t));
      })
    );
  }

  listarActivos(): Observable<TramiteEnriquecido[]> {
    return this.http.get<any>(`${this.apiUrl}/activos`).pipe(
      map((response: any) => {
        const tramites = response.content || response;
        return (tramites as any[]).map(t => this.enriquecerTramite(t));
      })
    );
  }
  
  listarAtrasados(): Observable<TramiteEnriquecido[]> {
    return this.http.get<any>(`${this.apiUrl}/atrasados`).pipe(
      map((response: any) => {
        const tramites = response.content || response;
        return (tramites as any[]).map(t => this.enriquecerTramite(t));
      })
    );
  }

  listarTramitesPorUsuarioResponsable(usuarioResponsableId: number, params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('usuarioResponsableId', usuarioResponsableId.toString());
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key].toString());
    });
    return this.http.get<any>(`${this.apiUrl}/dashboard/mis-tramites`, { params: httpParams }).pipe(
      map((response: any) => {
        const tramites = response.content || response;
        return {
          content: (tramites as any[]).map(t => this.enriquecerTramite(t)),
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          size: response.size || 0,
          number: response.number || 0
        };
      })
    );
  }

  // ========== DATOS PARA FORMULARIOS ==========
  listarTiposTramite(): Observable<TipoTramiteOption[]> {
    return this.http.get<any[]>(this.tiposTramiteUrl).pipe(
      map(tipos => tipos.map(t => ({
        id: t.idTipoTramite || t.id,
        codigo: t.codigo,
        descripcion: t.descripcion,
        categoria: t.categoria || 'SIN_CATEGORIA'
      })))
    );
  }

  listarSolicitantes(): Observable<SolicitanteOption[]> {
    return this.http.get<any[]>(`${this.solicitantesUrl}/selector/activos`).pipe(
      map(resultados => resultados.map(r => ({
        id: r.value,
        identificacion: r.identificacion || '',
        nombre: r.nombre || r.label?.split(' [')[0] || '',
        tipo: r.tipo || 'PersonaNatural',
        email: r.contacto || ''
      })))
    );
  }

  buscarSolicitantes(termino: string): Observable<SolicitanteOption[]> {
    return this.http.get<any[]>(`${this.solicitantesUrl}/selector/buscar`, {
      params: { termino }
    }).pipe(
      map(resultados => resultados.map(r => ({
        id: r.value,
        identificacion: r.identificacion || '',
        nombre: r.nombre || r.label?.split(' [')[0] || '',
        tipo: r.tipo || 'PersonaNatural',
        email: r.contacto || ''
      })))
    );
  }

   obtenerRequisitos(tipoTramiteId: number): Observable<RequisitoTUPAC[]> {
     return this.http.get<RequisitoTUPAC[]>(`${this.tiposTramiteUrl}/${tipoTramiteId}/requisitos`);
   }

  obtenerRequisitosAsociadosATipoTramite(tipoTramiteId: number): Observable<RequisitoTUPAC[]> {
    return this.obtenerRequisitos(tipoTramiteId);
  }

  // ========== ACCIONES ==========
  cambiarEstado(id: number, nuevoEstado: string, motivo?: string): Observable<Tramite> {
    let params = new HttpParams().set('nuevoEstado', nuevoEstado);
    if (motivo) params = params.set('motivo', motivo);
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/cambiar-estado`, null, { params });
  }

  aprobar(id: number, observaciones?: string): Observable<Tramite> {
    let params = new HttpParams();
    if (observaciones) params = params.set('observaciones', observaciones);
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/aprobar`, null, { params });
  }

  rechazar(id: number, motivo: string): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/rechazar`, null, {
      params: new HttpParams().set('motivo', motivo)
    });
  }

  observar(id: number, observaciones: string): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/observar`, null, {
      params: new HttpParams().set('observaciones', observaciones)
    });
  }

  finalizar(id: number, observaciones?: string): Observable<Tramite> {
    let params = new HttpParams();
    if (observaciones) params = params.set('observaciones', observaciones);
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/finalizar`, null, { params });
  }

  cambiarPrioridad(id: number, nuevaPrioridad: string): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/cambiar-prioridad`, null, {
      params: new HttpParams().set('nuevaPrioridad', nuevaPrioridad)
    });
  }

  reingresar(id: number, justificacion: string): Observable<Tramite> {
    return this.http.post<Tramite>(`${this.apiUrl}/${id}/reingresar`, null, {
      params: new HttpParams().set('justificacion', justificacion)
    });
  }

  cancelar(id: number, motivo: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancelar`, null, {
      params: new HttpParams().set('motivo', motivo)
    });
  }

   derivar(id: number, departamentoId: number, motivo?: string): Observable<Tramite> {
     let params = new HttpParams().set('departamentoId', departamentoId.toString());
     if (motivo) params = params.set('motivo', motivo);
     return this.http.put<Tramite>(`${this.apiUrl}/${id}/derivar`, null, { params });
   }

  obtenerSeguimientoPublico(codigoRUT: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/publico/seguimiento/${codigoRUT}`);
  }

  // ========== UTILIDADES ==========
  private construirParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return httpParams;
  }

  // ========== ENRIQUECIMIENTO ==========
  enriquecerTramite(tramite: any): TramiteEnriquecido {
    return TramiteStatesUtils.enriquecerTramite(tramite);
  }
}
