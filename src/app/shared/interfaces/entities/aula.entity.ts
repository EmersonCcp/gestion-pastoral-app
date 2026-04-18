import { Parroquia } from "./parroquia.entity";

export interface Aula {
  id: number;
  nombre: string;
  capacidad?: number;
  ubicacion?: string;
  parroquia_id: number;
  parroquia?: Parroquia;
  created_at: string;
  updated_at: string;
}
