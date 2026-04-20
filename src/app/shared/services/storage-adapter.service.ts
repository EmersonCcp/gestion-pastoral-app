import { Injectable } from '@angular/core';
import { SupabaseStorageService } from './supabase-storage.service';

@Injectable({
  providedIn: 'root'
})
export class StorageAdapterService {
  constructor(private storageService: SupabaseStorageService) { }

  async upload(file: File, path: string): Promise<string> {
    return this.storageService.upload(file, path);
  }

  async delete(path: string): Promise<void> {
    return this.storageService.delete(path);
  }
}
