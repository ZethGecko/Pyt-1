import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TipoTramite, TipoTramiteCreateRequest, TipoTramiteUpdateRequest, TipoTramiteEnriquecido } from '../models/tipo-tramite.model';
import { RequisitoTUPAC } from '../models/requisito-tupac.model';

@Injectable({ providedIn: 'root' })
export class TipoTramiteService {
  private apiUrl = `${environment.apiUrl}/tipos-tramite`;
  
  constructor(private http: HttpClient) {}

  private transformToTipoTramite(data: any): TipoTramite {
    // Convertir idTipoTramite -> id para compatibilidad
    if (data.idTipoTramite !== undefined) {
      data.id = data.idTipoTramite;
      delete data.idTipoTramite;
    }
    return data as TipoTramite;
  }

  private transformToTipoTramiteEnriquecido(data: any): TipoTramiteEnriquecido {
    // Convertir idTipoTramite -> id
    if (data.idTipoTramite !== undefined) {
      data.id = data.idTipoTramite;
      delete data.idTipoTramite;
    }
    return data as TipoTramiteEnriquecido;
  }
  
  // ========== CRUD ==========
  obtener(id: number): Observable<TipoTramite> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(resp => this.transformToTipoTramite(resp))
    );
  }
  
  listarTodos(): Observable<TipoTramiteEnriquecido[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enriquecidos`).pipe(
      map(arr => arr.map(item => this.transformToTipoTramiteEnriquecido(item)))
    );
  }
  
  listarActivos(): Observable<TipoTramite[]> {
    return this.http.get<TipoTramite[]>(`${this.apiUrl}/activos`);
  }
  
  crear(tipo: TipoTramiteCreateRequest): Observable<TipoTramite> {
    return this.http.post<any>(this.apiUrl, tipo).pipe(
      map(resp => this.transformToTipoTramite(resp))
    );
  }
  
  actualizar(id: number, tipo: TipoTramiteUpdateRequest): Observable<TipoTramite> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tipo).pipe(
      map(resp => this.transformToTipoTramite(resp))
    );
  }
  
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<TipoTramite[]> {
    return this.http.get<TipoTramite[]>(`${this.apiUrl}/buscar`, {
      params: new HttpParams().set('termino', termino)
    });
  }
  
  listarPorCategoria(categoriaId: number): Observable<TipoTramite[]> {
    return this.http.get<TipoTramite[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }
  
  listarParaPersonaNatural(): Observable<TipoTramite[]> {
    return this.http.get<TipoTramite[]>(`${this.apiUrl}/persona-natural`);
  }
  
  listarParaEmpresa(): Observable<TipoTramite[]> {
    return this.http.get<TipoTramite[]>(`${this.apiUrl}/empresa`);
  }
  
  // ========== UTILIDADES ==========
  obtenerPorCodigo(codigo: string): Observable<TipoTramite | null> {
    return this.http.get<TipoTramite | null>(`${this.apiUrl}/codigo/${codigo}`);
  }
  
  existeConCodigo(codigo: string): Observable<{existe: boolean}> {
    return this.http.get<{existe: boolean}>(`${this.apiUrl}/verificar/existe-codigo/${codigo}`);
  }
  
  // ========== GESTIÓN DE REQUISITOS ==========
  
  /**
   * Obtiene los requisitos asociados a un tipo de trámite
   */
  obtenerRequisitos(tipoTramiteId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/${tipoTramiteId}/requisitos`);
  }
  
  /**
   * Obtiene los requisitos de un TUPAC (para asociar)
   */
  obtenerRequisitosDeTupac(tipoTramiteId: number, tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/${tipoTramiteId}/requisitos/tupac/${tupacId}`);
  }
  
  /**
   * Asocia una lista de requisitos al tipo de trámite
   */
  asociarRequisitos(tipoTramiteId: number, requisitoIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${tipoTramiteId}/requisitos`, requisitoIds);
  }
  
  /**
   * Aplica todos los requisitos del TUPAC asociado al tipo de trámite
   */
  aplicarTodosLosRequisitosDelTupac(tipoTramiteId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${tipoTramiteId}/requisitos/aplicar-todos`, {});
  }
  
  /**
   * Elimina un requisito del tipo de trámite
   */
  eliminarRequisito(tipoTramiteId: number, requisitoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tipoTramiteId}/requisitos/${requisitoId}`);
  }
  
  /**
   * Elimina todos los requisitos del tipo de trámite
   */
  eliminarTodosLosRequisitos(tipoTramiteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tipoTramiteId}/requisitos`);
  }
}
