import { Component } from '@angular/core';
import {inject, signal } from '@angular/core';
import { Supabase } from '../../services/supabase';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  protected readonly title = signal('client');

  supaService = inject(Supabase);
  selectedFile = signal<File | null>(null);
  urlFoto = signal<string | null>(null);
  lasPath = signal<string | null>(null);

}
