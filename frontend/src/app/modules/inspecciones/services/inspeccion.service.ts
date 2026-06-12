import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

// DTOs públicos
export interface InspeccionPublicaDTO {
  idInspeccion: number;
  codigo: string;
  fechaProgramada: string | Date;
  hora: string;
  lugar: string;
  empresaNombre: string;
  numeroUnidades: number;
}

export interface VehiculoDTO {
  identificador?: string;
  placa?: string;
}

export interface InspeccionResponse {
  idInspeccion: number;
  codigo: string;
  fechaProgramada: Date;
  hora: string;
  lugar: string;
  estado: string;
  resultadoGeneral?: string;
  observacionesGenerales?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  codigoGrupo?: string;
  // Relaciones
  empresaId?: number;
  empresaNombre?: string;
  empresaRuc?: string;
  empresaDireccion?: string;
  empresaTelefono?: string;
  gerenteNombre?: string;
  gerenteDni?: string; // DNI del gerente
  inspectorId?: number;
  inspectorNombre?: string;
  vehiculoId?: number;
  vehiculoPlaca?: string;
  // Instancias
  instancias?: {
    idInstancia: number;
    identificador: string;
    codigoRut: string;
    tramiteId: number;
    estadoInstancia: string;
    placa?: string;
    fechaInspeccion?: string;
    observaciones?: string;
    fichaId?: number;
    fichaResultado?: string;
    fichaEstado?: boolean;
  }[];
}

export interface InspeccionInstanciaResponse {
  idInspeccionInstancia?: number;
  idInstancia: number;
  tramiteId: number;
  identificador: string;
  codigoRut?: string;
  estadoInstancia: string;
  placa?: string;
  observaciones?: string;
  fechaInspeccion?: string | Date;
  fichaId?: number;
  fichaResultado?: string;
  fichaEstado?: boolean;
}

export interface BloqueInspeccionDTO {
  idTramite: number;
  empresaNombre: string;
  estado: string;
  totalInstancias: number;
  count: number;
  inspecciones: InspeccionResponse[];
}

export interface InspeccionCreateRequest {
  instanciasTramiteIds: number[];
  fechaProgramada: string;
  hora: string;
  lugar: string;
  observacionesGenerales?: string;
  codigoGrupo?: string;
}

export interface InspeccionRezagadaRequest {
  instanciaTramiteId: number;
  fechaProgramada: string;
  hora: string;
  lugar: string;
  observaciones?: string;
  vehiculosIds: number[];
}

export interface InspeccionIniciarRequest {
  usuarioInspectorId?: number;
  fechaInspeccion?: string | Date;
}

export interface InspeccionTerminarRequest {
  resultadoGeneral?: string;
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
   seccion?: string;
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

