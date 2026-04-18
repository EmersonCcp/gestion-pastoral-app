export interface IRol {
  id?: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  createdAt?: Date;

  rolPermisos?: any[];
  usuarioRoles?: any[];
//   rolPermisos?: IRolPermiso[];
//   usuarioRoles?: IUsuarioRol[];
}