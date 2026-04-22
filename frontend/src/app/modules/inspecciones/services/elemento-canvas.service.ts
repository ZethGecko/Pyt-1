import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ElementoCanvas {
  id: number;
  fichaInspeccionId: number;
  tipoElemento: string;
  titulo?: string;
  contenido?: string;
  posicionX: number;
  posicionY: number;
  ancho: number;
  alto: number;
  rotacion: number;
  zIndex: number;
  numeroHoja: number;
  estilo?: string;
  parametroInspeccionId?: number;
  parametroInspeccion?: {
    id: number;
    parametro: string;
    observacion?: string;
    valorCampo?: string;
    tipoEvaluacion?: string;
  };
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ElementoCanvasCreateRequest {
  tipoElemento: string;
  titulo?: string;
  contenido?: string;
  posicionX: number;
  posicionY: number;
  ancho: number;
  alto: number;
  rotacion: number;
  zIndex: number;
  numeroHoja: number;
  estilo?: string;
  parametroInspeccionId?: number;
}

export interface ElementoCanvasUpdateRequest {
  posicionX?: number;
  posicionY?: number;
  ancho?: number;
  alto?: number;
  rotacion?: number;
  zIndex?: number;
  estilo?: string;
  titulo?: string;
  contenido?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElementoCanvasService {
  private apiUrl = `${environment.apiUrl}/elemento-canvas`;

  constructor(private http: HttpClient) {}

  obtenerElementosPorFicha(fichaId: number): Observable<ElementoCanvas[]> {
    return this.http.get<ElementoCanvas[]>(`${this.apiUrl}/ficha/${fichaId}`);
  }

  crearElemento(fichaId: number, elemento: ElementoCanvasCreateRequest): Observable<ElementoCanvas> {
    return this.http.post<ElementoCanvas>(`${this.apiUrl}/ficha/${fichaId}`, elemento);
  }

  actualizarElemento(elementoId: number, elemento: ElementoCanvasUpdateRequest): Observable<ElementoCanvas> {
    return this.http.put<ElementoCanvas>(`${this.apiUrl}/${elementoId}`, elemento);
  }

  eliminarElemento(elementoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${elementoId}`);
  }

  eliminarTodosLosElementos(fichaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ficha/${fichaId}`);
  }

  reordenarElementos(fichaId: number, elementosOrdenados: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/ficha/${fichaId}/reordenar`, elementosOrdenados);
  }
}