import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Aula } from 'src/app/shared/interfaces/entities/aula.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AulaService } from 'src/app/shared/services/aula.service';
import { FormularioAulaComponent } from './components/formulario-aula/formulario-aula.component';

@Component({
  selector: 'app-aulas',
  templateUrl: './aulas.component.html',
  styleUrls: ['./aulas.component.scss']
})
export class AulasComponent implements OnInit {
  aulas: Aula[] = [];
  loading = true;

  constructor(
    private service: AulaService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = false;
    this.service.getAll({ per_page: 100 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.aulas = res.data;
      }
    });
  }

  agregar() {
    const dialogRef = this.dialog.open(FormularioAulaComponent, {
      width: '450px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  editar(aula: Aula) {
    const dialogRef = this.dialog.open(FormularioAulaComponent, {
      width: '450px',
      data: aula
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  eliminar(aula: Aula) {
    this.alertService.confirmDelete(() => {
      this.service.delete(aula.id).subscribe((res: any) => {
        if (res.ok) {
          this.alertService.successOrError('Eliminado');
          this.loadData();
        }
      });
    });
  }
}
