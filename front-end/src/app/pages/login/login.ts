import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private auth = inject(Auth);

  correo = new FormControl('', [
    Validators.required, 
    Validators.email
  ]);
  contrasenia = new FormControl('', [
    Validators.required,
    Validators.minLength(8)
  ]);

  formulario = new FormGroup({
    correo: this.correo,
    contrasenia: this.contrasenia,
  });

  get correoControl() {
    return this.formulario.get('correo')!;
  }

  get contraseniaControl() {
    return this.formulario.get('contrasenia')!;
  }

  

  iniciarSesion() {
  if (this.formulario.valid) {
   const { correo, contrasenia } = this.formulario.value;
      const credenciales = { correo: correo!, contrasenia: contrasenia! };
   
      // El componente se suscribe UNA SOLA VEZ
   this.auth.logueo(credenciales).subscribe({
        next: (respuesta: any) => {
          // Y el componente hace TODO lo que tenga que pasar
          
          // 1. Imprime en consola
          console.log(respuesta); 
          
          // 2. Guarda el token
          localStorage.setItem('token', respuesta.token);

          // 3. Muestra alerta de éxito
          this.showSuccessAlert("¡Ingreso exitoso!", "Bienvenido a nuestra Red Social");

          // 4. Navega
          this.router.navigate(["/perfil"]);
        },
        error: (err) => {
          console.error("Error en el inicio de sesión:", err);
          this.showErrorAlert("ERROR en Logueo!","Usuario o contraseña incorrectos");
        }
      });
  }
  
}
  
  private showSuccessAlert(title:string,message: string) {
        return Swal.fire({
          title: title,
          text: message,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    private showErrorAlert(title:string, message: string) {
        return Swal.fire({
          title: title,
          text: message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }

}
