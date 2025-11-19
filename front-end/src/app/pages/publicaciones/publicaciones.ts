import { Component, computed, inject, OnInit, signal } from '@angular/core'; // Importar 'computed'
import { PublicacionesService } from '../../services/publicaciones.service';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../components/publicacion/publicacion'; 
import { Auth } from '../../services/auth';
import { Supabase } from '../../services/supabase'; // Importar Supabase
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms'; // Importar ReactiveForms
import Swal from 'sweetalert2';


@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, Publicacion, ReactiveFormsModule],
  templateUrl: './publicaciones.html',
})
export class Publicaciones implements OnInit {
  private pubService = inject(PublicacionesService);
  private authService = inject(Auth);
  private supaService = inject(Supabase);

  publicaciones = signal<any[]>([]);
  totalPublicaciones = signal(0);
  orden = signal<'fecha' | 'likes'>('fecha');
  limit = signal(10);
  offset = signal(0);
  
  currentUserId = computed(() => this.authService.currentUser()?.id);

  selectedFile = signal<File | null>(null);
  isSubmitting = signal(false);

  form = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(5)]), 
    mensaje: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

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

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  async crearPublicacion() {
    if (this.form.invalid) return;
    
    this.isSubmitting.set(true);
    let urlImagen = null;

    try {
      // 1. Si hay foto, subirla a Supabase
      if (this.selectedFile()) {
        const file = this.selectedFile()!;
        // Usamos un timestamp para evitar nombres duplicados
        const filePath = `publicaciones/${Date.now()}_${file.name}`;
        
        const { error } = await this.supaService.uploadFile('fotos', filePath, file);
        if (error) throw error;

        urlImagen = await this.supaService.getPublicUrl('fotos', filePath);
      }

      // 2. Preparar datos
      const nuevaPubData = {
        titulo: this.form.value.titulo,
        descripcion: this.form.value.mensaje, // <--- EL BACKEND ESPERA 'descripcion'
        urlImagen: urlImagen 
      };

      // 3. Enviar al Backend
      this.pubService.create(nuevaPubData).subscribe({
        next: (res) => {
          this.showSuccessAlert('Publicado', 'Tu publicación se ha creado exitosamente');
          this.offset.set(0); 
          this.cargarPublicaciones();
          
          this.form.reset();
          this.selectedFile.set(null);
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if(fileInput) fileInput.value = '';
          
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error(err); // Ahora verás el error detallado si falla algo más
          this.showErrorAlert('Error', 'No se pudo crear la publicación');
          this.isSubmitting.set(false);
        }
      });
      
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      this.showErrorAlert('Error', 'Falló la subida de la imagen');
      this.isSubmitting.set(false);
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

  private showErrorAlert(title:string, message: string) {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}