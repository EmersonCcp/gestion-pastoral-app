import { Injectable } from '@angular/core';
import { IStorageService } from '../interfaces/storage/storage.interface';
import { FirebaseStorageService } from './firebase-storage.service';

@Injectable({
  providedIn: 'root'
})
export class StorageAdapterService implements IStorageService {

  constructor(
    private firebaseStorage: FirebaseStorageService
  ) {}

  upload(file: File, path: string): Promise<string> {
    return this.firebaseStorage.upload(file, path);
  }

  delete(path: string): Promise<void> {
    return this.firebaseStorage.delete(path);
  }
}
