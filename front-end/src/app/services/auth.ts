import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private httpClient = inject(HttpClient);

  apiUrl = 'http://localhost:3000';

  logueo(usuario: Usuario): Observable<any>{  
    return this.httpClient.post(this.apiUrl + '/auth/login', usuario);
  }
  
}

interface Usuario {
  correo:string;
  contrasenia:string;
}
