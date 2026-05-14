import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TramiteListado {
  id: number;
  codigoRUT: string;
  estado: string;
  prioridad: string;
  fechaRegistro: string | Date;
  fechaActualizacion: string | Date;
  departamentoActualNombre?: string;
  usuarioRegistraNombre?: string;
  conteoInstancias?: number;
}

export interface InstanciaTramitePublic {
  idInstancia: number;
  identificador: string;
  estado: string;
  fechaCreacion: string;
}

export interface SeguimientoCompleto {
  tramite: any;
  historial: any[];
  documentos: any[];
  revisiones: any[];
  inscripciones: any[];
  instancias?: InstanciaTramitePublic[];
  instanciaSeleccionadaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Buscar trámites enriquecidos por término
  buscarTramites(termino: string): Observable<TramiteListado[]> {
    return this.http.get<TramiteListado[]>(
      `${this.apiUrl}/tramites/buscar/enriquecidos?termino=${encodeURIComponent(termino)}`
    );
  }

  // Obtener todos los trámites enriquecidos
  listarTodos(): Observable<TramiteListado[]> {
    return this.http.get<TramiteListado[]>(`${this.apiUrl}/tramites/enriquecidos`);
  }

  // Obtener seguimiento completo por código RUT (incluye instancias)
  obtenerSeguimientoCompleto(codigoRUT: string, instanciaId?: number): Observable<SeguimientoCompleto> {
    let params = {};
    if (instanciaId !== undefined && instanciaId !== null) {
      params = { instanciaId: instanciaId.toString() };
    }
    return this.http.get<SeguimientoCompleto>(
      `${this.apiUrl}/tramites/publico/seguimiento/${encodeURIComponent(codigoRUT)}`,
      { params }
    );
  }

  // Formatear fecha
  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'No disponible';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
