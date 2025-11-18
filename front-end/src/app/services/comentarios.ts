import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ComentariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comentarios`;

  // Obtener comentarios paginados
  getComentarios(publicacionId: string, limit: number, offset: number): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${this.apiUrl}/${publicacionId}`, { params });
  }

  // Crear comentario
  crear(publicacionId: string, mensaje: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${publicacionId}`, { mensaje });
  }

  // Editar comentario
  editar(comentarioId: string, mensaje: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${comentarioId}`, { mensaje });
  }
}