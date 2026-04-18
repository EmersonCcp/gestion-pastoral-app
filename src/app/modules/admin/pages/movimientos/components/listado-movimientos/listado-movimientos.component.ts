import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movimiento } from 'src/app/shared/interfaces/entities/movimiento.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MovimientoService } from 'src/app/shared/services/movimiento.service';

@Component({
  selector: 'app-listado-movimientos',
  templateUrl: './listado-movimientos.component.html',
  styleUrls: ['./listado-movimientos.component.scss'],
})
export class ListadoMovimientosComponent implements OnInit {
  movimientos: Movimiento[] = [];
  per_page = 10;
  page = 1;
  loading = true;
  search = '';
  sort_by: string = 'nombre';
  sort_dir: 'asc' | 'desc' = 'asc';
  total_items = 0;
  total_pages = 0;

  constructor(
    private service: MovimientoService,
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
        this.movimientos = res.data;
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

  editar(movimiento: Movimiento) {
    this.router.navigate([`/admin/movimientos/${movimiento.id}/edit`]);
  }

  eliminar(movimiento: Movimiento) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.delete(movimiento.id).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.alertService.successOrError('Éxito', 'Movimiento eliminado correctamente', 'success');
            this.movimientos = this.movimientos.filter((m) => m.id !== movimiento.id);
          } else {
            this.alertService.successOrError('Error', res.error.message, 'error');
          }
        },
        error: () => {
          this.alertService.successOrError('Error', 'No se pudo eliminar el movimiento', 'error');
        },
      });
    });
  }
}
