import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { ParametroInspeccion } from './ficha-inspeccion.service';

@Injectable({ providedIn: 'root' })
export class ParametrosInspeccionService {
  private apiUrl = `${environment.apiUrl}/parametros-inspeccion`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ParametroInspeccion[]> {
    return this.http.get<ParametroInspeccion[]>(this.apiUrl);
  }

  obtenerPorFicha(fichaId: number): Observable<ParametroInspeccion[]> {
    return this.http.get<ParametroInspeccion[]>(`${this.apiUrl}/ficha/${fichaId}`);
  }

  crear(parametro: Partial<ParametroInspeccion>): Observable<ParametroInspeccion> {
    return this.http.post<ParametroInspeccion>(this.apiUrl, parametro);
  }

  actualizar(id: number, parametro: Partial<ParametroInspeccion>): Observable<ParametroInspeccion> {
    return this.http.put<ParametroInspeccion>(`${this.apiUrl}/${id}`, parametro);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
