import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EvaluacionParametro {
  id: number;
  fichaInspeccionId: number;
  parametroInspeccionId: number;
  cumplimiento: string;
  observacion?: string;
  evidenciaFoto?: string;
  fechaEvaluacion: string;
  usuarioEvaluador?: string;
  fichaInspeccion?: {
    id: number;
    resultado: string;
  };
  parametroInspeccion?: {
    id: number;
    parametro: string;
  };
}

export interface EvaluacionParametroResponse {
  content: EvaluacionParametro[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluacionParametroService {
  private apiUrl = `${environment.apiUrl}/evaluacion-parametro`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EvaluacionParametro[]> {
    return this.http.get<EvaluacionParametro[]>(this.apiUrl);
  }

  getById(id: number): Observable<EvaluacionParametro> {
    return this.http.get<EvaluacionParametro>(`${this.apiUrl}/${id}`);
  }

  getByFichaInspeccion(fichaId: number): Observable<EvaluacionParametro[]> {
    return this.http.get<EvaluacionParametro[]>(`${this.apiUrl}/ficha/${fichaId}`);
  }

  create(evaluacion: Partial<EvaluacionParametro>): Observable<EvaluacionParametro> {
    return this.http.post<EvaluacionParametro>(this.apiUrl, evaluacion);
  }

  createMultiple(fichaId: number, evaluaciones: Partial<EvaluacionParametro>[]): Observable<EvaluacionParametro[]> {
    return this.http.post<EvaluacionParametro[]>(`${this.apiUrl}/multiple/${fichaId}`, evaluaciones);
  }

  update(id: number, evaluacion: Partial<EvaluacionParametro>): Observable<EvaluacionParametro> {
    return this.http.put<EvaluacionParametro>(`${this.apiUrl}/${id}`, evaluacion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
