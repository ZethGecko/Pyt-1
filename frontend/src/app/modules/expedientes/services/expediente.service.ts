import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface ExpedienteResponse {
  id: number;
  codigo: string;
  nombre: string;
  año: number;
  estado: string;
  estadoFormateado?: string;
  colorEstado?: string;
  fechaCreacion: Date;
  fechaRecepcion?: Date;
  fechaRevision?: Date;
  fechaCierre?: Date;
  observacionesGenerales?: string;
  
  // Empresa
  empresaId: number;
  empresaCodigo?: string;
  empresaNombre?: string;
  empresaRuc?: string;
  
  // Tipo trámite
  tipoTramiteId: number;
  tipoTramiteCodigo?: string;
  tipoTramiteCategoria?: string;
  tipoTramiteDescripcion?: string;
  
  // Usuario receptor
  usuarioReceptorId?: number;
  usuarioReceptorUsername?: string;
  usuarioReceptorNombre?: string;
  
  // Estadísticas
  totalSolicitudes: number;
  solicitudesPendientes: number;
  solicitudesAprobadas?: number;
  solicitudesRechazadas?: number;
  totalTramites?: number;
  tramitesEnCurso?: number;
  tramitesFinalizados?: number;
  
  // Campos calculados (opcionales)
  solicitudesCompletadas?: number;
  porcentajeCompletado?: number;
}

export interface ExpedienteCreateRequest {
  codigo?: string;
  nombre: string;
  año: number;
  empresaId: number;
  tipoTramiteId: number;
  observacionesGenerales?: string;
}

export interface ExpedienteUpdateRequest {
  codigo?: string;
  nombre?: string;
  año?: number;
  empresaId?: number;
  tipoTramiteId?: number;
  observacionesGenerales?: string;
  estado?: string;
  fechaCierre?: Date;
}

@Injectable({ providedIn: 'root' })
export class ExpedienteService {
  private apiUrl = `${environment.apiUrl}/expedientes`;

  constructor(private http: HttpClient) {}

  // ========== CRUD ==========
  obtener(id: number): Observable<ExpedienteResponse> {
    return this.http.get<ExpedienteResponse>(`${this.apiUrl}/${id}`);
  }

  listarTodos(): Observable<ExpedienteResponse[]> {
    return this.http.get<ExpedienteResponse[]>(this.apiUrl);
  }

  listarEnriquecidos(page: number, size: number): Observable<{ content: ExpedienteResponse[]; totalElements: number }> {
    return this.http.get<any>(
      `${this.apiUrl}/enriquecidos/paginado`,
      { params: { page: page.toString(), size: size.toString() } }
    ).pipe(
      map(response => ({
        content: response.content || [],
        totalElements: response.totalElements || 0
      }))
    );
  }

  listarPorEmpresa(empresaId: number): Observable<ExpedienteResponse[]> {
    return this.http.get<ExpedienteResponse[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  listarPorEstado(estado: string): Observable<ExpedienteResponse[]> {
    return this.http.get<ExpedienteResponse[]>(`${this.apiUrl}/estado/${estado}`);
  }

  crear(expediente: ExpedienteCreateRequest): Observable<ExpedienteResponse> {
    return this.http.post<ExpedienteResponse>(this.apiUrl, expediente);
  }

  actualizar(id: number, expediente: ExpedienteUpdateRequest): Observable<ExpedienteResponse> {
    return this.http.put<ExpedienteResponse>(`${this.apiUrl}/${id}`, expediente);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== ESTADOS ==========
  cerrar(id: number): Observable<ExpedienteResponse> {
    return this.http.put<ExpedienteResponse>(`${this.apiUrl}/${id}/cerrar`, {});
  }

  reabrir(id: number): Observable<ExpedienteResponse> {
    return this.http.put<ExpedienteResponse>(`${this.apiUrl}/${id}/reabrir`, {});
  }

  // ========== EXPEDIENTES ==========
  agregarSolicitud(expedienteId: number, solicitudId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${expedienteId}/solicitudes`, { solicitudId });
  }

  agregarMultiple(expedienteId: number, solicitudIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${expedienteId}/solicitudes/masivo`, { solicitudIds });
  }

  quitarSolicitud(expedienteId: number, solicitudId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${expedienteId}/solicitudes/${solicitudId}`);
  }

  // ========== OBSERVACIONES ==========
  agregarObservacion(expedienteId: number, observacion: {
    texto: string;
    tipo?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${expedienteId}/observaciones`, observacion);
  }

  listarObservaciones(expedienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${expedienteId}/observaciones`);
  }

  // ========== SEGUIMIENTO ==========
  obtenerSeguimiento(expedienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${expedienteId}/seguimiento`);
  }

  // ========== ESTADÍSTICAS ==========
  obtenerEstadisticas(expedienteId: number): Observable<{
    totalSolicitudes: number;
    aprobadas: number;
    rechazadas: number;
    observadas: number;
    pendientes: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${expedienteId}/estadisticas`);
  }

  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<ExpedienteResponse[]> {
    return this.http.get<ExpedienteResponse[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }

  // ========== GENERACIÓN DE CÓDIGO ==========
  generarCodigo(prefijo: string, anio: number): Observable<{ codigoGenerado: string }> {
    return this.http.get<{ codigoGenerado: string }>(`${this.apiUrl}/generar-codigo`, {
      params: { prefijo, anio: anio.toString() }
    });
  }

  // ========== UTILIDADES ==========
  obtenerAniosDisponibles(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/anios/disponibles`);
  }

  obtenerTiposTramiteParaSelect(): Observable<Array<{id: number, label: string}>> {
    return this.http.get<Array<{value: string, label: string, categoria?: string}>>(
      `${this.apiUrl}/tipos-tramite/selector`
    ).pipe(
      map(tipos => tipos.map(t => ({
        id: parseInt(t.value),
        label: t.label
      })))
    );
  }
}
