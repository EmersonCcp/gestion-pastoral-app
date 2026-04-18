import { Parroquia } from './parroquia.entity';

export interface Movimiento {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  parroquia_id?: number;
  parroquia?: Parroquia;
  created_at: string;
  updated_at: string;
}
