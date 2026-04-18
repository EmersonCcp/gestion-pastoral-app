export interface TipoPersona {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  genero?: string;
  fecha_nacimiento?: string;
  tipo_persona_id: number;
  tipoPersona?: TipoPersona;
  created_at: string;
  updated_at: string;
}
