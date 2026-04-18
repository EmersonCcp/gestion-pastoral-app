import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';

@Component({
  selector: 'app-listado-periodos',
  templateUrl: './listado-periodos.component.html',
  styleUrls: ['./listado-periodos.component.scss'],
})
export class ListadoPeriodosComponent implements OnInit {
  periodos: Periodo[] = [];
  per_page = 10;
  page = 1;
  loading = true;
  search = '';
  total_items = 0;
  total_pages = 0;

  constructor(
    private service: PeriodoService,
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
    };
    this.service.getAll(query).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.periodos = res.data;
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

    setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  editar(periodo: Periodo) {
    this.router.navigate([`/admin/periodos/${periodo.id}/edit`]);
  }

  eliminar(periodo: Periodo) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.delete(periodo.id).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.alertService.successOrError('Éxito', 'Periodo eliminado correctamente', 'success');
            this.periodos = this.periodos.filter((p) => p.id !== periodo.id);
          } else {
            this.alertService.successOrError('Error', res.error.message, 'error');
          }
        },
        error: () => {
          this.alertService.successOrError('Error', 'No se pudo eliminar el periodo', 'error');
        },
      });
    });
  }
}
