import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
//import { AuthService } from '../../services/auth';

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

 
  
  
  async iniciarSesion() {
    if (this.formulario.valid) {
      this.auth.logueo({ usuario: 'agus', pasword: '123' });
      //const { correo, contrasenia } = this.formulario.value;
      
      this.showSuccessAlert("¡Ingreso exitoso!");
      this.router.navigate(["/perfil"]);
    
  }
}

  private showSuccessAlert(message: string) {
    return Swal.fire({
      title: 'Ingreso exitoso',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

}
