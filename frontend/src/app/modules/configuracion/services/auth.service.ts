import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AuthConfig {
  configKey: string;
  configValue: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AuthConfig[]> {
    return this.http.get<AuthConfig[]>(this.apiUrl);
  }

  getByKey(key: string): Observable<AuthConfig> {
    return this.http.get<AuthConfig>(`${this.apiUrl}/${key}`);
  }

  create(config: Partial<AuthConfig>): Observable<AuthConfig> {
    return this.http.post<AuthConfig>(this.apiUrl, config);
  }

  update(key: string, config: Partial<AuthConfig>): Observable<AuthConfig> {
    return this.http.put<AuthConfig>(`${this.apiUrl}/${key}`, config);
  }

  delete(key: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${key}`);
  }

  getByDescription(description: string): Observable<AuthConfig[]> {
    let params = new HttpParams();
    if (description) {
      params = params.set('description', description);
    }
    return this.http.get<AuthConfig[]>(`${this.apiUrl}/search`, { params });
  }
}
