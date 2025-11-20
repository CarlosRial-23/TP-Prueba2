import { Component, inject, OnInit, signal, computed } from '@angular/core'; 
import { Auth } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios'; // Importar servicio
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../components/publicacion/publicacion'; 
import { forkJoin, map } from 'rxjs'; // Importar operadores RxJS

@Component({
  selector: 'app-perfil',
  standalone: true, 
  imports: [CommonModule, Publicacion], 
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private authService = inject(Auth);
  private pubService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService); // Inyectar servicio

  usuario = this.authService.currentUser;
  currentUserId = computed(() => this.authService.currentUser()?.id || this.authService.currentUser()?._id);
  misPublicaciones = signal<any[]>([]);

  ngOnInit() {
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones() {
    const user = this.usuario();
    const userId = user?.id || user?._id; 
    
    if (userId) { 
      this.pubService
        .getPublicaciones(3, 0, 'fecha', userId) 
        .subscribe((res) => {
          const publicaciones = res.publicaciones;

          if (publicaciones.length === 0) {
            this.misPublicaciones.set([]);
            return;
          }

          // 2. Crear array de peticiones
          const peticiones = publicaciones.map((pub: any) => {
            return this.comentariosService.getComentarios(pub._id, 3, 0).pipe(
              map((resComentarios) => ({
                ...pub,
                comentarios: resComentarios.comentarios 
              }))
            );
          });

          // 3. CORRECCIÓN AQUÍ: Cambia 'any[]' por 'any' en el argumento del subscribe
          forkJoin(peticiones).subscribe((publicacionesConComentarios: any) => {
            // Al ser 'any', TypeScript permite asignarlo a la señal que espera any[]
            this.misPublicaciones.set(publicacionesConComentarios);
          });
        });
    }
  }
  
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
            // Al actualizar el like, nos aseguramos de mantener los comentarios que ya habíamos cargado
            if (p._id === publicacionId) {
                return { ...resActualizada, comentarios: p.comentarios };
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
                return { ...resActualizada, comentarios: p.comentarios };
            }
            return p;
        })
      );
    });
  }
}