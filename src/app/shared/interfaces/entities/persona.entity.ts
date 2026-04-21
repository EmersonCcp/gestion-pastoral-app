export interface TipoPersona {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentoPersona {
  id: number;
  nombre: string;
  url: string;
  path: string;
  tipo?: string;
  persona_id: number;
  movimiento_id: number;
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
  tipos_personas_ids?: number[];
  tiposPersonas?: TipoPersona[];
  documentos?: DocumentoPersona[];
  relaciones?: any[];
  parienteDe?: any[];
  bautismo?: boolean;
  primera_comunion?: boolean;
  confirmacion?: boolean;
  created_at: string;
  updated_at: string;
}
