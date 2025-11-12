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

  registro(usuario: RegistroUsuario): Observable<any>{  
    return this.httpClient.post(this.apiUrl + '/auth/register', usuario);
  }
  
}

interface Usuario {
  correo:string;
  contrasenia:string;
}

interface RegistroUsuario {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  contrasenia: string;
  fechaNacimiento: string; 
  descripcion: string;
  // Si tuviera el campo 'foto' activo, también debería ir aquí.
}
