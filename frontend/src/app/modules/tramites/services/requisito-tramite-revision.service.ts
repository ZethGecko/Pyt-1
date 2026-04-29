import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthStateService } from 'src/app/core/auth/state/auth.state';

export interface RequisitoRevision {
  id: number;
  tramiteId: number;
  requisitoId: number;
  requisitoNombre?: string;
  esExamen?: boolean;
  estado: string;
  estadoFormateado?: string;
  colorEstado?: string;
  iconoEstado?: string;
  fechaPresentacion?: Date;
  fechaRevision?: Date;
  revisionUsuarioNombre?: string;
  observaciones?: string;
  codigo?: string;
  descripcion?: string;
  tipoDocumento?: string;
  obligatorio: boolean;
  // Format fields (optional)
  formatoId?: number | null;
  formatoDescripcion?: string;
  formatoArchivoRuta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequisitoTramiteRevisionService {
  private apiUrl = `${environment.apiUrl}/documentos-tramite`;
  
  constructor(private http: HttpClient, private authState: AuthStateService) {}
  
  private getCurrentUserId(): number {
    const user = this.authState.currentUser();
    return user ? user.id : 1;
  }

  getDocumentosPorTramite(tramiteId: number): Observable<RequisitoRevision[]> {
    return this.http.get<RequisitoRevision[]>(`${this.apiUrl}/tramite/${tramiteId}`);
  }

   getProyeccionesPorTramite(tramiteId: number): Observable<RequisitoRevision[]> {
     return this.http.get<RequisitoRevision[]>(`${this.apiUrl}/tramite/${tramiteId}/projected`);
   }

   getProyeccionesPorInstancia(instanciaId: number): Observable<RequisitoRevision[]> {
     return this.http.get<RequisitoRevision[]>(`${this.apiUrl}/instancia/${instanciaId}/proyecciones`);
   }

   aprobarDocumento(documentoId: number, datos: { notasRevision?: string }): Observable<any> {
     const params = new HttpParams()
       .set('usuarioId', this.getCurrentUserId().toString())
       .set('observaciones', datos.notasRevision || '');
     return this.http.put(`${this.apiUrl}/${documentoId}/aprobar`, null, { params });
   }

   reprobarDocumento(documentoId: number, datos: { motivo: string }): Observable<any> {
     const params = new HttpParams()
       .set('usuarioId', this.getCurrentUserId().toString())
       .set('motivo', datos.motivo);
     return this.http.put(`${this.apiUrl}/${documentoId}/reprobar`, null, { params });
   }

   observarDocumento(documentoId: number, datos: { observaciones?: string }): Observable<any> {
     const params = new HttpParams()
       .set('usuarioId', this.getCurrentUserId().toString())
       .set('observaciones', datos.observaciones || '');
     return this.http.put(`${this.apiUrl}/${documentoId}/observar`, null, { params });
   }

  asignarParaRevision(documentoId: number, usuarioId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${documentoId}/asignar-revision`, { usuarioAsignadoId: usuarioId });
  }

  actualizarDocumento(documentoId: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${documentoId}`, datos);
  }
}
