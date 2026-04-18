import { Libro } from './libro.entity';
import { Movimiento } from './movimiento.entity';

export interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  movimiento_id: number;
  movimiento?: Movimiento;
  parent_id?: number;
  parent?: Grupo;
  subgrupos?: Grupo[];
  libro_ids?: number[];
  libros?: Libro[];
  created_at: string;
  updated_at: string;
}
