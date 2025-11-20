import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Supabase } from '../../services/supabase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css'
})
export class AdminUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private fb = inject(FormBuilder);
  private supaService = inject(Supabase);

  usuarios = signal<any[]>([]);
  mostrarFormulario = signal(false);
  selectedFile: File | null = null;
  
  // Validaciones copiadas de registro.ts
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    correo: ['', [Validators.required, Validators.email]],
    // Patrón: Mínimo 8 caracteres, una mayúscula y un número
    contrasenia: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$')]],
    repetirContrasenia: ['', [Validators.required]], 
    fechaNacimiento: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    perfil: ['usuario', Validators.required], // Campo nuevo para el Admin
    urlFoto: [''] // Opcional en la validación del form porque lo manejamos manual
  }, { validators: this.validarContrasenias }); // Validador grupal

  ngOnInit() {
    this.cargarUsuarios();
  }

  // Validador personalizado copiado de Registro
  validarContrasenias(control: AbstractControl): ValidationErrors | null {
    const password = control.get('contrasenia')?.value;
    const confirmPassword = control.get('repetirContrasenia')?.value;
    return password === confirmPassword ? null : { noCoinciden: true };
  }

  cargarUsuarios() {
    this.usuariosService.findAll().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error(err)
    });
  }

  toggleEstado(usuario: any) {
    const accion = usuario.activo ? 'deshabilitar' : 'habilitar';
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `Vas a ${accion} a ${usuario.nombreUsuario}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (usuario.activo) {
          this.usuariosService.delete(usuario._id).subscribe(() => this.actualizarLista(usuario._id, false));
        } else {
          this.usuariosService.restore(usuario._id).subscribe(() => this.actualizarLista(usuario._id, true));
        }
      }
    });
  }

  private actualizarLista(id: string, estado: boolean) {
    this.usuarios.update(lista => 
      lista.map(u => u._id === id ? { ...u, activo: estado } : u)
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  async crearUsuario() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Muestra los errores rojos si intentan enviar vacío
      return;
    }

    try {
      let urlFoto = null;
      if (this.selectedFile) {
        const path = `perfiles/${Date.now()}_${this.selectedFile.name}`;
        await this.supaService.uploadFile('fotos', path, this.selectedFile);
        urlFoto = await this.supaService.getPublicUrl('fotos', path);
      }

      // Excluimos repetirContrasenia del envío al backend
      const { repetirContrasenia, ...datosUsuario } = this.form.value;

      const nuevoUsuario = {
        ...datosUsuario,
        urlFoto: urlFoto
      };

      this.usuariosService.createAdmin(nuevoUsuario).subscribe({
        next: () => {
          Swal.fire('Creado', 'Usuario creado exitosamente', 'success');
          this.form.reset({ perfil: 'usuario' });
          this.mostrarFormulario.set(false);
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo crear el usuario (¿correo o usuario duplicado?)', 'error');
        }
      });

    } catch (error) {
      console.error(error);
    }
  }
  
  // Getters para facilitar el HTML
  get f() { return this.form.controls; }
}