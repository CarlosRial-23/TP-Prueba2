import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios';
import { Publicacion } from '../../components/publicacion/publicacion';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [CommonModule, Publicacion, FormsModule],
  templateUrl: './detalle-publicacion.html',
  styleUrls: ['./detalle-publicacion.css']
})
export class DetallePublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pubService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  public authService = inject(Auth);

  publicacionId = '';
  publicacion: any = null;
  
  // Lógica de Comentarios
  comentarios = signal<any[]>([]);
  nuevoComentario = '';
  cargandoComentarios = false;
  
  // Paginación
  limit = 5;
  offset = 0;
  totalComentarios = 0;

  // Edición
  comentarioEditandoId: string | null = null;
  textoEdicion = '';

  ngOnInit() {
    this.publicacionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.publicacionId) {
      this.cargarPublicacion();
      this.cargarComentarios();
    }
  }

  cargarPublicacion() {
    this.pubService.getById(this.publicacionId).subscribe({
      next: (res) => this.publicacion = res,
      error: () => this.router.navigate(['/publicaciones'])
    });
  }

  cargarComentarios(cargarMas: boolean = false) {
    this.cargandoComentarios = true;
    if (!cargarMas) this.offset = 0;

    this.comentariosService.getComentarios(this.publicacionId, this.limit, this.offset)
      .subscribe((res) => {
        if (cargarMas) {
          // REQUISITO: "sin dejar de mostrar los anteriores"
          this.comentarios.update(current => [...current, ...res.comentarios]);
        } else {
          this.comentarios.set(res.comentarios);
        }
        this.totalComentarios = res.total;
        this.cargandoComentarios = false;
      });
  }

  cargarMasComentarios() {
    this.offset += this.limit;
    this.cargarComentarios(true);
  }

  enviarComentario() {
    if (!this.nuevoComentario.trim()) return;

    this.comentariosService.crear(this.publicacionId, this.nuevoComentario)
      .subscribe(() => {
        this.nuevoComentario = '';
        // Recargamos desde cero para ver el nuevo comentario arriba
        this.cargarComentarios(); 
        Swal.fire('Comentario enviado', '', 'success');
      });
  }

  // --- Lógica de Edición ---

  iniciarEdicion(comentario: any) {
    this.comentarioEditandoId = comentario._id;
    this.textoEdicion = comentario.mensaje;
  }

  cancelarEdicion() {
    this.comentarioEditandoId = null;
    this.textoEdicion = '';
  }

  guardarEdicion() {
    if (!this.comentarioEditandoId || !this.textoEdicion.trim()) return;

    this.comentariosService.editar(this.comentarioEditandoId, this.textoEdicion)
      .subscribe(() => {
        // Actualizamos el comentario localmente para reflejar el cambio "editado"
        this.comentarios.update(lista => lista.map(c => {
          if (c._id === this.comentarioEditandoId) {
            return { ...c, mensaje: this.textoEdicion, modificado: true };
          }
          return c;
        }));
        this.cancelarEdicion();
        Swal.fire('Comentario actualizado', '', 'success');
      });
  }
}