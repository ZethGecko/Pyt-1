import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RequisitoTUPAC, RequisitoTUPACSelectOption, RequisitoTUPACEnriquecido, EstadisticasRequisito } from '../models/requisito-tupac.model';

export interface RequisitoTUPACResponse {
  content: RequisitoTUPAC[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class RequisitoTUPACService {
  private apiUrl = `${environment.apiUrl}/requisitos-tupac`;

  constructor(private http: HttpClient) {}

  // ========== ENDPOINTS PÚBLICOS ==========

  /** Listar todos los requisitos TUPAC */
  listarTodos(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(this.apiUrl);
  }

  /** Listar requisitos enriquecidos paginados */
  listarEnriquecidos(page: number = 0, size: number = 50): Observable<RequisitoTUPACResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<RequisitoTUPACResponse>(`${this.apiUrl}/enriquecidos`, { params });
  }

  /** Listar requisitos activos */
  listarActivos(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/activos`);
  }

  /** Listar requisitos obligatorios */
  listarObligatorios(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/obligatorios`);
  }

  /** Listar requisitos de examen */
  listarExamenes(): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/examenes`);
  }

  /** Obtener requisito por ID */
  obtenerPorId(id: number): Observable<RequisitoTUPAC> {
    return this.http.get<RequisitoTUPAC>(`${this.apiUrl}/${id}`);
  }

  /** Obtener requisito enriquecido por ID */
  obtenerEnriquecidoPorId(id: number): Observable<RequisitoTUPACEnriquecido> {
    return this.http.get<RequisitoTUPACEnriquecido>(`${this.apiUrl}/${id}/enriquecido`);
  }

  /** Obtener requisito por código */
  obtenerPorCodigo(codigo: string): Observable<RequisitoTUPAC> {
    return this.http.get<RequisitoTUPAC>(`${this.apiUrl}/codigo/${codigo}`);
  }

  /** Listar requisitos por TUPAC */
  listarPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/tupac/${tupacId}`);
  }

  /** Listar requisitos enriquecidos por TUPAC */
  listarEnriquecidosPorTupac(tupacId: number): Observable<RequisitoTUPACEnriquecido[]> {
    return this.http.get<RequisitoTUPACEnriquecido[]>(`${this.apiUrl}/tupac/${tupacId}/enriquecidos`);
  }

  /** Listar requisitos obligatorios por TUPAC */
  listarObligatoriosPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/tupac/${tupacId}/obligatorios`);
  }

  /** Listar exámenes por TUPAC */
  listarExamenesPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/tupac/${tupacId}/examenes`);
  }

  /** Listar requisitos con orden por TUPAC */
  listarConOrdenPorTupac(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/tupac/${tupacId}/con-orden`);
  }

  /** Listar requisitos para tipo de trámite */
  listarParaTipoTramite(codigoTipoTramite: string): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/tipo-tramite/${codigoTipoTramite}`);
  }

  /** Listar requisitos que aplican para tipo de trámite */
  listarQueAplicanParaTipoTramite(codigoTipoTramite: string): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/tipo-tramite/${codigoTipoTramite}/aplican`);
  }

  /** Buscar requisitos por término */
  buscarPorTermino(termino: string): Observable<RequisitoTUPAC[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/buscar/termino`, { params });
  }

  /** Buscar requisitos enriquecidos por término */
  buscarEnriquecidosPorTermino(termino: string): Observable<RequisitoTUPACEnriquecido[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<RequisitoTUPACEnriquecido[]>(`${this.apiUrl}/buscar/termino/enriquecidos`, { params });
  }

  /** Obtener secuencia ordenada de requisitos por TUPAC */
  obtenerSecuenciaOrdenada(tupacId: number): Observable<RequisitoTUPAC[]> {
    return this.http.get<RequisitoTUPAC[]>(`${this.apiUrl}/tupac/${tupacId}/secuencia-ordenada`);
  }

  // ========== ENDPOINTS DE ESTADÍSTICAS ==========

  /** Obtener estadísticas de requisito */
  obtenerEstadisticas(id: number): Observable<EstadisticasRequisito> {
    return this.http.get<EstadisticasRequisito>(`${this.apiUrl}/${id}/estadisticas`);
  }

  /** Obtener estadísticas por tipo de documento */
  obtenerEstadisticasPorTipoDocumento(): Observable<Map<string, Object>[]> {
    return this.http.get<Map<string, Object>[]>(`${this.apiUrl}/estadisticas/tipo-documento`);
  }

  /** Obtener estadísticas por obligatoriedad */
  obtenerEstadisticasPorObligatoriedad(): Observable<Map<string, Object>[]> {
    return this.http.get<Map<string, Object>[]>(`${this.apiUrl}/estadisticas/obligatoriedad`);
  }

  /** Obtener estadísticas por TUPAC */
  obtenerEstadisticasPorTupac(tupacId: number): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.apiUrl}/tupac/${tupacId}/estadisticas`);
  }

  // ========== ENDPOINTS PARA SELECTORES ==========

  /** Obtener tipos de documento únicos */
  obtenerTiposDocumentoUnicos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tipos-documento`);
  }

  /** Obtener requisitos para selector (dropdown) */
  obtenerRequisitosParaSelect(): Observable<RequisitoTUPACSelectOption[]> {
    return this.http.get<RequisitoTUPACSelectOption[]>(`${this.apiUrl}/selector`);
  }

  /** Obtener requisitos por TUPAC para selector */
  obtenerRequisitosPorTupacParaSelect(tupacId: number): Observable<RequisitoTUPACSelectOption[]> {
    return this.http.get<RequisitoTUPACSelectOption[]>(`${this.apiUrl}/tupac/${tupacId}/selector`);
  }

  /** Obtener exámenes para selector */
  obtenerExamenesParaSelect(): Observable<RequisitoTUPACSelectOption[]> {
    return this.http.get<RequisitoTUPACSelectOption[]>(`${this.apiUrl}/examenes/selector`);
  }

  // ========== UTILIDADES ==========

  /** Verificar si existe requisito por código */
  existePorCodigo(codigo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/codigo/${codigo}/existe`);
  }

  /** Validar si requisito es válido para tipo de trámite */
  esRequisitoValidoParaTipoTramite(requisitoId: number, codigoTipoTramite: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${requisitoId}/valido-tipo-tramite/${codigoTipoTramite}`);
  }

  /** Validar secuencia de requisitos para TUPAC */
  validarSecuenciaRequisitos(tupacId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/tupac/${tupacId}/validar-secuencia`);
  }
}
