import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface VehiculoResponse {
  id: number;
  placa: string;
  fechaFabricacion: number;
  marca: string;
  modelo: string;
  color: string;
  categoria?: string;
  pesoNeto?: number;
  subtipoTransporteId: number;
  subtipoTransporteNombre?: string;
  empresa?: {
    id: number;
    nombre: string;
    ruc: string;
  };
  activo: boolean;
  estadoTecnico: string;
  fechaHabilitacion?: Date;
  fechaVencimientoTUC?: Date;
  observaciones?: string;
}

export interface VehiculoCreateRequest {
  placa: string;
  fechaFabricacion: number;
  marca: string;
  modelo: string;
  color: string;
  categoria?: string;
  pesoNeto?: number;
  subtipoTransporteId: number;
  empresaId?: number;
  observaciones?: string;
}

export interface VehiculoUpdateRequest {
  placa?: string;
  fechaFabricacion?: number;
  marca?: string;
  modelo?: string;
  color?: string;
  categoria?: string;
  pesoNeto?: number;
  subtipoTransporteId?: number;
  empresaId?: number;
  estado?: string;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) {}

  // Método auxiliar para mapear idVehiculo -> id
  private mapearVehiculo(vehiculo: any): VehiculoResponse {
    return {
      ...vehiculo,
      id: vehiculo.idVehiculo
    };
  }

  private mapearVehiculos(vehiculos: any[]): VehiculoResponse[] {
    return vehiculos.map((v: any) => this.mapearVehiculo(v));
  }

  // ========== CRUD ==========
  obtener(id: number): Observable<VehiculoResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((resp: any) => this.mapearVehiculo(resp))
    );
  }

  listarTodos(): Observable<VehiculoResponse[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((resp: any[]) => this.mapearVehiculos(resp))
    );
  }

  listarPorEmpresa(empresaId: number): Observable<VehiculoResponse[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresa/${empresaId}`).pipe(
      map((resp: any[]) => this.mapearVehiculos(resp))
    );
  }

  listarHabilitados(): Observable<VehiculoResponse[]> {
    return this.http.get<any[]>(`${this.apiUrl}/habilitados`).pipe(
      map((resp: any[]) => this.mapearVehiculos(resp))
    );
  }

  crear(vehiculo: VehiculoCreateRequest): Observable<VehiculoResponse> {
    return this.http.post<any>(this.apiUrl, vehiculo).pipe(
      map((resp: any) => this.mapearVehiculo(resp))
    );
  }

  actualizar(id: number, vehiculo: VehiculoUpdateRequest): Observable<VehiculoResponse> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, vehiculo).pipe(
      map((resp: any) => this.mapearVehiculo(resp))
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<VehiculoResponse[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar`, {
      params: new HttpParams().set('q', termino)
    }).pipe(
      map((resp: any[]) => this.mapearVehiculos(resp))
    );
  }

  obtenerPorPlaca(placa: string): Observable<VehiculoResponse | null> {
    return this.http.get<any>(`${this.apiUrl}/placa/${placa}`).pipe(
      map((resp: any) => resp ? this.mapearVehiculo(resp) : null)
    );
  }

  // ========== ESTADOS ==========
  habilitar(id: number): Observable<VehiculoResponse> {
    return this.http.put<any>(`${this.apiUrl}/${id}/habilitar`, {}).pipe(
      map((resp: any) => this.mapearVehiculo(resp))
    );
  }

  deshabilitar(id: number): Observable<VehiculoResponse> {
    return this.http.put<any>(`${this.apiUrl}/${id}/deshabilitar`, {}).pipe(
      map((resp: any) => this.mapearVehiculo(resp))
    );
  }

  // ========== UTILIDADES ==========
  existeConPlaca(placa: string): Observable<{existe: boolean}> {
    return this.http.get<{existe: boolean}>(`${this.apiUrl}/verificar/existe-placa/${placa}`);
  }
}
