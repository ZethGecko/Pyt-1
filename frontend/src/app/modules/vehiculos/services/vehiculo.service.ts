import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  tipoTransporteId: number;
  tipoTransporteNombre?: string;
  categoriaTransporteId: number;
  categoriaTransporteNombre?: string;
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
  tipoTransporteId: number;
  categoriaTransporteId: number;
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
  tipoTransporteId?: number;
  categoriaTransporteId?: number;
  empresaId?: number;
  estado?: string;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;
  
  constructor(private http: HttpClient) {}
  
  // ========== CRUD ==========
  obtener(id: number): Observable<VehiculoResponse> {
    return this.http.get<VehiculoResponse>(`${this.apiUrl}/${id}`);
  }
  
  listarTodos(): Observable<VehiculoResponse[]> {
    return this.http.get<VehiculoResponse[]>(this.apiUrl);
  }
  
  listarPorEmpresa(empresaId: number): Observable<VehiculoResponse[]> {
    return this.http.get<VehiculoResponse[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }
  
  listarHabilitados(): Observable<VehiculoResponse[]> {
    return this.http.get<VehiculoResponse[]>(`${this.apiUrl}/habilitados`);
  }
  
  crear(vehiculo: VehiculoCreateRequest): Observable<VehiculoResponse> {
    return this.http.post<VehiculoResponse>(this.apiUrl, vehiculo);
  }
  
  actualizar(id: number, vehiculo: VehiculoUpdateRequest): Observable<VehiculoResponse> {
    return this.http.put<VehiculoResponse>(`${this.apiUrl}/${id}`, vehiculo);
  }
  
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // ========== BÚSQUEDA ==========
  buscar(termino: string): Observable<VehiculoResponse[]> {
    return this.http.get<VehiculoResponse[]>(`${this.apiUrl}/buscar`, {
      params: new HttpParams().set('q', termino)
    });
  }
  
  obtenerPorPlaca(placa: string): Observable<VehiculoResponse | null> {
    return this.http.get<VehiculoResponse | null>(`${this.apiUrl}/placa/${placa}`);
  }
  
  // ========== ESTADOS ==========
  habilitar(id: number): Observable<VehiculoResponse> {
    return this.http.put<VehiculoResponse>(`${this.apiUrl}/${id}/habilitar`, {});
  }
  
  deshabilitar(id: number): Observable<VehiculoResponse> {
    return this.http.put<VehiculoResponse>(`${this.apiUrl}/${id}/deshabilitar`, {});
  }
  
  // ========== UTILIDADES ==========
  existeConPlaca(placa: string): Observable<{existe: boolean}> {
    return this.http.get<{existe: boolean}>(`${this.apiUrl}/verificar/existe-placa/${placa}`);
  }
}
