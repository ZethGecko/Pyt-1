import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RutaBusqueda {
  id: number;
  nombre: string;
  distancia: number;
  duracion: number;
  empresa: {
    id: number;
    nombre: string;
    logo: string;
  };
  puntos: {
    latitud: number;
    longitud: number;
  }[];
}

export interface BusquedaRutasRequest {
  ubicacionActual?: {
    latitud: number;
    longitud: number;
  };
  rutaPartida?: {
    latitud: number;
    longitud: number;
  };
  destino?: {
    latitud: number;
    longitud: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BusquedaRutasService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  buscarRutas(request: BusquedaRutasRequest): Observable<RutaBusqueda[]> {
    return this.http.post<RutaBusqueda[]>(`${this.apiUrl}/rutas/buscar`, request);
  }

  obtenerEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresas`);
  }

  obtenerPuntosGeograficos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/puntos-geograficos`);
  }
}