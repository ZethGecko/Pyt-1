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
  departamentoActualNombre?: string; // Campo plano desde la proyección
  usuarioRegistraNombre?: string;
}

export interface SeguimientoCompleto {
  tramite: any;
  historial: any[];
  documentos: any[];
  revisiones: any[]; // Revisiones de requisitos (incluye documentos y exámenes)
  inscripciones: any[]; // Lista de inscripciones de exámenes asociadas al trámite
}

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Buscar trámites enriquecidos por término (incluye departamento)
  buscarTramites(termino: string): Observable<TramiteListado[]> {
    return this.http.get<TramiteListado[]>(
      `${this.apiUrl}/tramites/buscar/enriquecidos?termino=${encodeURIComponent(termino)}`
    );
  }

   // Obtener todos los trámites enriquecidos
   listarTodos(): Observable<TramiteListado[]> {
     return this.http.get<TramiteListado[]>(`${this.apiUrl}/tramites/enriquecidos`);
   }

   // Obtener seguimiento completo por código RUT (incluye revisiones)
   obtenerSeguimientoCompleto(codigoRUT: string): Observable<SeguimientoCompleto> {
     return this.http.get<SeguimientoCompleto>(`${this.apiUrl}/tramites/publico/seguimiento/${encodeURIComponent(codigoRUT)}`);
   }

   // Formatear fecha para mostrar
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
