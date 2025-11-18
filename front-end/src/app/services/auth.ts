import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap, switchMap, throwError } from 'rxjs'; 
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

  private fetchAndSetFullUser(): Observable<any> {
    return this.httpClient.post(this.apiUrl + '/auth/autorizar', {}).pipe(
      tap((response: any) => {
        
        const token = this.getToken(); 
        const fullUser = { 
            ...response.usuario,
            token: token 
        }; 
        localStorage.setItem('user_data', JSON.stringify(fullUser));
        this.#currentUser.set(fullUser);
      })
    );
  }

  logueo(usuario: Usuario): Observable<any> {
    return this.httpClient.post(this.apiUrl + '/auth/login', usuario).pipe(
      tap((response: any) => {
        localStorage.setItem('user_data', JSON.stringify(response));
        this.#currentUser.set(response);
      }),
      switchMap(() => {
        const token = this.getToken();
        if (token) {
          return this.fetchAndSetFullUser(); 
        }
        return throwError(() => new Error('No se encontró un token después del login.'));
      }),
    );
  }

  logout() {
    localStorage.removeItem('user_data');
    this.#currentUser.set(null);
    this.router.navigate(['/login']);
  }

  registro(usuario: RegistroUsuario): Observable<any>{  
    
    return this.httpClient.post(this.apiUrl + '/auth/register', usuario).pipe(
      tap((response: any) => {
        localStorage.setItem('user_data', JSON.stringify(response));
        this.#currentUser.set(response);
      }),
    );
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