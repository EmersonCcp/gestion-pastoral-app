export interface Parroquia {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}