    listarPorBloque(): Observable<BloqueInspeccionDTO[]> {
      return this.http.get<BloqueInspeccionDTO[]>(`${this.apiUrl}/por-bloque`);
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

    crearConInstancias(data: {
      instanciasTramiteIds: number[];
      fechaProgramada: string;
      horaProgramada: string;
      lugar: string;
      observaciones?: string;
      codigoGrupo?: string;
      empresaId?: number;
    }): Observable<InspeccionResponse> {
      return this.http.post<InspeccionResponse>(`${this.apiUrl}/con-instancias`, data);
    }

   actualizar(id: number, inspeccion: Partial<InspeccionCreateRequest>): Observable<InspeccionResponse> {
     return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}`, inspeccion);
   }

   iniciar(id: number, request: InspeccionIniciarRequest): Observable<InspeccionResponse> {
     return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/iniciar`, request);
   }

   terminar(id: number, request: InspeccionTerminarRequest): Observable<InspeccionResponse> {
     return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/terminar`, request);
   }

   eliminar(id: number): Observable<void> {
     return this.http.delete<void>(`${this.apiUrl}/${id}`);
   }

   obtenerConInstancias(id: number): Observable<InspeccionResponse> {
     return this.http.get<InspeccionResponse>(`${this.apiUrl}/${id}/con-instancias`);
   }

   agregarInstancias(inspeccionId: number, instanciasIds: number[]): Observable<InspeccionResponse> {
     return this.http.post<InspeccionResponse>(`${this.apiUrl}/${inspeccionId}/instancias`, { instanciasIds });
   }

   removerInstancia(inspeccionId: number, instanciaId: number): Observable<void> {
     return this.http.delete<void>(`${this.apiUrl}/${inspeccionId}/instancias/${instanciaId}`);
   }

   // ========== PROGRAMACIÓN ==========
   reprogramar(id: number, nuevaFecha: Date, nuevaHora: string): Observable<InspeccionResponse> {
     return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}/reprogramar`, {
       fechaProgramada: nuevaFecha,
       horaProgramada: nuevaHora
     });
   }

   cambiarEstado(id: number, estado: string): Observable<InspeccionResponse> {
     return this.http.put<InspeccionResponse>(`${this.apiUrl}/${id}`, { estado });
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
    seccion?: string;
  }): Observable<ParametroInspeccionResponse> {
    return this.http.post<ParametroInspeccionResponse>(`${this.parametrosUrl}/ficha/${fichaInspeccionId}`, parametro);
  }

  actualizarParametro(id: number, parametro: {
    parametro?: string;
    observacion?: string;
    tipoEvaluacion?: string;
    seccion?: string;
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

   // ========== INSPECCIONES REZAGADAS ==========
   crearInspeccionRezagada(dto: InspeccionRezagadaRequest): Observable<InspeccionResponse> {
     return this.http.post<InspeccionResponse>(`${this.apiUrl}/rezagadas`, dto);
   }

   // ========== ACCIONES POR BLOQUE ==========
   crearEnBloque(fecha: string, lugar: string, data: {
     instanciasTramiteIds: number[];
     hora: string;
     observacionesGenerales?: string;
     usuarioInspectorId?: number;
   }): Observable<InspeccionResponse> {
     return this.http.post<InspeccionResponse>(`${this.apiUrl}/bloques/${fecha}/${lugar}/inspecciones`, data);
   }

   iniciarBloque(fecha: string, lugar: string, usuarioInspectorId?: number): Observable<InspeccionResponse[]> {
     const body = usuarioInspectorId ? { usuarioInspectorId } : {};
     return this.http.put<InspeccionResponse[]>(`${this.apiUrl}/bloques/${fecha}/${lugar}/iniciar`, body);
   }

    cancelarBloque(fecha: string, lugar: string): Observable<InspeccionResponse[]> {
      return this.http.put<InspeccionResponse[]>(`${this.apiUrl}/bloques/${fecha}/${lugar}/cancelar`, {});
    }

    // ========== INSTANCIAS DISPONIBLES ==========
   listarInstanciasDisponibles(tramiteId: number, inspeccionId?: number): Observable<InspeccionInstanciaResponse[]> {
      const params: any = {};
      if (inspeccionId !== undefined) {
        params.inspeccionId = inspeccionId;
      }
      return this.http.get<InspeccionInstanciaResponse[]>(`${this.apiUrl}/tramite/${tramiteId}/instancias-disponibles`, { params });
    }

    // ========== PÚBLICO ==========
    listarInspeccionesPublicas(
      fechaDesde?: string,
      fechaHasta?: string,
      empresa?: string
    ): Observable<InspeccionPublicaDTO[]> {
      const params: any = {};
      if (fechaDesde) params.fechaDesde = fechaDesde;
      if (fechaHasta) params.fechaHasta = fechaHasta;
      if (empresa) params.empresa = empresa;

      return this.http.get<InspeccionPublicaDTO[]>(`${this.apiUrl}/publico`, { params });
    }

    obtenerVehiculosPorInspeccion(inspeccionId: number): Observable<VehiculoDTO[]> {
      return this.http.get<VehiculoDTO[]>(`${this.apiUrl}/${inspeccionId}/vehiculos`);
    }

    replicarFormatoEnInspeccion(inspeccionId: number, fichaOrigenId: number): Observable<void> {
      const params = new HttpParams().set('fichaOrigenId', fichaOrigenId.toString());
      return this.http.post<void>(`${this.apiUrl}/${inspeccionId}/replicar-formato`, null, { params });
    }
  }
