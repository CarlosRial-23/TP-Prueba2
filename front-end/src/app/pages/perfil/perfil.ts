import { Supabase } from '../../services/supabase';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones.service';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../components/publicacion/publicacion';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, Publicacion], 
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private authService = inject(Auth);
  private pubService = inject(PublicacionesService);

  usuario = this.authService.currentUser;
  
  misPublicaciones = signal<any[]>([]);

  ngOnInit() {
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones() {
    const user = this.usuario();
    if (user && user.id) { 
      this.pubService
        .getPublicaciones(3, 0, 'fecha', user.id)
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
}
