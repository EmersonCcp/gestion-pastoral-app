
export interface IUsuario {
  id: number;
  email: string;
  nombre_completo: string;
  estado: boolean;
  usuarioRoles: any[];
  usuarioMovimientos?: any[];
}