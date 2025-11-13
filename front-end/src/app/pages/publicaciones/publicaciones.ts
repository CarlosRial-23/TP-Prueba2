import { Component, computed, inject, OnInit, signal } from '@angular/core'; // Importar 'computed'
import { PublicacionesService } from '../../services/publicaciones.service';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../components/publicacion/publicacion'; 
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, Publicacion],
  templateUrl: './publicaciones.html',
})
export class Publicaciones implements OnInit {
  private pubService = inject(PublicacionesService);
  private authService = inject(Auth);

  publicaciones = signal<any[]>([]);
  totalPublicaciones = signal(0);
  orden = signal<'fecha' | 'likes'>('fecha');
  limit = signal(10);
  offset = signal(0);
  
  currentUserId = computed(() => this.authService.currentUser()?.id);

  ngOnInit() {
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    this.pubService
      .getPublicaciones(
        this.limit(),
        this.offset(),
        this.orden()
      )
      .subscribe((res) => {
        this.publicaciones.set(res.publicaciones);
        this.totalPublicaciones.set(res.total);
      });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    this.orden.set(nuevoOrden);
    this.offset.set(0);
    this.cargarPublicaciones();
  }

  paginar(cantidad: number) {
    const nuevoOffset = this.offset() + cantidad;
    
    if (nuevoOffset >= 0 && nuevoOffset < this.totalPublicaciones()) {
      this.offset.set(nuevoOffset);
      this.cargarPublicaciones();
    }
  }

  onLike(publicacionId: string) {
    this.pubService.like(publicacionId).subscribe(resActualizada => {
      this.publicaciones.update(pubs => 
        pubs.map(p => p._id === publicacionId ? resActualizada : p)
      );
    });
  }

  onUnlike(publicacionId: string) {
    this.pubService.unlike(publicacionId).subscribe(resActualizada => {
      this.publicaciones.update(pubs => 
        pubs.map(p => p._id === publicacionId ? resActualizada : p)
      );
    });
  }

  onDelete(publicacionId: string) {
    this.pubService.delete(publicacionId).subscribe(() => {
      this.showSuccessAlert("Eliminación Exitosa","Se ha eliminado la publicación exitosamente");
      this.publicaciones.update(pubs => 
        pubs.filter(p => p._id !== publicacionId)
      );
      this.totalPublicaciones.update(t => t - 1);
    });
  }

  private showSuccessAlert(title:string,message: string) {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
}