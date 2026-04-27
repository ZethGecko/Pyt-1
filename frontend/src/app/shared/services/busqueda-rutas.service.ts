import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface RutaBusqueda {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  distancia: number;
  duracion: number | null;
  estado: string;
  tipo: string;
  empresa: { id: number; nombre: string; ruc: string } | null;
  puntos: { latitud: number; longitud: number }[];
  tipoResultado?: string;
  distanciaCobertura?: number | null;
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

interface RutaBusquedaResultadoBackend {
  idRuta: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  distanciaCalculada: number;
  tiempoEstimadoMinutos: number | null;
  estado: string;
  tipo: string;
  empresaId: number;
  empresaNombre: string;
  empresaRuc: string;
  puntosTramo: { latitud: number; longitud: number }[];
  tipoResultado?: string;
  distanciaCobertura?: number | null;
}

interface Empresa {
  id: number;
  nombre: string;
}

interface PuntoGeografico {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
}

@Injectable({
  providedIn: 'root'
})
export class BusquedaRutasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarRutas(request: BusquedaRutasRequest): Observable<RutaBusqueda[]> {
    const backendRequest = {
      origenLatitud: request.rutaPartida?.latitud || request.ubicacionActual?.latitud,
      origenLongitud: request.rutaPartida?.longitud || request.ubicacionActual?.longitud,
      destinoLatitud: request.destino?.latitud,
      destinoLongitud: request.destino?.longitud
    };

     return this.http
       .post<RutaBusquedaResultadoBackend[]>(`${this.apiUrl}/rutas/buscar`, backendRequest)
       .pipe(
         map(rutasBackend =>
           rutasBackend.map(r => ({
             id: r.idRuta,
             codigo: r.codigo,
             nombre: r.nombre,
             descripcion: r.descripcion,
             distancia: r.distanciaCalculada || 0,
             duracion: r.tiempoEstimadoMinutos || null,
             estado: r.estado,
             tipo: r.tipo,
             empresa: r.empresaId ? {
               id: r.empresaId,
               nombre: r.empresaNombre,
               ruc: r.empresaRuc
             } : null,
             puntos: r.puntosTramo || [],
             tipoResultado: r.tipoResultado,
             distanciaCobertura: r.distanciaCobertura || null
           }))
         )
       );
  }

  obtenerEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresas`);
  }

  obtenerPuntosGeograficos(): Observable<PuntoGeografico[]> {
    return this.http.get<PuntoGeografico[]>(`${this.apiUrl}/puntos`);
  }
}
