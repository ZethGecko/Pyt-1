import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Formato {
  id: number;
  descripcion: string;
  archivoRuta: string;
}

export interface FormatoCreateRequest {
  descripcion: string;
}

export interface FormatoUpdateRequest {
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormatoService {
  private apiUrl = `${environment.apiUrl}/formatos`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Formato[]> {
    return this.http.get<Formato[]>(this.apiUrl);
  }

  getById(id: number): Observable<Formato> {
    return this.http.get<Formato>(`${this.apiUrl}/${id}`);
  }

  upload(archivo: File, descripcion: string): Observable<Formato> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('descripcion', descripcion);
    return this.http.post<Formato>(`${this.apiUrl}/upload`, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
