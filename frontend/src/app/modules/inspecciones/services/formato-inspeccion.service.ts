import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CampoFormato {
  id?: number;
  nombre: string;
  seccion: string;
  orden: number;
  tipoEvaluacion?: string;
  obligatorio?: boolean;
}

export interface FormatoInspeccion {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  fechaCreacion?: string;
  tituloPrincipal: string;
  subtituloPrincipal: string;
  tituloSeccionDatosGenerales: string;
  tituloSeccionPlaca: string;
  tituloSeccionPlanLunca: string;
  tituloSeccionLaboratorio: string;
  campos: CampoFormato[];
}

export interface FormatoInspeccionResponse {
  content: FormatoInspeccion[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormatoInspeccionService {
  private apiUrl = `${environment.apiUrl}/formatos-inspeccion`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<FormatoInspeccionResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<FormatoInspeccionResponse>(this.apiUrl, { params });
  }

   getById(id: number): Observable<FormatoInspeccion> {
     return this.http.get<FormatoInspeccion>(`${this.apiUrl}/${id}`);
   }

   getGlobal(): Observable<FormatoInspeccion> {
     return this.http.get<FormatoInspeccion>(`${this.apiUrl}/global`);
   }

   getByInspeccion(inspeccionId: number): Observable<FormatoInspeccion> {
     return this.http.get<FormatoInspeccion>(`${this.apiUrl}/inspeccion/${inspeccionId}`);
   }

  create(formato: Partial<FormatoInspeccion>): Observable<FormatoInspeccion> {
    return this.http.post<FormatoInspeccion>(this.apiUrl, formato);
  }

  update(id: number, formato: Partial<FormatoInspeccion>): Observable<FormatoInspeccion> {
    return this.http.put<FormatoInspeccion>(`${this.apiUrl}/${id}`, formato);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  agregarCampo(formatoId: number, campo: Partial<CampoFormato>): Observable<CampoFormato> {
    return this.http.post<CampoFormato>(`${this.apiUrl}/${formatoId}/campos`, campo);
  }

  actualizarCampo(campoId: number, campo: Partial<CampoFormato>): Observable<CampoFormato> {
    return this.http.put<CampoFormato>(`${this.apiUrl}/campos/${campoId}`, campo);
  }

  eliminarCampo(campoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campos/${campoId}`);
  }

  reordenarCampos(formatoId: number, idsCampos: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${formatoId}/reordenar`, idsCampos);
  }
}
