import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IRol } from 'src/app/shared/interfaces/entities/rol.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RolesService } from 'src/app/shared/services/roles.service';

@Component({
  selector: 'app-listado-roles',
  templateUrl: './listado-roles.component.html',
  styleUrls: ['./listado-roles.component.scss'],
})
export class ListadoRolesComponent {
  roles: IRol[] = [];
  per_page = 10;
  page = 1;
  loading = true;
  search = '';
  sort_by: string = 'nombre';
  sort_dir: 'asc' | 'desc' = 'desc';
  total_items = 0;
  total_pages = 0;
  mostrarFormulario = false;
  rol!: IRol;

  constructor(
    private service: RolesService,
    private alertService: AlertService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const query = {
      page: this.page,
      per_page: this.per_page,
      nombre: this.search,
      sort_by: this.sort_by,
      sort_dir: this.sort_dir,
    };
    this.service.getAll(query).subscribe((res) => {

      if (res.ok) {
        this.roles = res.data;
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

  editar(rol: IRol) {
    this.router.navigate([`/admin/roles/${rol.id}/edit`]);
  }

  removeCategoria(rol: IRol) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.delete(rol.id!).subscribe({
        next: (res) => {
          if (res.ok) {
            this.alertService.successOrError();
            this.roles = this.roles.filter((c) => c.id !== rol.id);
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
