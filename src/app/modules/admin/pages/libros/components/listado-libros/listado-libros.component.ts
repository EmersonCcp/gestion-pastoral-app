import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Libro } from 'src/app/shared/interfaces/entities/libro.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LibroService } from 'src/app/shared/services/libro.service';

@Component({
  selector: 'app-listado-libros',
  templateUrl: './listado-libros.component.html'
})
export class ListadoLibrosComponent implements OnInit {
  libros: Libro[] = [];
  loading = false;
  total_items = 0;
  page = 1;
  per_page = 20;

  constructor(
    private service: LibroService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll({ page: this.page, per_page: this.per_page }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.libros = res.data;
        this.total_items = res.meta?.paging?.total_items || 0;
      }
    });
  }

  editar(l: Libro) {
    this.router.navigate([`/admin/libros/${l.id}/edit`]);
  }

  eliminar(l: Libro) {
    this.alertService.confirmDelete(() => {
      this.service.delete(l.id).subscribe((res: any) => {
        if (res.ok) {
          this.alertService.successOrError('Libro eliminado');
          this.loadData();
        }
      });
    });
  }
}
