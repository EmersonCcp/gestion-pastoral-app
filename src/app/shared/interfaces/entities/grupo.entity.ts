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
  created_at: string;
  updated_at: string;
}
