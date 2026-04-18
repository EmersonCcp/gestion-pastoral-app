import { Aula } from './aula.entity';
import { Grupo } from './grupo.entity';
import { Periodo } from './periodo.entity';
import { Persona } from './persona.entity';

export interface Asignacion {
  id: number;
  grupo_id: number;
  periodo_id: number;
  aula_id?: number | null;
  dia_reunion?: string | null;
  frecuencia?: string | null;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  grupo?: Grupo;
  periodo?: Periodo;
  aula?: Aula;
  personas?: Persona[];
  created_at: string;
  updated_at: string;
}
