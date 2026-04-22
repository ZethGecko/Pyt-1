import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SubcategoriaTUPAC {
  id: number;
  tupacId: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  aplicaPara?: string;
  activo: boolean;
  orden?: number;
  esDefault: boolean;
  tupac?: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export interface SubcategoriaTUPACResponse {
  content: SubcategoriaTUPAC[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaTUPACService {
  private apiUrl = `${environment.apiUrl}/subcategoria-tupac`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 50): Observable<SubcategoriaTUPACResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SubcategoriaTUPACResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<SubcategoriaTUPAC> {
    return this.http.get<SubcategoriaTUPAC>(`${this.apiUrl}/${id}`);
  }

  getByTUPAC(tupacId: number): Observable<SubcategoriaTUPAC[]> {
    return this.http.get<SubcategoriaTUPAC[]>(`${this.apiUrl}/tupac/${tupacId}`);
  }

  getActivas(): Observable<SubcategoriaTUPAC[]> {
    return this.http.get<SubcategoriaTUPAC[]>(`${this.apiUrl}/activas`);
  }

  getDefault(tupacId: number): Observable<SubcategoriaTUPAC> {
    return this.http.get<SubcategoriaTUPAC>(`${this.apiUrl}/tupac/${tupacId}/default`);
  }

  create(subcategoria: Partial<SubcategoriaTUPAC>): Observable<SubcategoriaTUPAC> {
    return this.http.post<SubcategoriaTUPAC>(this.apiUrl, subcategoria);
  }

  createMultiple(tupacId: number, subcategorias: Partial<SubcategoriaTUPAC>[]): Observable<SubcategoriaTUPAC[]> {
    return this.http.post<SubcategoriaTUPAC[]>(`${this.apiUrl}/multiple/${tupacId}`, subcategorias);
  }

  update(id: number, subcategoria: Partial<SubcategoriaTUPAC>): Observable<SubcategoriaTUPAC> {
    return this.http.put<SubcategoriaTUPAC>(`${this.apiUrl}/${id}`, subcategoria);
  }

  toggleActivo(id: number): Observable<SubcategoriaTUPAC> {
    return this.http.patch<SubcategoriaTUPAC>(`${this.apiUrl}/${id}/toggle`, {});
  }

  setDefault(id: number): Observable<SubcategoriaTUPAC> {
    return this.http.patch<SubcategoriaTUPAC>(`${this.apiUrl}/${id}/set-default`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
