import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Parroquia } from 'src/app/shared/interfaces/entities/parroquia.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ParroquiaService } from 'src/app/shared/services/parroquia.service';

@Component({
  selector: 'app-listado-parroquias',
  templateUrl: './listado-parroquias.component.html',
  styleUrls: ['./listado-parroquias.component.scss'],
})
export class ListadoParroquiasComponent implements OnInit {
  parroquias: Parroquia[] = [];
  per_page = 10;
  page = 1;
  loading = true;
  search = '';
  sort_by: string = 'nombre';
  sort_dir: 'asc' | 'desc' = 'asc';
  total_items = 0;
  total_pages = 0;

  constructor(
    private service: ParroquiaService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = false;
    const query = {
      page: this.page,
      per_page: this.per_page,
      nombre: this.search,
      sort_by: this.sort_by,
      sort_dir: this.sort_dir,
    };
    this.service.getAll(query).subscribe((res: any) => {

      this.loading = false;
      if (res.ok) {
        this.parroquias = res.data;
        this.total_items = res.meta.paging?.total_items || 0;
        this.total_pages = res.meta.paging?.total_pages || 0;
      } else {
        const errorMsg = res?.error?.message || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
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
    if (this.search.length < 3) return;

    // Optional: Debounce search
    setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  editar(parroquia: Parroquia) {
    this.router.navigate([`/admin/parroquias/${parroquia.id}/edit`]);
  }

  eliminar(parroquia: Parroquia) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.delete(parroquia.id).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.alertService.successOrError('Éxito', 'Parroquia eliminada correctamente', 'success');
            this.parroquias = this.parroquias.filter((p) => p.id !== parroquia.id);
          } else {
            this.alertService.successOrError('Error', res.error.message, 'error');
          }
        },
        error: (err) => {
          this.alertService.successOrError('Error', 'No se pudo eliminar la parroquia', 'error');
        },
      });
    });
  }
}
