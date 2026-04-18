import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TipoPersona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TipoPersonaService } from 'src/app/shared/services/tipo-persona.service';
import { FormularioTipoPersonaComponent } from './components/formulario-tipo-persona/formulario-tipo-persona.component';

@Component({
  selector: 'app-tipos-personas',
  templateUrl: './tipos-personas.component.html',
  styleUrls: ['./tipos-personas.component.scss']
})
export class TiposPersonasComponent implements OnInit {
  tipos: TipoPersona[] = [];
  loading = false;
  
  constructor(
    private service: TipoPersonaService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll({ per_page: 100 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.tipos = res.data;
      }
    });
  }

  agregar() {
    const dialogRef = this.dialog.open(FormularioTipoPersonaComponent, {
      width: '450px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  editar(tipo: TipoPersona) {
    const dialogRef = this.dialog.open(FormularioTipoPersonaComponent, {
      width: '450px',
      data: tipo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  eliminar(tipo: TipoPersona) {
    this.alertService.confirmDelete(() => {
      this.service.delete(tipo.id).subscribe((res: any) => {
        if (res.ok) {
          this.alertService.successOrError('Eliminado');
          this.loadData();
        }
      });
    });
  }
}
