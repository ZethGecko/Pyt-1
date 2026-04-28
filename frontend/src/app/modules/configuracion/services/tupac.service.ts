import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  TUPAC,
  TUPACCreateRequest,
  TUPACUpdateRequest,
  TUPACEnriquecidoProjection,
  EstadoTUPAC
} from '../models/tupac.model';
import { RequisitoTUPAC } from '../models/requisito-tupac.model';

export type {
  TUPAC,
  TUPACCreateRequest,
  TUPACUpdateRequest,
  TUPACEnriquecidoProjection,
  EstadoTUPAC
} from '../models/tupac.model';

@Injectable({
  providedIn: 'root'
})
export class TUPACService {
  private baseUrl = `${environment.apiUrl}/tupac`;

  constructor(private http: HttpClient) {}

  // ========== CRUD BÁSICO ==========

  listarTodos(): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(this.baseUrl);
  }

  listarEnriquecidos(page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/enriquecidos`, { params });
  }

  obtenerPorId(id: number): Observable<TUPAC> {
    return this.http.get<TUPAC>(`${this.baseUrl}/${id}`);
  }

  obtenerEnriquecidoPorId(id: number): Observable<TUPACEnriquecidoProjection> {
    return this.http.get<TUPACEnriquecidoProjection>(`${this.baseUrl}/${id}/enriquecido`);
  }

  obtenerPorCodigo(codigo: string): Observable<TUPAC> {
    return this.http.get<TUPAC>(`${this.baseUrl}/codigo/${codigo}`);
  }

  existePorCodigo(codigo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verificar/existe-codigo/${codigo}`);
  }

  validarCodigoUnico(codigo: string, idExcluir?: number): Observable<void> {
    let url = `${this.baseUrl}/verificar/codigo-unico?codigo=${encodeURIComponent(codigo)}`;
    if (idExcluir !== undefined) {
      url += `&idExcluir=${idExcluir}`;
    }
    return this.http.get<void>(url);
  }

  puedeEliminar(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verificar/puede-eliminar/${id}`);
  }

  crear(tupac: TUPACCreateRequest): Observable<TUPAC> {
    return this.http.post<TUPAC>(this.baseUrl, tupac);
  }

  actualizar(id: number, tupac: TUPACUpdateRequest): Observable<TUPAC> {
    return this.http.put<TUPAC>(`${this.baseUrl}/${id}`, tupac);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ========== OPERACIONES DE ESTADO ==========

  cambiarEstado(id: number, nuevoEstado: string): Observable<TUPAC> {
    return this.http.put<TUPAC>(`${this.baseUrl}/${id}/cambiar-estado/${nuevoEstado}`, {});
  }

  archivar(id: number): Observable<TUPAC> {
    return this.http.put<TUPAC>(`${this.baseUrl}/${id}/archivar`, {});
  }

  ponerEnRevision(id: number): Observable<TUPAC> {
    return this.http.put<TUPAC>(`${this.baseUrl}/${id}/revision`, {});
  }

  ponerVigente(id: number): Observable<TUPAC> {
    return this.http.put<TUPAC>(`${this.baseUrl}/${id}/vigente`, {});
  }

  estaVigente(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verificar/esta-vigente/${id}`);
  }

  estaVencido(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verificar/esta-vencido/${id}`);
  }

  obtenerFechaVencimiento(id: number): Observable<string> {
    return this.http.get<{ fechaVencimiento: string }>(`${this.baseUrl}/${id}/fecha-vencimiento`)
      .pipe(map(res => res.fechaVencimiento));
  }

  // ========== CONSULTAS ESPECÍFICAS ==========

  listarPorCategoria(categoria: string): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(`${this.baseUrl}/categoria/${categoria}`);
  }

  listarVigentesPorCategoria(categoria: string): Observable<TUPACEnriquecidoProjection[]> {
    return this.http.get<TUPACEnriquecidoProjection[]>(`${this.baseUrl}/categoria/${categoria}/vigentes/enriquecidos`);
  }

  listarPorEstado(estado: string): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(`${this.baseUrl}/estado/${estado}`);
  }

  listarPorSubtipoTransporte(subtipoId: number): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(`${this.baseUrl}/subtipo/${subtipoId}`);
  }

  listarGenerales(): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(`${this.baseUrl}/generales`);
  }

  listarVigentes(): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(`${this.baseUrl}/vigentes`);
  }

  listarProximosAVencer(dias: number = 30): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(`${this.baseUrl}/por-vencer?dias=${dias}`);
  }

  listarVencidosNoActualizados(): Observable<TUPAC[]> {
    return this.http.get<TUPAC[]>(`${this.baseUrl}/vencidos`);
  }

  // ========== BÚSQUEDAS ==========

  buscarPorTermino(termino: string): Observable<TUPAC[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<TUPAC[]>(`${this.baseUrl}/buscar`, { params });
  }

  buscarEnriquecidosPorTermino(termino: string): Observable<TUPACEnriquecidoProjection[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<TUPACEnriquecidoProjection[]>(`${this.baseUrl}/buscar/enriquecidos`, { params });
  }

  // ========== DATOS MAESTROS ==========

  obtenerCategoriasUnicas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categorias`);
  }

  obtenerEstadosPosibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/estados`);
  }

  obtenerTUPACsParaSelect(): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/selector`);
  }

  obtenerTUPACsVigentesParaSelect(): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/selector/vigentes`);
  }

  obtenerTUPACsPorCategoriaParaSelect(categoria: string): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/selector/categoria/${categoria}`);
  }

  // ========== ESTADÍSTICAS ==========

  obtenerEstadisticas(id: number): Observable<Map<string, any>> {
    return this.http.get<Map<string, any>>(`${this.baseUrl}/estadisticas/${id}`);
  }

  obtenerEstadisticasPorCategoria(): Observable<Map<string, any>[]> {
    return this.http.get<Map<string, any>[]>(`${this.baseUrl}/estadisticas/categoria`);
  }

  obtenerEstadisticasPorEstado(): Observable<Map<string, any>[]> {
    return this.http.get<Map<string, any>[]>(`${this.baseUrl}/estadisticas/estado`);
  }

  obtenerEstadisticasGenerales(): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.baseUrl}/estadisticas/generales`);
  }

  // ========== MÉTODOS UTILITARIOS ==========

  getNombreCompleto(tupac: TUPAC): string {
    return `${tupac.codigo} - ${tupac.descripcion}`;
  }

  isVigente(tupac: TUPAC): boolean {
    return tupac.estado.toLowerCase() === 'vigente';
  }

  isEnRevision(tupac: TUPAC): boolean {
    return tupac.estado.toLowerCase() === 'en_revision';
  }

  isArchivado(tupac: TUPAC): boolean {
    return tupac.estado.toLowerCase() === 'archivado';
  }

  puedeCambiarEstado(tupac: TUPAC, nuevoEstado: string): boolean {
    if (tupac.estado === nuevoEstado) return false;
    
    // No se puede eliminar un TUPAC vencido
    if (nuevoEstado.toLowerCase() === 'eliminado' && tupac.estado === 'vencido') {
      return false;
    }
    
    return true;
  }

   // ========== REQUISITOS ASOCIADOS ==========

   obtenerRequisitosPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
     return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/${tupacId}/requisitos`);
   }
}
