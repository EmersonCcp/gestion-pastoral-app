import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ICategoria } from 'src/app/shared/interfaces/entities/categoria.entity';
import { CategoriaService } from 'src/app/shared/services/categoria.service';
import { FormularioCategoriaComponent } from './components/formulario-categoria/formulario-categoria.component';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent  {

  refresh = 0;
  
    constructor(private dialog: MatDialog) {}
  
    crear() {
      const ref = this.dialog.open(FormularioCategoriaComponent, {
        width: '400px',
      });
  
      ref.afterClosed().subscribe((res: ICategoria) => {
        if (res) {
          this.refresh++;
        }
      });
    }
}
