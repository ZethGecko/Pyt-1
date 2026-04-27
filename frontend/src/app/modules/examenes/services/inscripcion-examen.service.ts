import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface InscripcionExamen {
  id: number;
  persona: PersonaNatural;
  grupoPresentacion: GrupoPresentacion;
  nota?: number;
  resultado?: string;
  observaciones?: string;
  fechaInscripcion: Date;
  estado: string;
  pagado?: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  activo: boolean;
}

export interface PersonaNatural {
  id: number;
  nombres: string;
  apellidos: string;
  dni: number;
  fechaNacimiento?: Date;
  genero?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  activo: boolean;
  observaciones?: string;
}

export interface GrupoPresentacion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  fechaPresentacion: Date;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  inscritos: number;
  estado: string;
  tipoExamen: string;
  resultadoPublicado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InscripcionExamenRequest {
  dni: number;
  grupoPresentacionId: number;
  codigoRUT: string;
  tipoTramite: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: Date;
  genero?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  nota?: number;
  resultado?: string;
  observaciones?: string;
  estado?: string;
  pagado?: boolean;
}

export interface InscripcionExamenResponse {
  id: number;
  persona: PersonaNatural;
  grupoPresentacion: GrupoPresentacion;
  nota?: number;
  resultado?: string;
  observaciones?: string;
  fechaInscripcion: Date;
  estado: string;
  creadoEn: Date;
  actualizadoEn: Date;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InscripcionExamenService {
   private apiUrl = 'http://localhost:8080/api/inscripcion-examen';

  constructor(private http: HttpClient) {}

  // Obtener todas las inscripciones
  obtenerTodas(): Observable<InscripcionExamen[]> {
    return this.http.get<InscripcionExamen[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener inscripción por ID
  obtenerPorId(id: number): Observable<InscripcionExamen> {
    return this.http.get<InscripcionExamen>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar inscripciones por DNI de la persona
  buscarPorDni(dni: number): Observable<InscripcionExamen[]> {
    return this.http.get<InscripcionExamen[]>(`${this.apiUrl}/buscar/dni/${dni}`).pipe(
      catchError(this.handleError)
    );
  }

  // Contar inscripciones activas por grupo
  contarPorGrupo(grupoId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar/grupo/${grupoId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Registrar nueva inscripción
  registrarInscripcion(request: InscripcionExamenRequest): Observable<InscripcionExamen> {
    return this.http.post<InscripcionExamen>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

   // Actualizar pago y observaciones de una inscripción (NO modifica estado/resultado)
   actualizarResultadoInscripcion(id: number, data: { pagado: boolean; observaciones?: string }): Observable<InscripcionExamen> {
     return this.http.put<InscripcionExamen>(`${this.apiUrl}/${id}`, data).pipe(
       catchError(this.handleError)
     );
   }

   // Cambiar estado de pago
   cambiarPagoInscripcion(id: number, pagado: boolean): Observable<InscripcionExamen> {
     return this.http.put<InscripcionExamen>(`${this.apiUrl}/${id}`, { pagado }).pipe(
       catchError(this.handleError)
     );
   }

   // Aprobar inscripción
   aprobarInscripcion(id: number): Observable<InscripcionExamen> {
     return this.http.put<InscripcionExamen>(`${this.apiUrl}/${id}`, { estado: 'APROBADO' }).pipe(
       catchError(this.handleError)
     );
   }

   // Reprobar inscripción
   reprobarInscripcion(id: number): Observable<InscripcionExamen> {
     return this.http.put<InscripcionExamen>(`${this.apiUrl}/${id}`, { estado: 'REPROBADO' }).pipe(
       catchError(this.handleError)
     );
   }

  // Cancelar inscripción
  cancelarInscripcion(id: number): Observable<InscripcionExamen> {
    return this.http.put<InscripcionExamen>(`${this.apiUrl}/${id}/cancelar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar inscripción
  eliminarInscripcion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar con filtros
  buscarConFiltros(params: {
    grupoId?: number;
    dni?: number;
    resultado?: string;
  }): Observable<InscripcionExamen[]> {
    let httpParams = new HttpParams();
    if (params.grupoId) httpParams = httpParams.set('grupoId', params.grupoId.toString());
    if (params.dni) httpParams = httpParams.set('dni', params.dni.toString());
    if (params.resultado) httpParams = httpParams.set('resultado', params.resultado);

    return this.http.get<InscripcionExamen[]>(`${this.apiUrl}/buscar`, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar inscripción (genérico: estado, pago, observaciones, etc.)
  actualizarInscripcion(id: number, request: Partial<InscripcionExamenRequest>): Observable<InscripcionExamen> {
    return this.http.put<InscripcionExamen>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en InscripcionExamenService:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de inscripciones'));
  }
}