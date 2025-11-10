import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
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
  foto = new FormControl('', [
    Validators.required,
  ]);

  
  formulario = new FormGroup({
    nombre: this.nombre,
    apellido: this.apellido,
    correo: this.correo,
    nombreUsuario: this.nombreUsuario,
    fechaNacimiento: this.fechaNacimiento,
    contrasenia: this.contrasenia,
    repetirContrasenia : this.repetirContrasenia,
    descripcion : this.descripcion,
    foto: this.foto,
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
    console.log(this.formulario);
    console.log(this.formulario.value);
    console.log(this.formulario.get('nombre'));
    
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
}
