import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  RequisitoTUPAC,
  RequisitoTUPACCreateRequest,
  RequisitoTUPACUpdateRequest,
  RequisitoTUPACEnriquecidoProjection,
  TIPOS_DOCUMENTO,
  TipoDocumento
} from '../models/requisito-tupac.model';

export { TIPOS_DOCUMENTO } from '../models/requisito-tupac.model';
export type {
  RequisitoTUPAC,
  RequisitoTUPACCreateRequest,
  RequisitoTUPACUpdateRequest,
  RequisitoTUPACEnriquecidoProjection,
  TipoDocumento
} from '../models/requisito-tupac.model';

@Injectable({
  providedIn: 'root'
})
export class RequisitoTUPACService {
  private baseUrl = `${environment.apiUrl}/requisitos-tupac`;

  constructor(private http: HttpClient) {}

  // ========== CRUD BÁSICO ==========

  listarTodos(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(this.baseUrl);
  }

  listarEnriquecidos(page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/enriquecidos`, { params });
  }

   // Nuevo método para cargar todos los requisitos enriquecidos sin paginación
   listarTodosEnriquecidos(): Observable<RequisitoTUPACEnriquecidoProjection[]> {
     return this.http.get<RequisitoTUPACEnriquecidoProjection[]>(`${this.baseUrl}/enriquecidos`);
   }

  listarActivos(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/activos`);
  }

  listarObligatorios(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/obligatorios`);
  }

  listarExamenes(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/examenes`);
  }

  obtenerPorId(id: number): Observable<RequisitoTUPAC> {
    return this.http.get<RequisitoTUPAC>(`${this.baseUrl}/${id}`);
  }

  obtenerEnriquecidoPorId(id: number): Observable<RequisitoTUPACEnriquecidoProjection> {
    return this.http.get<RequisitoTUPACEnriquecidoProjection>(`${this.baseUrl}/${id}/enriquecido`);
  }

  obtenerPorCodigo(codigo: string): Observable<RequisitoTUPAC> {
    return this.http.get<RequisitoTUPAC>(`${this.baseUrl}/codigo/${codigo}`);
  }

  existePorCodigo(codigo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/codigo/${codigo}/existe`);
  }

  crear(requisito: RequisitoTUPACCreateRequest): Observable<RequisitoTUPAC> {
    return this.http.post<RequisitoTUPAC>(this.baseUrl, requisito);
  }

  actualizar(id: number, requisito: RequisitoTUPACUpdateRequest): Observable<RequisitoTUPAC> {
    return this.http.put<RequisitoTUPAC>(`${this.baseUrl}/${id}`, requisito);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activar(id: number): Observable<RequisitoTUPAC> {
    return this.http.put<RequisitoTUPAC>(`${this.baseUrl}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<RequisitoTUPAC> {
    return this.http.put<RequisitoTUPAC>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  clonar(id: number, nuevoTupacId: number): Observable<RequisitoTUPAC> {
    return this.http.post<RequisitoTUPAC>(`${this.baseUrl}/clonar/${id}/tupac/${nuevoTupacId}`, {});
  }

  puedeEliminar(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${id}/validar-eliminar`);
  }

  // ========== CONSULTAS POR TUPAC ==========

  listarPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/tupac/${tupacId}`);
  }

  listarEnriquecidosPorTupac(tupacId: number): Observable<RequisitoTUPACEnriquecidoProjection[]> {
    return this.http.get<RequisitoTUPACEnriquecidoProjection[]>(`${this.baseUrl}/tupac/${tupacId}/enriquecidos`);
  }

  listarObligatoriosPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/tupac/${tupacId}/obligatorios`);
  }

  listarExamenesPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/tupac/${tupacId}/examenes`);
  }

  // ========== CONSULTAS POR TIPO DE TRÁMITE ==========

  listarParaTipoTramite(codigoTipoTramite: string): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/tipo-tramite/${codigoTipoTramite}`);
  }

  listarQueAplicanParaTipoTramite(codigoTipoTramite: string): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/tipo-tramite/${codigoTipoTramite}/aplican`);
  }

  esRequisitoValidoParaTipoTramite(requisitoId: number, codigoTipoTramite: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${requisitoId}/valido-tipo-tramite/${codigoTipoTramite}`);
  }

  // ========== BÚSQUEDAS ==========

  buscarPorTermino(termino: string): Observable<RequisitoTUPAC[]> {
    let params = new HttpParams();
    if (termino) params = params.set('termino', termino);
    return this.http.get<RequisitoTUPAC[]>(`${this.baseUrl}/buscar/termino`, { params });
  }

  buscarEnriquecidosPorTermino(termino: string): Observable<RequisitoTUPACEnriquecidoProjection[]> {
    let params = new HttpParams();
    if (termino) params = params.set('termino', termino);
    return this.http.get<RequisitoTUPACEnriquecidoProjection[]>(`${this.baseUrl}/buscar/termino/enriquecidos`, { params });
  }

  // ========== ESTADÍSTICAS ==========

  obtenerEstadisticas(id: number): Observable<Map<string, any>> {
    return this.http.get<Map<string, any>>(`${this.baseUrl}/${id}/estadisticas`);
  }

  obtenerEstadisticasPorTipoDocumento(): Observable<Map<string, any>[]> {
    return this.http.get<Map<string, any>[]>(`${this.baseUrl}/estadisticas/tipo-documento`);
  }

  obtenerEstadisticasPorObligatoriedad(): Observable<Map<string, any>[]> {
    return this.http.get<Map<string, any>[]>(`${this.baseUrl}/estadisticas/obligatoriedad`);
  }

  obtenerEstadisticasPorTupac(tupacId: number): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.baseUrl}/tupac/${tupacId}/estadisticas`);
  }

  // ========== SELECTORES Y DATOS MAESTROS ==========

  obtenerTiposDocumentoUnicos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/tipos-documento`);
  }

  obtenerRequisitosParaSelect(): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/selector`);
  }

  obtenerRequisitosPorTupacParaSelect(tupacId: number): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/tupac/${tupacId}/selector`);
  }

  obtenerExamenesParaSelect(): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/examenes/selector`);
  }

  // ========== MÉTODOS UTILITARIOS ==========

  formatTipoDocumento(tipo: string): string {
    if (!tipo) return '';
    const tipoDoc = tipo.toLowerCase() as TipoDocumento;
    const encontrado = TIPOS_DOCUMENTO.find((t: { value: TipoDocumento; label: string }) => t.value === tipoDoc);
    return encontrado ? encontrado.label : tipo;
  }

  getNombreCompleto(requisito: RequisitoTUPAC): string {
    return `${requisito.codigo} - ${requisito.descripcion}`;
  }

  esExamen(requisito: RequisitoTUPAC): boolean {
    return Boolean(requisito.esExamen);
  }

  esObligatorio(requisito: RequisitoTUPAC): boolean {
    return Boolean(requisito.obligatorio);
  }

  esActivo(requisito: RequisitoTUPAC): boolean {
    return Boolean(requisito.activo);
  }
  
  // ========== MÉTODOS DE COMPATIBILIDAD (ALIAS) ==========
  
  // Alias para getAll (usado en algunos componentes)
  getAll(): Observable<RequisitoTUPAC[]> {
    return this.listarTodos();
  }
  
  // Alias para getByTUPAC (usado en algunos componentes)
  getByTUPAC(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.listarPorTupac(tupacId);
  }
  
  // Alias para create (usado en algunos componentes)
  create(requisito: RequisitoTUPACCreateRequest): Observable<RequisitoTUPAC> {
    return this.crear(requisito);
  }
  
  // Alias para update (usado en algunos componentes)
  update(id: number, requisito: RequisitoTUPACUpdateRequest): Observable<RequisitoTUPAC> {
    return this.actualizar(id, requisito);
  }
  
  // Alias para getActivos (usado en algunos componentes)
  getActivos(): Observable<RequisitoTUPAC[]> {
    return this.listarActivos();
  }
}
