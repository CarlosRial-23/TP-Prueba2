import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, effect } from '@angular/core'; // Agregamos effect
import { Observable, tap, switchMap, throwError } from 'rxjs'; 
import { environment } from './../../environments/environments';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'; // Importamos Swal

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  apiUrl = environment.apiUrl;
  
  // Variables para el manejo del tiempo de sesión
  private sessionTimer: any;
  //private readonly TIEMPO_ALERTA = 10 * 60 * 1000; 
  private readonly TIEMPO_ALERTA = 3 * 60 * 1000; // 3 minutos en milisegundos

  #currentUser = signal<any | null>(JSON.parse(localStorage.getItem('user_data') || 'null'));
  public currentUser = computed(() => this.#currentUser());

  constructor() {
    
    if (this.currentUser()) {
      this.iniciarTimerSesion();
    }
  }

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
    
      const usuarioPlano = response.usuario || response; 
      
      if (response.token) {
        usuarioPlano.token = response.token;
      }

      localStorage.setItem('user_data', JSON.stringify(usuarioPlano));
      this.#currentUser.set(usuarioPlano);
      
      this.iniciarTimerSesion();
      // ------------------
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
    this.detenerTimerSesion(); // <--- LIMPIAMOS EL TIMER AL SALIR
    localStorage.removeItem('user_data');
    this.#currentUser.set(null);
    this.router.navigate(['/login']);
  }

  registro(usuario: RegistroUsuario): Observable<any>{  
    return this.httpClient.post(this.apiUrl + '/auth/register', usuario).pipe(
      tap((response: any) => {
        localStorage.setItem('user_data', JSON.stringify(response));
        this.#currentUser.set(response);
        this.iniciarTimerSesion(); // <--- INICIAMOS EL TIMER AL REGISTRARSE
      }),
    );
  }

  // --- LÓGICA DE CONTROL DE SESIÓN ---

  private iniciarTimerSesion() {
    this.detenerTimerSesion(); // Limpiamos cualquier timer previo
    console.log('Timer de sesión iniciado (10 min)');

    this.sessionTimer = setTimeout(() => {
      this.mostrarAlertaExpiracion();
    }, this.TIEMPO_ALERTA); 
  }

  private detenerTimerSesion() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private mostrarAlertaExpiracion() {
    Swal.fire({
      title: 'Tu sesión está por expirar',
      text: 'Te quedan 5 minutos. ¿Deseas extender tu sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, extender sesión',
      cancelButtonText: 'Cerrar sesión',
      timer: 5 * 60 * 1000, // El modal se cierra solo a los 5 min (cuando expira el token real)
      timerProgressBar: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.refreshToken();
      } else {
        this.logout();
      }
    });
  }

  private refreshToken() {
    // Llamada al endpoint creado en el backend
    this.httpClient.post(this.apiUrl + '/auth/refresh', {}).subscribe({
      next: (res: any) => {
        // Actualizamos el token en el usuario actual
        const usuarioActual = this.#currentUser();
        if (usuarioActual) {
          const usuarioActualizado = { ...usuarioActual, token: res.token };
          
          // Guardamos en LocalStorage y actualizamos la señal
          localStorage.setItem('user_data', JSON.stringify(usuarioActualizado));
          this.#currentUser.set(usuarioActualizado);
          
          // Reiniciamos el timer por otros 10 minutos
          this.iniciarTimerSesion();
          
          Swal.fire('Sesión extendida', 'Tu sesión ha sido renovada por 15 minutos más.', 'success');
        }
      },
      error: () => {
        this.logout(); // Si falla el refresh, sacamos al usuario
      }
    });
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