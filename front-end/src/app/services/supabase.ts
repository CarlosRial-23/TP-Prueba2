import { environment } from './../../environments/environments';
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  //bucket: "fotos"
  //filePath: "perfiles/nombreimagen.png"

  async uploadFile(bucket: string, filePath: string, file: File) {
    return await this.supabase.storage.from(bucket).upload(filePath, file);
  }

  async getPublicUrl(bucket: string, filePath: string) {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async removeFile(bucket: string, path: string) {
    return await this.supabase.storage.from(bucket).remove([path]);
  }

}
