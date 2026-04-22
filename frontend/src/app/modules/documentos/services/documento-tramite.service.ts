import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DocumentoTramiteResponse {
  id: number;
  tramiteId: number;
  requisitoTUPACId: number;
  requisitoTUPACNombre?: string;
  estado: string;
  obligatorio: boolean;
  esExamen: boolean;
  fechaPresentacion?: Date;
  fechaRevision?: Date;
  archivoUrl?: string;
  observacion?: string;
  notasRevision?: string;
}

export interface DocumentoTramiteCreateRequest {
  tramiteId: number;
  requisitoTUPACId: number;
}

export interface DocumentoTramiteUpdateRequest {
  estado?: string;
  observacion?: string;
  notasRevision?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentoTramiteService {
  private apiUrl = `${environment.apiUrl}/documentos-tramite`;
  
  constructor(private http: HttpClient) {}

  // ========== CRUD ==========
  obtener(id: number): Observable<DocumentoTramiteResponse> {
    return this.http.get<DocumentoTramiteResponse>(`${this.apiUrl}/${id}`);
  }

  obtenerPorTramite(tramiteId: number): Observable<DocumentoTramiteResponse[]> {
    return this.http.get<DocumentoTramiteResponse[]>(`${this.apiUrl}/tramite/${tramiteId}`);
  }

  crear(documento: DocumentoTramiteCreateRequest): Observable<DocumentoTramiteResponse> {
    return this.http.post<DocumentoTramiteResponse>(this.apiUrl, documento);
  }

  actualizar(id: number, documento: DocumentoTramiteUpdateRequest): Observable<DocumentoTramiteResponse> {
    return this.http.put<DocumentoTramiteResponse>(`${this.apiUrl}/${id}`, documento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== ACCIONES ==========
  presentar(id: number, archivo: File): Observable<DocumentoTramiteResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<DocumentoTramiteResponse>(`${this.apiUrl}/${id}/presentar`, formData);
  }

  aprobar(id: number, notas?: string): Observable<DocumentoTramiteResponse> {
    return this.http.put<DocumentoTramiteResponse>(`${this.apiUrl}/${id}/aprobar`, null, {
      params: notas ? new HttpParams().set('notas', notas) : new HttpParams()
    });
  }

  rechazar(id: number, motivo: string): Observable<DocumentoTramiteResponse> {
    return this.http.put<DocumentoTramiteResponse>(`${this.apiUrl}/${id}/rechazar`, null, {
      params: new HttpParams().set('motivo', motivo)
    });
  }

  observar(id: number, observacion: string): Observable<DocumentoTramiteResponse> {
    return this.http.put<DocumentoTramiteResponse>(`${this.apiUrl}/${id}/observar`, null, {
      params: new HttpParams().set('observacion', observacion)
    });
  }

  // ========== NUEVAS FUNCIONALIDADES ==========
  /** Obtiene todos los documentos pendientes de revisión */
  getDocumentosPendientes(): Observable<DocumentoTramiteResponse[]> {
    return this.http.get<DocumentoTramiteResponse[]>(`${this.apiUrl}/pendientes`);
  }

  /** Aprobar documento (con notas opcionales) */
  aprobarDocumento(id: number, notas?: string): Observable<DocumentoTramiteResponse> {
    return this.aprobar(id, notas);
  }

  /** Rechazar documento (con motivo) */
  rechazarDocumento(id: number, motivo: string = 'Rechazado'): Observable<DocumentoTramiteResponse> {
    return this.rechazar(id, motivo);
  }

  /** Obtiene todos los documentos (utilizado para estadísticas) */
  obtenerDocumentos(): Observable<DocumentoTramiteResponse[]> {
    return this.http.get<DocumentoTramiteResponse[]>(`${this.apiUrl}`);
  }

  // ========== UTILIDADES ==========
  obtenerPorEstado(tramiteId: number, estado: string): Observable<DocumentoTramiteResponse[]> {
    return this.http.get<DocumentoTramiteResponse[]>(`${this.apiUrl}/tramite/${tramiteId}/estado/${estado}`);
  }

  obtenerPorExamen(tramiteId: number): Observable<DocumentoTramiteResponse[]> {
    return this.http.get<DocumentoTramiteResponse[]>(`${this.apiUrl}/tramite/${tramiteId}/examenes`);
  }

  puedePresentar(id: number): Observable<{puede: boolean}> {
    return this.http.get<{puede: boolean}>(`${this.apiUrl}/${id}/puede-presentar`);
  }
}
