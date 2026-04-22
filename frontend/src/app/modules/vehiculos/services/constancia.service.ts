import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Constancia {
  idConstancia: number;
  placa: string;
  fecha: string;
  vehiculoId: number;
  tucId?: number;
  vehiculo?: {
    idVehiculo: number;
    placa: string;
  };
  tuc?: {
    idTuc: number;
    numero: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConstanciaService {
  private apiUrl = `${environment.apiUrl}/constancia`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Constancia[]> {
    return this.http.get<Constancia[]>(this.apiUrl);
  }

  getById(id: number): Observable<Constancia> {
    return this.http.get<Constancia>(`${this.apiUrl}/${id}`);
  }

  getByPlaca(placa: string): Observable<Constancia[]> {
    const params = new HttpParams().set('placa', placa);
    return this.http.get<Constancia[]>(`${this.apiUrl}/search`, { params });
  }

  getByVehiculo(vehiculoId: number): Observable<Constancia[]> {
    return this.http.get<Constancia[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`);
  }

  create(constancia: Partial<Constancia>): Observable<Constancia> {
    return this.http.post<Constancia>(this.apiUrl, constancia);
  }

  update(id: number, constancia: Partial<Constancia>): Observable<Constancia> {
    return this.http.put<Constancia>(`${this.apiUrl}/${id}`, constancia);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
