import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InstanciaTramite } from '../models/instancia-tramite.model';
import { DocumentoTramite } from '../../tramites/models/documento-tramite.model';

@Injectable({
  providedIn: 'root'
})
export class InstanciaTramiteService {
  private apiUrl = `${environment.apiUrl}/instancias-tramite`;

  constructor(private http: HttpClient) {}

   listarPorTramite(tramiteId: number): Observable<InstanciaTramite[]> {
     return this.http.get<InstanciaTramite[]>(`${this.apiUrl}/tramite/${tramiteId}`);
   }

   listarTodas(): Observable<InstanciaTramite[]> {
     return this.http.get<InstanciaTramite[]>(`${this.apiUrl}`);
   }

  obtener(id: number): Observable<InstanciaTramite> {
    return this.http.get<InstanciaTramite>(`${this.apiUrl}/${id}`);
  }

  crear(tramiteId: number, data: { identificador: string; descripcion?: string }): Observable<InstanciaTramite> {
    return this.http.post<InstanciaTramite>(`${this.apiUrl}/tramite/${tramiteId}`, data);
  }

  actualizar(id: number, data: Partial<InstanciaTramite>): Observable<InstanciaTramite> {
    return this.http.put<InstanciaTramite>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<{ eliminado: boolean }> {
    return this.http.delete<{ eliminado: boolean }>(`${this.apiUrl}/${id}`);
  }

  obtenerDocumentosDeInstancia(instanciaId: number): Observable<DocumentoTramite[]> {
    return this.http.get<DocumentoTramite[]>(`${this.apiUrl}/${instanciaId}/documentos`);
  }
}
