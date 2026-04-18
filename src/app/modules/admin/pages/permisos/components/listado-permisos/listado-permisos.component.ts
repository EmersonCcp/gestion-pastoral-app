import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IPermiso } from 'src/app/shared/interfaces/entities/permiso.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PermisoService } from 'src/app/shared/services/permiso.service';
import { FormularioPermisoComponent } from '../formulario-permiso/formulario-permiso.component';

@Component({
  selector: 'app-listado-permisos',
  templateUrl: './listado-permisos.component.html',
  styleUrls: ['./listado-permisos.component.scss'],
})
export class ListadoPermisosComponent implements OnInit, OnChanges {
  permisos: IPermiso[] = [];
  per_page = 10;
  page = 1;
  loading = true;
  search = '';
  sort_by: string = 'sujeto';
  sort_dir: 'asc' | 'desc' = 'desc';
  total_items = 0;
  total_pages = 0;
  @Input() refreshTrigger!: number;
  mostrarFormulario = false;
  permiso!: IPermiso;

  constructor(
    private service: PermisoService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger']) {
      this.loadData();
    }
  }

  loadData() {
    const query = {
      page: this.page,
      per_page: this.per_page,
      sujeto: this.search,
      accion: this.search,
      sort_by: this.sort_by,
      sort_dir: this.sort_dir,
    };
    this.service.getAll(query).subscribe((res) => {
      if (res.ok) {
        this.permisos = res.data;
        this.loading = false;
        this.total_items = res.meta.paging?.total_items || 0;
        this.total_pages = res.meta.paging?.total_pages || 0;
      } else {
        const errorMsg = res?.error.message || res?.error?.message || res?.error.code || 'Error inesperado';
        if (this.alertService) {
          this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
        } else {
          console.error('API Error:', errorMsg);
        }
      }
    });
  }

  nextPage() {
    if (this.page < this.total_pages) {
      this.page++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  onSearchChange(event: any) {
    this.search = event.target.value;

    if (this.search.length === 0) {
      this.page = 1;
      this.loadData();
      return;
    }

    if (this.search.length < 3) {
      return;
    }

    setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  editar(permiso: IPermiso) {
    const ref = this.dialog.open(FormularioPermisoComponent, {
      width: '400px',
      data: permiso,
    });

    ref.afterClosed().subscribe((result: IPermiso) => {
      if (result) {
        this.loadData();
      }
    });
  }

  remove(permiso: IPermiso) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.delete(permiso.id).subscribe({
        next: (res) => {
          if (res.ok) {
            this.alertService.successOrError();
            this.permisos = this.permisos.filter((c) => c.id !== permiso.id);
          } else {
            this.alertService.successOrError(
              res.error.code,
              res.error.message,
              'error',
            );
          }
        },
        error: (res) => {
          this.alertService.successOrError(
            'Ocurrió un error',
            res.statusText,
            'error',
          );
        },
      });
    });
  }
}
