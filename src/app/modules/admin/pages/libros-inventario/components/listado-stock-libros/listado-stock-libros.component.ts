import { Component, OnInit } from '@angular/core';
import { LibroService } from 'src/app/shared/services/libro.service';

@Component({
  selector: 'app-listado-stock-libros',
  templateUrl: './listado-stock-libros.component.html'
})
export class ListadoStockLibrosComponent implements OnInit {
  libros: any[] = [];
  loading = false;

  constructor(private libroService: LibroService) { }

  ngOnInit(): void {
    this.cargarStock();
  }

  cargarStock() {
    this.loading = true;
    this.libroService.getAll({ page: 1, per_page: 100 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.libros = res.data;
      }
    });
  }

  getStockColor(stock: number): string {
    if (stock <= 0) return 'bg-red-50 text-red-700 border-red-100';
    if (stock <= 5) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }
}
