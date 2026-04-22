import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TipoTramiteSolicitantePermitido {
  id: number;
  tipoTramiteId: number;
  tipoSolicitante: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  tipoTramite?: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export interface TipoTramiteSolicitanteResponse {
  content: TipoTramiteSolicitantePermitido[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class TipoTramiteSolicitanteService {
  private apiUrl = `${environment.apiUrl}/tipo-tramite-solicitante-permitido`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<TipoTramiteSolicitanteResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<TipoTramiteSolicitanteResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<TipoTramiteSolicitantePermitido> {
    return this.http.get<TipoTramiteSolicitantePermitido>(`${this.apiUrl}/${id}`);
  }

  getByTipoTramite(tipoTramiteId: number): Observable<TipoTramiteSolicitantePermitido[]> {
    return this.http.get<TipoTramiteSolicitantePermitido[]>(`${this.apiUrl}/tipo-tramite/${tipoTramiteId}`);
  }

  getBySolicitante(solicitanteId: number): Observable<TipoTramiteSolicitantePermitido[]> {
    return this.http.get<TipoTramiteSolicitantePermitido[]>(`${this.apiUrl}/solicitante/${solicitanteId}`);
  }

  create(asociacion: Partial<TipoTramiteSolicitantePermitido>): Observable<TipoTramiteSolicitantePermitido> {
    return this.http.post<TipoTramiteSolicitantePermitido>(this.apiUrl, asociacion);
  }

  createMultiple(tipoTramiteId: number, solicitanteIds: number[]): Observable<TipoTramiteSolicitantePermitido[]> {
    return this.http.post<TipoTramiteSolicitantePermitido[]>(`${this.apiUrl}/multiple/${tipoTramiteId}`, solicitanteIds);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== OPERACIONES DE ESTADO ==========
  activar(tipoTramiteId: number, tipoSolicitante: string): Observable<TipoTramiteSolicitantePermitido> {
    return this.http.put<TipoTramiteSolicitantePermitido>(
      `${this.apiUrl}/activar`,
      {},
      {
        params: new HttpParams()
          .set('tipoTramiteId', tipoTramiteId.toString())
          .set('tipoSolicitante', tipoSolicitante)
      }
    );
  }

  desactivar(tipoTramiteId: number, tipoSolicitante: string): Observable<TipoTramiteSolicitantePermitido> {
    return this.http.put<TipoTramiteSolicitantePermitido>(
      `${this.apiUrl}/desactivar`,
      {},
      {
        params: new HttpParams()
          .set('tipoTramiteId', tipoTramiteId.toString())
          .set('tipoSolicitante', tipoSolicitante)
      }
    );
  }
}
