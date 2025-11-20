import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/estadisticas`;

  private getParams(desde: string, hasta: string) {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }

  getPublicacionesPorUsuario(desde: string, hasta: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/publicaciones-por-usuario`, { params: this.getParams(desde, hasta) });
  }

  getComentariosTotales(desde: string, hasta: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/comentarios-totales`, { params: this.getParams(desde, hasta) });
  }

  getComentariosPorPublicacion(desde: string, hasta: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params: this.getParams(desde, hasta) });
  }
}