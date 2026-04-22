import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  ReglaTipoTramitePermiso,
  ReglaTipoTramitePermisoCreateRequest,
  ReglaTipoTramitePermisoUpdateRequest,
  ReglaTipoTramitePermisoEnriquecidoProjection,
  ReglaTipoTramitePermisoStats
} from '../models/regla-tipo-tramite-permiso.model';

export type {
  ReglaTipoTramitePermiso,
  ReglaTipoTramitePermisoCreateRequest,
  ReglaTipoTramitePermisoUpdateRequest,
  ReglaTipoTramitePermisoEnriquecidoProjection,
  ReglaTipoTramitePermisoStats
} from '../models/regla-tipo-tramite-permiso.model';

@Injectable({
  providedIn: 'root'
})
export class ReglaTipoTramitePermisoService {
  private baseUrl = `${environment.apiUrl}/reglas-tipo-tramite-permiso`;

  constructor(private http: HttpClient) {}

  // ========== CRUD BÁSICO ==========

  listarTodos(): Observable<ReglaTipoTramitePermiso[]> {
    return this.http.get<ReglaTipoTramitePermiso[]>(this.baseUrl);
  }

  listarEnriquecidos(page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/enriquecidos`, { params });
  }

  listarActivas(): Observable<ReglaTipoTramitePermiso[]> {
    return this.http.get<ReglaTipoTramitePermiso[]>(`${this.baseUrl}/activas`);
  }

  obtenerPorId(id: number): Observable<ReglaTipoTramitePermiso> {
    return this.http.get<ReglaTipoTramitePermiso>(`${this.baseUrl}/${id}`);
  }

  obtenerEnriquecidoPorId(id: number): Observable<ReglaTipoTramitePermisoEnriquecidoProjection> {
    return this.http.get<ReglaTipoTramitePermisoEnriquecidoProjection>(`${this.baseUrl}/${id}/enriquecido`);
  }

  obtenerPorTipoTramiteId(tipoTramiteId: number): Observable<ReglaTipoTramitePermiso> {
    return this.http.get<ReglaTipoTramitePermiso>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}`);
  }

  obtenerPorTipoTramiteCodigo(tipoTramiteCodigo: string): Observable<ReglaTipoTramitePermiso> {
    return this.http.get<ReglaTipoTramitePermiso>(`${this.baseUrl}/tipo-tramite-codigo/${tipoTramiteCodigo}`);
  }

  existeParaTipoTramite(tipoTramiteId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/existe-regla`);
  }

  existeParaTipoTramiteCodigo(tipoTramiteCodigo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite-codigo/${tipoTramiteCodigo}/existe-regla`);
  }

  crear(regla: ReglaTipoTramitePermisoCreateRequest): Observable<ReglaTipoTramitePermiso> {
    return this.http.post<ReglaTipoTramitePermiso>(this.baseUrl, regla);
  }

  actualizar(id: number, regla: ReglaTipoTramitePermisoUpdateRequest): Observable<ReglaTipoTramitePermiso> {
    return this.http.put<ReglaTipoTramitePermiso>(`${this.baseUrl}/${id}`, regla);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activar(id: number): Observable<ReglaTipoTramitePermiso> {
    return this.http.put<ReglaTipoTramitePermiso>(`${this.baseUrl}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ReglaTipoTramitePermiso> {
    return this.http.put<ReglaTipoTramitePermiso>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  // ========== MÉTODOS ESPECÍFICOS ==========

  configurarParaEmpresas(tipoTramiteId: number, requiereEmpresaActiva: boolean): Observable<ReglaTipoTramitePermiso> {
    let params = new HttpParams().set('requiereEmpresaActiva', requiereEmpresaActiva.toString());
    return this.http.post<ReglaTipoTramitePermiso>(
      `${this.baseUrl}/tipo-tramite/${tipoTramiteId}/configurar-empresas`,
      {},
      { params }
    );
  }

  configurarParaPersonasNaturales(tipoTramiteId: number, edadMinima?: number, requiereLicencia?: boolean): Observable<ReglaTipoTramitePermiso> {
    let params = new HttpParams();
    if (edadMinima !== undefined) params = params.set('edadMinima', edadMinima.toString());
    if (requiereLicencia !== undefined) params = params.set('requiereLicencia', requiereLicencia.toString());
    
    return this.http.post<ReglaTipoTramitePermiso>(
      `${this.baseUrl}/tipo-tramite/${tipoTramiteId}/configurar-personas-naturales`,
      {},
      { params }
    );
  }

  configurarParaVehiculos(tipoTramiteId: number, antiguedadMaxima?: number, requiereInspeccion?: boolean): Observable<ReglaTipoTramitePermiso> {
    let params = new HttpParams();
    if (antiguedadMaxima !== undefined) params = params.set('antiguedadMaxima', antiguedadMaxima.toString());
    if (requiereInspeccion !== undefined) params = params.set('requiereInspeccion', requiereInspeccion.toString());
    
    return this.http.post<ReglaTipoTramitePermiso>(
      `${this.baseUrl}/tipo-tramite/${tipoTramiteId}/configurar-vehiculos`,
      {},
      { params }
    );
  }

  // ========== CONSULTAS Y BÚSQUEDAS ==========

  buscarPorTermino(termino: string): Observable<ReglaTipoTramitePermiso[]> {
    let params = new HttpParams();
    if (termino) params = params.set('termino', termino);
    return this.http.get<ReglaTipoTramitePermiso[]>(`${this.baseUrl}/buscar/termino`, { params });
  }

  buscarEnriquecidosPorTermino(termino: string): Observable<ReglaTipoTramitePermisoEnriquecidoProjection[]> {
    let params = new HttpParams();
    if (termino) params = params.set('termino', termino);
    return this.http.get<ReglaTipoTramitePermisoEnriquecidoProjection[]>(`${this.baseUrl}/buscar/termino/enriquecidos`, { params });
  }

  listarPorTipoSolicitante(tipoSolicitante: string): Observable<ReglaTipoTramitePermiso[]> {
    return this.http.get<ReglaTipoTramitePermiso[]>(`${this.baseUrl}/tipo-solicitante/${tipoSolicitante}`);
  }

  listarParaPersonaNatural(edad: number): Observable<ReglaTipoTramitePermiso[]> {
    return this.http.get<ReglaTipoTramitePermiso[]>(`${this.baseUrl}/persona-natural/${edad}`);
  }

  listarParaVehiculo(antiguedad: number): Observable<ReglaTipoTramitePermiso[]> {
    return this.http.get<ReglaTipoTramitePermiso[]>(`${this.baseUrl}/vehiculo/${antiguedad}`);
  }

  listarConRequisitosEspeciales(): Observable<ReglaTipoTramitePermiso[]> {
    return this.http.get<ReglaTipoTramitePermiso[]>(`${this.baseUrl}/requisitos-especiales`);
  }

  // ========== VALIDACIONES ==========

  permiteSolicitante(tipoTramiteId: number, tipoSolicitante: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/permite-solicitante/${tipoSolicitante}`);
  }

  permiteSolicitantePorCodigo(tipoTramiteCodigo: string, tipoSolicitante: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite-codigo/${tipoTramiteCodigo}/permite-solicitante/${tipoSolicitante}`);
  }

  cumpleRequisitosEspeciales(tipoTramiteId: number, tipoSolicitante: string, datosSolicitante: any): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}/tipo-tramite/${tipoTramiteId}/cumple-requisitos-especiales/${tipoSolicitante}`,
      datosSolicitante
    );
  }

  obtenerTiposSolicitantesPermitidos(tipoTramiteId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/tipos-permitidos`);
  }

  requiereEmpresaActiva(tipoTramiteId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/requiere-empresa-activa`);
  }

  requiereLicenciaConductor(tipoTramiteId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/requiere-licencia-conductor`);
  }

  obtenerEdadMinima(tipoTramiteId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/edad-minima`);
  }

  obtenerAntiguedadMaximaVehiculo(tipoTramiteId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/antiguedad-maxima-vehiculo`);
  }

  requiereInspeccionTecnica(tipoTramiteId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/requiere-inspeccion-tecnica`);
  }

  requiereHabilitacionAnterior(tipoTramiteId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/requiere-habilitacion-anterior`);
  }

  obtenerDiasValidezDocumentos(tipoTramiteId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/dias-validez-documentos`);
  }

  obtenerPlazoMaximoSolicitud(tipoTramiteId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/plazo-maximo-solicitud`);
  }

  // ========== ESTADÍSTICAS ==========

  obtenerEstadisticas(id: number): Observable<Map<string, any>> {
    return this.http.get<Map<string, any>>(`${this.baseUrl}/${id}/estadisticas`);
  }

  obtenerEstadisticasGenerales(): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.baseUrl}/estadisticas-generales`);
  }

  obtenerEstadisticasPorCategoria(): Observable<Map<string, any>[]> {
    return this.http.get<Map<string, any>[]>(`${this.baseUrl}/estadisticas-categoria`);
  }

  obtenerEstadisticasPorTipoSolicitante(): Observable<Map<string, any>[]> {
    return this.http.get<Map<string, any>[]>(`${this.baseUrl}/estadisticas-tipo-solicitante`);
  }

  // ========== SELECTORES Y CONSULTAS UTILIDADES ==========

  obtenerReglasParaSelect(): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/selector`);
  }

  obtenerTiposTramiteSinRegla(): Observable<Map<string, string>[]> {
    return this.http.get<Map<string, string>[]>(`${this.baseUrl}/tipos-tramite-sin-regla`);
  }

  obtenerConfiguracionCompleta(tipoTramiteId: number): Observable<Map<string, any>> {
    return this.http.get<Map<string, any>>(`${this.baseUrl}/tipo-tramite/${tipoTramiteId}/configuracion-completa`);
  }

  // ========== MÉTODOS UTILITARIOS ==========

  formatTipoSolicitante(tipoSolicitante: string): string {
    switch (tipoSolicitante.toUpperCase()) {
      case 'PERSONA_NATURAL':
        return 'Persona Natural';
      case 'EMPRESA':
        return 'Empresa';
      case 'VEHICULO':
        return 'Vehículo';
      default:
        return tipoSolicitante;
    }
  }

  getTiposSolicitantesPermitidos(regla: ReglaTipoTramitePermiso): string {
    const tipos: string[] = [];
    if (regla.permiteEmpresa) tipos.push('Empresa');
    if (regla.permitePersonaNatural) tipos.push('Persona Natural');
    if (regla.permiteVehiculo) tipos.push('Vehículo');
    return tipos.join(', ');
  }

  getRequisitosEspeciales(regla: ReglaTipoTramitePermiso): string {
    const requisitos: string[] = [];
    if (regla.requiereEmpresaActiva) requisitos.push('Empresa Activa');
    if (regla.requiereLicenciaConductor) requisitos.push('Licencia de Conductor');
    if (regla.requiereInspeccionTecnica) requisitos.push('Inspección Técnica');
    if (regla.requiereHabilitacionAnterior) requisitos.push('Habilitación Anterior');
    if (regla.edadMinima) requisitos.push(`Edad Mínima: ${regla.edadMinima} años`);
    if (regla.antiguedadMaximaVehiculo) requisitos.push(`Antigüedad Máx Vehículo: ${regla.antiguedadMaximaVehiculo} años`);
    if (regla.diasValidezDocumentos) requisitos.push(`Validez Documentos: ${regla.diasValidezDocumentos} días`);
    if (regla.plazoMaximoSolicitudDias) requisitos.push(`Plazo Máx Solicitud: ${regla.plazoMaximoSolicitudDias} días`);
    return requisitos.join('; ');
  }

  esValidoParaSolicitante(regla: ReglaTipoTramitePermiso, tipoSolicitante: string): boolean {
    switch (tipoSolicitante.toUpperCase()) {
      case 'EMPRESA':
        return regla.permiteEmpresa;
      case 'PERSONA_NATURAL':
        return regla.permitePersonaNatural;
      case 'VEHICULO':
        return regla.permiteVehiculo;
      default:
        return false;
    }
  }

  esValidoParaEdad(regla: ReglaTipoTramitePermiso, edad: number): boolean {
    if (regla.edadMinima === null || regla.edadMinima === undefined) return true;
    return edad >= regla.edadMinima;
  }

  esValidoParaAntiguedadVehiculo(regla: ReglaTipoTramitePermiso, antiguedad: number): boolean {
    if (regla.antiguedadMaximaVehiculo === null || regla.antiguedadMaximaVehiculo === undefined) return true;
    return antiguedad <= regla.antiguedadMaximaVehiculo;
  }

  permiteAlMenosUnTipoSolicitante(regla: ReglaTipoTramitePermiso): boolean {
    return regla.permiteEmpresa || regla.permitePersonaNatural || regla.permiteVehiculo;
  }
}
