import { Asistencia } from './asistencia.entity';
import { Grupo } from './grupo.entity';
import { Libro } from './libro.entity';
import { Tema } from './tema.entity';

export interface DesarrolloClase {
  id: number;
  fecha: string;
  grupo_id: number;
  libro_id: number;
  temas_ids: number[];
  asistencia_id?: number;
  observaciones?: string;
  
  // Relations
  grupo?: Grupo;
  libro?: Libro;
  temas?: Tema[];
  asistencia?: Asistencia;
  
  created_at?: string;
  updated_at?: string;
}
