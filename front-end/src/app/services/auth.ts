import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from './../../environments/environments';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  apiUrl = environment.apiUrl;

  #currentUser = signal<any | null>(JSON.parse(localStorage.getItem('user_data') || 'null'));
  public currentUser = computed(() => this.#currentUser());

  getToken(): string | null {
    const userData = this.#currentUser();
    return userData ? userData.token : null;
  }

  logueo(usuario: Usuario): Observable<any> {
    return this.httpClient.post(this.apiUrl + '/auth/login', usuario).pipe(
      tap((response: any) => {
        // 3. Al loguear, guardamos la respuesta (que incluye el token)
        localStorage.setItem('user_data', JSON.stringify(response));
        this.#currentUser.set(response);
      }),
    );
  }
  // 4. Método de Logout
  logout() {
    localStorage.removeItem('user_data');
    this.#currentUser.set(null);
    this.router.navigate(['/login']);
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
  urlFoto: string;
}
