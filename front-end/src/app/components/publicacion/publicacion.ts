import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publicacion',
  standalone: true, 
  imports: [CommonModule, RouterLink], 
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class Publicacion {

  @Input() publicacion: any; 
  @Input() currentUserId: string | null = null; 

  @Output() onLike = new EventEmitter<string>();
  @Output() onUnlike = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  usuarioDioLike(): boolean {
    if (!this.currentUserId || !this.publicacion?.meGusta) return false;
    return this.publicacion.meGusta.includes(this.currentUserId);
  }
}