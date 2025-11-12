import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private authService = inject(Auth);
  private router = inject(Router);
  nombre = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(15),
  ]);
  apellido = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(15),
  ]);
  nombreUsuario = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(20),
  ]);
  descripcion = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(30),
  ]);
  fechaNacimiento = new FormControl('', [
    Validators.required,
  ]);
  correo = new FormControl('', [
    Validators.required, 
    Validators.email
  ]);
  contrasenia = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$')
  ]);
  repetirContrasenia = new FormControl('', [
    Validators.required, 
    Validators.minLength(8),
    Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'),
    this.validarContrasenias
  ]);
  // foto = new FormControl('', [
  //   Validators.required,
  // ]);

  
  formulario = new FormGroup({
    nombre: this.nombre,
    apellido: this.apellido,
    correo: this.correo,
    nombreUsuario: this.nombreUsuario,
    fechaNacimiento: this.fechaNacimiento,
    contrasenia: this.contrasenia,
    repetirContrasenia : this.repetirContrasenia,
    descripcion : this.descripcion,
    //foto: this.foto,
  });

  ngOnInit() {
    this.formulario.valueChanges.subscribe((value) => {
      console.log(value);
      console.log(this.formulario.controls);
    });

    this.formulario.statusChanges.subscribe((formControlStatus) => {
      console.log(formControlStatus);
    });
    this.contrasenia.valueChanges.subscribe(() => {
      this.repetirContrasenia.updateValueAndValidity();
    });
  }

  enviarFormulario() {

    const { repetirContrasenia, ...registroData } = this.formulario.value;
    console.log('Datos a enviar:', registroData);
    
    //Llamar al método de registro del servicio y suscribirse a la respuesta
    this.authService.registro(registroData as any).subscribe({
      next: (response) => {
        this.showSuccessAlert("Registro éxitoso!","Ya puedes iniciar sesión.");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error durante el registro:', err);
        this.showErrorAlert("Error de registro!","No se pudo realizar el registro");
      }
    });
  }

  validarContrasenias(control: AbstractControl): ValidationErrors | null {
    const error = { iguales: true };

    if (!control.value) {
      return null;
    }

    const contrasenia = control.parent?.get('contrasenia')?.value;

    if (!contrasenia) {
      return null;
    }

    if (control.value === contrasenia) {
      return null;
    } else {
      return error;
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
        title: 'Algo salió mal',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }

}
