export interface IStorageService {
  upload(file: File, path: string): Promise<string>; // retorna URL
  delete(path: string): Promise<void>;
}