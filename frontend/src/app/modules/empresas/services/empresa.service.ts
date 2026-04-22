import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Modelo corregido para coincidir con el backend
export interface EmpresaResponse {
  id: number;
  nombre: string;
  codigo?: string;
  ruc: string;
  direccionLegal: string;
  contactoTelefono?: string;
  email?: string;
  gerenteId?: number;
  subtipoTransporteId?: number;
  tipoTrayectoria?: string;
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  inicioVigencia?: Date | string;
  finVigencia?: Date | string;
  activo: boolean;
  estadoOperativo?: string;
  fechaRegistro?: Date | string;
  fechaActualizacion?: Date | string;
  observaciones?: string;
}

export interface EmpresaCreateRequest {
  nombre: string;
  codigo?: string;
  ruc: string;
  direccionLegal: string;
  contactoTelefono?: string;
  email?: string;
  gerenteId?: number;
  subtipoTransporteId?: number;
  tipoTrayectoria?: string;
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  inicioVigencia?: Date | string;
  finVigencia?: Date | string;
  activo?: boolean;
  estadoOperativo?: string;
  observaciones?: string;
}

export interface EmpresaUpdateRequest {
  nombre?: string;
  codigo?: string;
  direccionLegal?: string;
  contactoTelefono?: string;
  email?: string;
  gerenteId?: number;
  subtipoTransporteId?: number;
  tipoTrayectoria?: string;
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  inicioVigencia?: Date | string;
  finVigencia?: Date | string;
  activo?: boolean;
  estadoOperativo?: string;
  observaciones?: string;
}

// Proyección enriquecida del backend
export interface EmpresaProjection {
  id: number;
  nombre: string;
  codigo: string;
  ruc: string;
  contactoTelefono?: string;
  email?: string;
  direccionLegal?: string;
  tipoTrayectoria?: string;
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  inicioVigencia?: Date | string;
  finVigencia?: Date | string;
  activo?: boolean;
  estadoOperativo?: string;
  fechaRegistro?: Date | string;
  fechaActualizacion?: Date | string;
  observaciones?: string;
  porcentajeHabilitacion?: number;
  tieneVigenciaActiva?: boolean;
  estadoVigencia?: string;
  puedeOperar?: boolean;
  requiereActualizacion?: boolean;
  estadoGeneral?: string;
  jerarquiaTransporte?: string;
  informacionGerente?: string;
  infoVigencia?: string;
  gerente?: {
    id: number;
    nombre: string;
    dni?: number;
    telefono?: string;
    whatsapp?: string;
    partidaElectronica?: string;
    inicioVigenciaPoder?: Date | string;
    finVigenciaPoder?: Date | string;
    tienePoderVigente?: boolean;
  };
  subtipoTransporte?: {
    id: number;
    nombre: string;
    tipoTransporte?: {
      id: number;
      nombre: string;
      categoriaTransporte?: {
        id: number;
        nombre: string;
      };
    };
  };
}

// Estadísticas
export interface EmpresaEstadisticas {
  total: number;
  activas: number;
  inactivas: number;
  operativas: number;
  porVencer30Dias: number;
  porcentajeActivas: number;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl = `${environment.apiUrl}/empresas`;
  
  constructor(private http: HttpClient) {}
  
  // ========== CRUD ==========
  obtener(id: number): Observable<EmpresaResponse> {
    return this.http.get<EmpresaResponse>(`${this.apiUrl}/${id}`);
  }
  
  obtenerProjection(id: number): Observable<EmpresaProjection> {
    return this.http.get<EmpresaProjection>(`${this.apiUrl}/${id}/projected`);
  }
  
  listarTodos(): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(this.apiUrl);
  }
  
  listarActivas(): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(`${this.apiUrl}/activas`);
  }
  
  listarOperativas(): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(`${this.apiUrl}/operativas`);
  }
  
  listarInactivas(): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(`${this.apiUrl}/inactivas`);
  }
  
  crear(empresa: EmpresaCreateRequest): Observable<EmpresaResponse> {
    return this.http.post<EmpresaResponse>(this.apiUrl, empresa);
  }
  
  actualizar(id: number, empresa: EmpresaUpdateRequest): Observable<EmpresaResponse> {
    return this.http.put<EmpresaResponse>(`${this.apiUrl}/${id}`, empresa);
  }
  
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(`${this.apiUrl}/buscar`, {
      params: new HttpParams().set('termino', termino)
    });
  }
  
  buscarProjection(termino: string): Observable<EmpresaProjection[]> {
    return this.http.get<EmpresaProjection[]>(`${this.apiUrl}/buscar/projected`, {
      params: new HttpParams().set('termino', termino)
    });
  }
  
  obtenerPorCodigo(codigo: string): Observable<EmpresaResponse> {
    return this.http.get<EmpresaResponse>(`${this.apiUrl}/codigo/${codigo}`);
  }
  
  obtenerPorRuc(ruc: string): Observable<EmpresaResponse> {
    return this.http.get<EmpresaResponse>(`${this.apiUrl}/ruc/${ruc}`);
  }
  
  // ========== ESTADOS ==========
  activar(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activar`, {});
  }
  
  desactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/desactivar`, {});
  }
  
  // ========== VALIDACIONES ==========
  validarCodigo(codigo: string): Observable<{existe: boolean, mensaje: string}> {
    return this.http.get<{existe: boolean, mensaje: string}>(`${this.apiUrl}/validar/codigo/${codigo}`);
  }
  
  validarRuc(ruc: string): Observable<{existe: boolean, mensaje: string}> {
    return this.http.get<{existe: boolean, mensaje: string}>(`${this.apiUrl}/validar/ruc/${ruc}`);
  }
  
  puedeEliminar(id: number): Observable<{puedeEliminar: boolean, mensaje: string}> {
    return this.http.get<{puedeEliminar: boolean, mensaje: string}>(`${this.apiUrl}/${id}/puede-eliminar`);
  }
  
  // ========== ESTADÍSTICAS ==========
  obtenerEstadisticas(): Observable<EmpresaEstadisticas> {
    return this.http.get<EmpresaEstadisticas>(`${this.apiUrl}/contadores`);
  }
  
  obtenerEstadisticasPorEstado(): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.apiUrl}/estadisticas/estado-operativo`);
  }
  
  // ========== CONSULTA ESPECIAL ==========
  puedeOperar(id: number): Observable<{puedeOperar: boolean, mensaje: string}> {
    return this.http.get<{puedeOperar: boolean, mensaje: string}>(`${this.apiUrl}/${id}/puede-operar`);
  }
  
  tieneVigenciaActiva(id: number): Observable<{vigenciaActiva: boolean, mensaje: string}> {
    return this.http.get<{vigenciaActiva: boolean, mensaje: string}>(`${this.apiUrl}/${id}/vigencia-activa`);
  }
  
  diasRestantesVigencia(id: number): Observable<{diasRestantes: number, estadoVigencia: string}> {
    return this.http.get<{diasRestantes: number, estadoVigencia: string}>(`${this.apiUrl}/${id}/dias-restantes-vigencia`);
  }
  
  // ========== SELECTORS ==========
  obtenerParaSelector(): Observable<Array<{id: number, nombre: string, ruc: string}>> {
    return this.http.get<Array<{id: number, nombre: string, ruc: string}>>(`${this.apiUrl}/selector`);
  }
}
