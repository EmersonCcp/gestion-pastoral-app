import { Component, OnInit } from '@angular/core';
import { InventarioService } from 'src/app/shared/services/inventario.service';

@Component({
  selector: 'app-listado-asignaciones-libros',
  templateUrl: './listado-asignaciones-libros.component.html'
})
export class ListadoAsignacionesLibrosComponent implements OnInit {
  asignaciones: any[] = [];
  loading = false;

  constructor(private inventarioService: InventarioService) { }

  ngOnInit(): void {
    this.cargarAsignaciones();
  }

  cargarAsignaciones() {
    this.loading = true;
    this.inventarioService.getAsignaciones({ page: 1, per_page: 50 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.asignaciones = res.data;
      }
    });
  }

  getEstadoClass(estado: string): string {
    const classes: any = {
      'ENTREGADO': 'bg-primary-50 text-primary-700 border-primary-100',
      'DEVUELTO': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'PERDIDO': 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return classes[estado] || 'bg-slate-50 text-slate-700 border-slate-100';
  }

  registrarDevolucion(a: any) {
    if (confirm(`¿Está seguro de registrar la devolución del libro "${a.libro.nombre}"?`)) {
      this.loading = true;
      this.inventarioService.devolverLibro(a.id, {}).subscribe((res: any) => {
        if (res.ok) {
          this.cargarAsignaciones();
        } else {
          this.loading = false;
        }
      });
    }
  }
}
