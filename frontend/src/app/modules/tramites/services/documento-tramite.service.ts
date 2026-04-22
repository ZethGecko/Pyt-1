import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DocumentoTramite, DocumentoTramiteRevisionRequest } from '../models/documento-tramite.model';

export interface DocumentoTramiteResponse {
  content: DocumentoTramite[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoTramiteService {
  private apiUrl = `${environment.apiUrl}/documentos-tramite`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 50): Observable<DocumentoTramiteResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<DocumentoTramiteResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<DocumentoTramite> {
    return this.http.get<DocumentoTramite>(`${this.apiUrl}/${id}`);
  }

  getByTramite(tramiteId: number): Observable<DocumentoTramite[]> {
    return this.http.get<DocumentoTramite[]>(`${this.apiUrl}/tramite/${tramiteId}`);
  }

  // Alias para compatibilidad
  listarPorTramite(tramiteId: number): Observable<DocumentoTramite[]> {
    return this.getByTramite(tramiteId);
  }
  
   // Obtener exámenes por trámite (proyección)
   obtenerExamenesPorTramite(tramiteId: number): Observable<any[]> {
     return this.http.get<any[]>(`${this.apiUrl}/tramite/${tramiteId}/examenes`);
   }

   // Obtener mis documentos asignados
   getMisDocumentos(): Observable<DocumentoTramite[]> {
     return this.http.get<DocumentoTramite[]>(`${this.apiUrl}/mis-documentos`);
   }

  create(documento: Partial<DocumentoTramite>): Observable<DocumentoTramite> {
    return this.http.post<DocumentoTramite>(this.apiUrl, documento);
  }

  update(id: number, documento: Partial<DocumentoTramite>): Observable<DocumentoTramite> {
    return this.http.put<DocumentoTramite>(`${this.apiUrl}/${id}`, documento);
  }

  // Upload document with file (for creating new document with file)
  uploadDocumento(tramiteId: number, requisitoTUPACId: number, file: File): Observable<DocumentoTramite> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post<DocumentoTramite>(`${this.apiUrl}/upload/${tramiteId}/${requisitoTUPACId}`, formData);
  }

  // Present document (upload file to existing document)
  presentar(id: number, file: File): Observable<DocumentoTramite> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post<DocumentoTramite>(`${this.apiUrl}/${id}/presentar`, formData);
  }

  // Update file of existing document
  actualizarArchivo(id: number, file: File): Observable<DocumentoTramite> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post<DocumentoTramite>(`${this.apiUrl}/${id}/actualizar-archivo`, formData);
  }

  revision(id: number, revision: DocumentoTramiteRevisionRequest): Observable<DocumentoTramite> {
    return this.http.patch<DocumentoTramite>(`${this.apiUrl}/${id}/revision`, revision);
  }

  approve(id: number, notasRevision?: string, certificadoNumero?: string): Observable<DocumentoTramite> {
    const params = new HttpParams();
    let currentParams = params;
    if (notasRevision) {
      currentParams = currentParams.set('notas', notasRevision);
    }
    if (certificadoNumero) {
      currentParams = currentParams.set('certificadoNumero', certificadoNumero);
    }
    return this.http.put<DocumentoTramite>(`${this.apiUrl}/${id}/aprobar`, null, { params: currentParams });
  }

  reject(id: number, motivo: string): Observable<DocumentoTramite> {
    const params = new HttpParams().set('motivo', motivo);
    return this.http.put<DocumentoTramite>(`${this.apiUrl}/${id}/reprobar`, null, { params });
  }

  observe(id: number, observacion: string): Observable<DocumentoTramite> {
    const params = new HttpParams().set('observacion', observacion);
    return this.http.put<DocumentoTramite>(`${this.apiUrl}/${id}/observar`, null, { params });
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Assign document for review
  asignarParaRevision(id: number, usuarioId?: number): Observable<DocumentoTramite> {
    const params = usuarioId ? new HttpParams().set('usuarioId', usuarioId.toString()) : new HttpParams();
    return this.http.post<DocumentoTramite>(`${this.apiUrl}/${id}/asignar-revision`, null, { params });
  }

  // Return document for correction
  devolverParaCorreccion(id: number, motivo: string): Observable<DocumentoTramite> {
    const params = new HttpParams().set('motivo', motivo);
    return this.http.put<DocumentoTramite>(`${this.apiUrl}/${id}/devolver-correccion`, null, { params });
  }

  // Validation methods
  puedePresentar(id: number): Observable<{puede: boolean}> {
    return this.http.get<{puede: boolean}>(`${this.apiUrl}/${id}/puede-presentar`);
  }

  puedeRevisar(id: number): Observable<{puede: boolean}> {
    return this.http.get<{puede: boolean}>(`${this.apiUrl}/${id}/puede-revisar`);
  }

  // Statistics
  obtenerEstadisticasPorTramite(tramiteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tramite/${tramiteId}/estadisticas`);
  }

  validarDocumentosParaAprobarTramite(tramiteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tramite/${tramiteId}/puede-aprobar`);
  }

  // Métodos de compatibilidad (aliases)
  obtenerDocumentos(): Observable<DocumentoTramite[]> {
    return this.getAll().pipe(
      map(response => response.content)
    );
  }

  getDocumentosPendientes(): Observable<DocumentoTramite[]> {
    return this.http.get<DocumentoTramite[]>(`${this.apiUrl}/pendientes-revision`);
  }

  aprobarDocumento(id: number): Observable<DocumentoTramite> {
    return this.approve(id);
  }

  rechazarDocumento(id: number, motivo?: string): Observable<DocumentoTramite> {
    return this.reject(id, motivo || '');
  }
}
