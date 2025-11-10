import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

interface Usuario {
  usuario: string;
  pasword: string;
}
@Injectable({
  providedIn: 'root',
})
export class Auth {
  httpClient = Inject(HttpClient);

  apiUrl = 'http://localhost:4200';


  async logueo(usuario: Usuario) {
    const peticion = this.httpClient.post(this.apiUrl + '/auth/login', usuario, {
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    });

    peticion.subscribe((respuesta: any) => {
      console.log(respuesta);

      localStorage.setItem('token', respuesta.token);
    });
  }

  
}
