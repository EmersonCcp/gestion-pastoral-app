import { Grupo } from './grupo.entity';
import { Periodo } from './periodo.entity';
import { Persona } from './persona.entity';

export enum EstadoAsistencia {
  PRESENTE = 'PRESENTE',
  AUSENTE = 'AUSENTE',
  JUSTIFICADO = 'JUSTIFICADO',
}

export interface AsistenciaPersona {
  id?: number;
  asistencia_id?: number;
  persona_id: number;
  estado: EstadoAsistencia;
  observacion?: string | null;
  persona?: Persona;
}

export interface Asistencia {
  id: number;
  fecha: string;
  observacion?: string | null;
  grupo_id: number;
  periodo_id: number;
  grupo?: Grupo;
  periodo?: Periodo;
  personas?: AsistenciaPersona[];
  total_presente?: number;
  total_ausente?: number;
  total_justificado?: number;
  total_miembros?: number;
  created_at: string;
  updated_at: string;
}
