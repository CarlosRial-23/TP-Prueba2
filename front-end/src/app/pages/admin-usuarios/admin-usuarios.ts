import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styles: [`
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background-color: #f4f4f4; }
    .activo { color: green; font-weight: bold; }
    .inactivo { color: red; font-weight: bold; }
    .acciones button { margin-right: 5px; cursor: pointer; }
    .search-bar { margin-bottom: 15px; padding: 8px; width: 100%; max-width: 300px; }
  `]
})
export class AdminUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);

  usuarios = signal<any[]>([]);
  filtro = signal(''); 

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.findAll().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error(err)
    });
  }

  get usuariosFiltrados() {
    const term = this.filtro().toLowerCase();
    return this.usuarios().filter(u => 
      u.nombreUsuario.toLowerCase().includes(term) || 
      u.correo.toLowerCase().includes(term)
    );
  }

  toggleEstado(usuario: any) {
    if (usuario.activo) {
      
      this.usuariosService.delete(usuario._id).subscribe(() => {
        this.actualizarLocal(usuario._id, false);
        Swal.fire('Usuario desactivado', '', 'success');
      });
    } else {
      
      this.usuariosService.restore(usuario._id).subscribe(() => {
        this.actualizarLocal(usuario._id, true);
        Swal.fire('Usuario restaurado', '', 'success');
      });
    }
  }

  private actualizarLocal(id: string, estado: boolean) {
    this.usuarios.update(lista => 
      lista.map(u => u._id === id ? { ...u, activo: estado } : u)
    );
  }
}