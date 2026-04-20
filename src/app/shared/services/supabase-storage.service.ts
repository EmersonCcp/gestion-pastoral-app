import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseStorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async upload(file: File, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(environment.supabaseBucket)
      .upload(path, file);

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from(environment.supabaseBucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(environment.supabaseBucket)
      .remove([path]);

    if (error) throw error;
  }
}
