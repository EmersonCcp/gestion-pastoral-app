// import { IRolPermiso } from './rol-permiso.interface';

export interface IPermiso {
  id: number;
  accion: string;
  sujeto: string;
  descripcion?: string;
  createdAt: Date;
//   rolPermisos?: IRolPermiso[];
}