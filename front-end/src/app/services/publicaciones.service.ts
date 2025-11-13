import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/publicaciones`;

  getPublicaciones(
    limit: number,
    offset: number,
    orden: 'fecha' | 'likes',
    autorId?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('orden', orden);

    if (autorId) {
      params = params.set('autorId', autorId);
    }

    return this.http.get(this.apiUrl, { params });
  }

  like(publicacionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${publicacionId}/like`, {});
  }

  unlike(publicacionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${publicacionId}/like`);
  }

  delete(publicacionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${publicacionId}`);
  }
}