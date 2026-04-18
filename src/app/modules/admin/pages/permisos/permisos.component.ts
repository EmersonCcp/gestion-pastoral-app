import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormularioPermisoComponent } from './components/formulario-permiso/formulario-permiso.component';
import { IPermiso } from 'src/app/shared/interfaces/entities/permiso.entity';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.scss'],
})
export class PermisosComponent {
  refresh = 0;

  constructor(private dialog: MatDialog) {}

  crear() {
    const ref = this.dialog.open(FormularioPermisoComponent, {
      width: '400px',
    });

    ref.afterClosed().subscribe((res: IPermiso) => {
      if (res) {
        this.refresh++;
      }
    });
  }
}
