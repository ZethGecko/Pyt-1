import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class PersonaNaturalService {
   private apiUrl = 'http://localhost:8080/api/personas-naturales';

  constructor(private http: HttpClient) {}

  // Obtener persona por DNI
  obtenerPorDni(dni: number): Observable<PersonaNatural> {
    return this.http.get<PersonaNatural>(`${this.apiUrl}/dni/${dni}`).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar persona por DNI (devuelve null si no existe)
  buscarPorDni(dni: number): Observable<PersonaNatural | null> {
    return this.obtenerPorDni(dni).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return new Observable<PersonaNatural | null>(subscriber => {
            subscriber.next(null);
            subscriber.complete();
          });
        }
        return throwError(() => error);
      })
    );
  }

  // Crear nueva persona
  crear(persona: Partial<PersonaNatural>): Observable<PersonaNatural> {
    return this.http.post<PersonaNatural>(this.apiUrl, persona).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener todas las personas
  obtenerTodas(): Observable<PersonaNatural[]> {
    return this.http.get<PersonaNatural[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar por término
  buscarPorTermino(termino: string): Observable<PersonaNatural[]> {
    let params = new HttpParams();
    if (termino) {
      params = params.set('termino', termino);
    }
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/buscar/termino`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar por nombre completo
  buscarPorNombreCompleto(nombreCompleto: string): Observable<PersonaNatural[]> {
    let params = new HttpParams();
    if (nombreCompleto) {
      params = params.set('nombreCompleto', nombreCompleto);
    }
    return this.http.get<PersonaNatural[]>(`${this.apiUrl}/buscar/nombre-completo`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en PersonaNaturalService:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de personas naturales'));
  }
}