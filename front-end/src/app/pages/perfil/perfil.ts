import { Component, inject, OnInit, signal, computed } from '@angular/core'; 
import { Auth } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones.service';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../components/publicacion/publicacion'; 

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

  usuario = this.authService.currentUser;
  currentUserId = computed(() => this.authService.currentUser()?.id || this.authService.currentUser()?._id);
  misPublicaciones = signal<any[]>([]);

  ngOnInit() {
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones() {
    const user = this.usuario();
    // Asegúrate de usar la propiedad correcta (_id o id)
    const userId = user?.id || user?._id; 
    
    if (userId) { 
      this.pubService
        .getPublicaciones(3, 0, 'fecha', userId) 
        .subscribe((res) => {
          this.misPublicaciones.set(res.publicaciones);
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
        pubs.map(p => p._id === publicacionId ? resActualizada : p)
      );
    });
  }

  onUnlike(publicacionId: string) {
    this.pubService.unlike(publicacionId).subscribe(resActualizada => {
      this.misPublicaciones.update(pubs => 
        pubs.map(p => p._id === publicacionId ? resActualizada : p)
      );
    });
  }
}