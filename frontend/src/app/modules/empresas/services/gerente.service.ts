import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface GerenteResponse {
  id: number;
  nombre: string;
  dni: number;
  telefono?: string;
  whatsapp?: string;
  partidaElectronica?: string;
  inicioVigenciaPoder: Date | string;
  finVigenciaPoder?: Date | string;
  activo: boolean;
  observaciones?: string;
  fechaRegistro?: Date | string;
  tienePoderVigente?: boolean;
}

export interface GerenteCreateRequest {
  nombre: string;
  dni: number;
  telefono?: string;
  whatsapp?: string;
  partidaElectronica?: string;
  inicioVigenciaPoder?: Date | string | null;
  finVigenciaPoder?: Date | string | null;
  activo?: boolean;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class GerenteService {
  private apiUrl = `${environment.apiUrl}/gerentes`;

  constructor(private http: HttpClient) {}

  // Listar todos
  listarTodos(): Observable<GerenteResponse[]> {
    return this.http.get<GerenteResponse[]>(this.apiUrl);
  }

  // Listar activos
  listarActivos(): Observable<GerenteResponse[]> {
    return this.http.get<GerenteResponse[]>(`${this.apiUrl}/activos`);
  }

  // Listar gerentes con poder vigente
  listarConPoderVigente(): Observable<GerenteResponse[]> {
    return this.http.get<GerenteResponse[]>(`${this.apiUrl}/con-poder-vigente`);
  }

  // Listar gerentes activos con poder vigente (proyectados - más completo)
  listarProjectedConPoderVigente(): Observable<GerenteResponse[]> {
    return this.http.get<GerenteResponse[]>(`${this.apiUrl}/con-poder-vigente/projected`);
  }

  // Listar disponibles para empresa
  listarDisponiblesParaEmpresa(): Observable<GerenteResponse[]> {
    return this.http.get<GerenteResponse[]>(`${this.apiUrl}/disponibles/para-empresa`);
  }

  // Obtener para selector (dropdown)
  obtenerParaSelector(): Observable<Array<{id: number, nombre: string, dni: number}>> {
    return this.http.get<Array<{id: number, nombre: string, dni: number}>>(`${this.apiUrl}/selector`);
  }

  // Buscar gerentes
  buscar(termino: string): Observable<GerenteResponse[]> {
    return this.http.get<GerenteResponse[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }

  // Obtener por ID
  obtener(id: number): Observable<GerenteResponse> {
    return this.http.get<GerenteResponse>(`${this.apiUrl}/${id}`);
  }

  // Crear - convierte fechas a formato yyyy-MM-dd
  crear(gerente: GerenteCreateRequest): Observable<GerenteResponse> {
    // Convertir fechas a formato yyyy-MM-dd para el backend
    const formatDate = (date: Date | string | null | undefined): string | null => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const data: any = {
      ...gerente,
      inicioVigenciaPoder: formatDate(gerente.inicioVigenciaPoder),
      finVigenciaPoder: formatDate(gerente.finVigenciaPoder)
    };
    return this.http.post<GerenteResponse>(this.apiUrl, data);
  }

  // Actualizar
  actualizar(id: number, gerente: Partial<GerenteCreateRequest>): Observable<GerenteResponse> {
    // Convertir fechas a formato yyyy-MM-dd para el backend
    const formatDate = (date: Date | string | null | undefined): string | null => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const data: any = { ...gerente };
    if (gerente.inicioVigenciaPoder !== undefined) {
      data.inicioVigenciaPoder = formatDate(gerente.inicioVigenciaPoder);
    }
    if (gerente.finVigenciaPoder !== undefined) {
      data.finVigenciaPoder = formatDate(gerente.finVigenciaPoder);
    }
    return this.http.put<GerenteResponse>(`${this.apiUrl}/${id}`, data);
  }

   // Eliminar
   eliminar(id: number): Observable<void> {
     return this.http.delete<void>(`${this.apiUrl}/${id}`);
   }

   // Desactivar gerente
   desactivar(id: number): Observable<GerenteResponse> {
     return this.http.put<GerenteResponse>(`${this.apiUrl}/${id}/desactivar`, {});
   }
   
   // Activar gerente
   activar(id: number): Observable<GerenteResponse> {
     return this.http.put<GerenteResponse>(`${this.apiUrl}/${id}/activar`, {});
   }

  // Validar DNI
  validarDni(dni: number): Observable<{existe: boolean, mensaje: string}> {
    return this.http.get<{existe: boolean, mensaje: string}>(`${this.apiUrl}/validar/dni/${dni}`);
  }

  // Verificar si puede representar empresas
  puedeRepresentarEmpresas(id: number): Observable<{puedeRepresentar: boolean, mensaje: string}> {
    return this.http.get<{puedeRepresentar: boolean, mensaje: string}>(`${this.apiUrl}/${id}/puede-representar-empresas`);
  }
}
