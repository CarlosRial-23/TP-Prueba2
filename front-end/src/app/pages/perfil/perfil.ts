import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Auth } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../components/publicacion/publicacion';
import { FormsModule } from '@angular/forms'; // Importante para [(ngModel)] en la edición
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, Publicacion, FormsModule], // Agregamos FormsModule a los imports
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private authService = inject(Auth);
  private pubService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);

  usuario = this.authService.currentUser;
  // Calculamos el ID del usuario actual para validar permisos de edición/borrado
  currentUserId = computed(() => this.authService.currentUser()?.id || this.authService.currentUser()?._id);
  
  misPublicaciones = signal<any[]>([]);
  
  // Constante para el límite de comentarios por carga
  readonly COMENTARIOS_LIMIT = 3;

  ngOnInit() {
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones() {
    const user = this.usuario();
    const userId = user?.id || user?._id;
    
    if (userId) {
      // 1. Obtenemos las publicaciones del usuario
      this.pubService.getPublicaciones(3, 0, 'fecha', userId).subscribe((res) => {
        const publicaciones = res.publicaciones;

        if (publicaciones.length === 0) {
          this.misPublicaciones.set([]);
          return;
        }

        // 2. Para cada publicación, preparamos la petición de sus primeros comentarios
        const peticiones = publicaciones.map((pub: any) => {
          return this.comentariosService.getComentarios(pub._id, this.COMENTARIOS_LIMIT, 0).pipe(
            map((resComentarios) => ({
              ...pub,
              comentarios: resComentarios.comentarios,
              // Determinamos si hay más comentarios para mostrar el botón
              mostrarBotonCargarMas: resComentarios.comentarios.length === this.COMENTARIOS_LIMIT
            }))
          );
        });

        // 3. Ejecutamos todas las peticiones en paralelo
        forkJoin(peticiones).subscribe((publicacionesConComentarios: any) => {
          this.misPublicaciones.set(publicacionesConComentarios);
        });
      });
    }
  }

  // --- Lógica para Cargar Más Comentarios ---
  cargarMasComentarios(publicacionId: string) {
    const publicacion = this.misPublicaciones().find(p => p._id === publicacionId);
    if (!publicacion) return;

    // El offset es la cantidad de comentarios que ya tenemos cargados
    const offsetActual = publicacion.comentarios.length;

    this.comentariosService.getComentarios(publicacionId, this.COMENTARIOS_LIMIT, offsetActual)
      .subscribe((res) => {
        const nuevosComentarios = res.comentarios;
        
        // Actualizamos la señal inmutablemente
        this.misPublicaciones.update(pubs => pubs.map(p => {
          if (p._id === publicacionId) {
            return {
              ...p,
              // Concatenamos los nuevos comentarios
              comentarios: [...p.comentarios, ...nuevosComentarios],
              // Si trajimos menos del límite, significa que ya no hay más en el servidor
              mostrarBotonCargarMas: nuevosComentarios.length === this.COMENTARIOS_LIMIT
            };
          }
          return p;
        }));
      });
  }

  // --- Lógica de Edición de Comentarios ---
  activarEdicion(comentario: any) {
    // Guardamos el mensaje original en un borrador temporal
    comentario.mensajeBorrador = comentario.mensaje;
    comentario.editando = true;
  }

  cancelarEdicion(comentario: any) {
    comentario.editando = false;
    comentario.mensajeBorrador = null;
  }

  guardarEdicion(comentario: any) {
    if (!comentario.mensajeBorrador || comentario.mensajeBorrador.trim() === '') return;

    this.comentariosService.editar(comentario._id, comentario.mensajeBorrador)
      .subscribe({
        next: () => {
          comentario.mensaje = comentario.mensajeBorrador;
          comentario.editando = false;
          comentario.mensajeBorrador = null;
          // Actualizamos la fecha de modificación para que aparezca "Editado"
          comentario.updatedAt = new Date().toISOString();
        },
        error: (err) => console.error('Error al editar comentario', err)
      });
  }

  // Determina si un comentario ha sido editado comparando fechas
  esEditado(comentario: any): boolean {
    if (!comentario.createdAt || !comentario.updatedAt) return false;
    return comentario.createdAt !== comentario.updatedAt;
  }

  // --- Acciones sobre Publicaciones ---
  onDelete(publicacionId: string) {
    this.pubService.delete(publicacionId).subscribe(() => {
      this.misPublicaciones.update(pubs => 
        pubs.filter(p => p._id !== publicacionId)
      );
    });
  }

  onLike(publicacionId: string) {
    this.pubService.like(publicacionId).subscribe(resActualizada => {
      this.misPublicaciones.update(pubs => 
        pubs.map(p => {
          // Mantenemos los comentarios locales al actualizar la info de likes
          if (p._id === publicacionId) {
            return { ...resActualizada, comentarios: p.comentarios, mostrarBotonCargarMas: p.mostrarBotonCargarMas };
          }
          return p;
        })
      );
    });
  }

  onUnlike(publicacionId: string) {
    this.pubService.unlike(publicacionId).subscribe(resActualizada => {
      this.misPublicaciones.update(pubs => 
        pubs.map(p => {
          if (p._id === publicacionId) {
             return { ...resActualizada, comentarios: p.comentarios, mostrarBotonCargarMas: p.mostrarBotonCargarMas };
          }
          return p;
        })
      );
    });
  }
}