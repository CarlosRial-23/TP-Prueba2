import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { Supabase } from '../../services/supabase';


@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private authService = inject(Auth);
  private router = inject(Router);
  protected readonly title = signal('client');
  supaService = inject(Supabase);
  selectedFile = signal<File | null>(null);
  urlFoto = signal<string | null>(null);
  lasPath = signal<string | null>(null);

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
  urlImagen = new FormControl('', [
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

  async enviarFormulario() {

    const { repetirContrasenia, ...registroData } = this.formulario.value;
    
    // 1. Subir archivo y obtener URL
    await this.upload();
    
    // 2. CORRECCIÓN AQUÍ:
    // Antes usabas this.lasPath() (que es solo "perfiles/foto.png")
    // Ahora debes usar this.urlFoto() (que tiene la https://supabase...)
    const urlFoto = this.urlFoto(); 

    // Validación opcional por si falló la carga
    if (!urlFoto) {
      this.showErrorAlert("Error", "Debes subir una imagen válida antes de registrarte.");
      return;
    }

    const dataAEnviar = { ...registroData, urlFoto };

    //Llamar al método de registro del servicio...
    this.authService.registro(dataAEnviar as any).subscribe({
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

  async enviarFormulario1() {

    const { repetirContrasenia, ...registroData } = this.formulario.value;
    await this.upload();
    const urlFoto = this.lasPath();
    const dataAEnviar = { ...registroData, urlFoto };

    //console.log('Datos a enviar:', dataAEnviar);
    
    //Llamar al método de registro del servicio y suscribirse a la respuesta
    this.authService.registro(dataAEnviar as any).subscribe({
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

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  async upload() {
    if (!this.selectedFile()) return;

    const file = this.selectedFile();
    const path = `perfiles/${file?.name}`;
    this.lasPath.set(path);

    const { data, error } = await this.supaService.uploadFile('fotos', path, file!);

    if (error) {
      console.error('Error al subir el archivo: ', error);
      this.showErrorAlert("ERROR de carga!","Error al subir el archivo");
    }

    const publicUrl = await this.supaService.getPublicUrl('fotos', path);
    this.urlFoto.set(publicUrl);
  }

  async delete() {
    if (!this.lasPath()) return;

    const { data, error } = await this.supaService.removeFile('fotos', this.lasPath()!);
    if (error) {
      console.error('Error al eliminar archivo: ', error);
      this.showErrorAlert("ERROR al eliminar","Error al eliminar archivo");
    }

    console.log('archivo eliminado exitosamente!');
    this.showSuccessAlert("Archivo Eliminado!","foto eliminada exitosamente!");
    this.urlFoto.set(null);
    this.lasPath.set(null);
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
