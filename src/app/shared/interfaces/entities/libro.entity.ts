import { TipoPersona } from './persona.entity';

export interface Libro {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_persona_id: number;
  tipoPersona?: TipoPersona;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}
