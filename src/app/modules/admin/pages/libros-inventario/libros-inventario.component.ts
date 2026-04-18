import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormularioAsignacionLibroComponent } from './components/formulario-asignacion-libro/formulario-asignacion-libro.component';
import { FormularioMovimientoInventarioComponent } from './components/formulario-movimiento-inventario/formulario-movimiento-inventario.component';

@Component({
  selector: 'app-libros-inventario',
  templateUrl: './libros-inventario.component.html'
})
export class LibrosInventarioComponent implements OnInit {
  activeTab: 'stock' | 'movimientos' | 'asignaciones' = 'stock';

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  setTab(tab: 'stock' | 'movimientos' | 'asignaciones') {
    this.activeTab = tab;
  }

  nuevoMovimiento() {
    const dialogRef = this.dialog.open(FormularioMovimientoInventarioComponent, {
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.setTab('movimientos');
      }
    });
  }

  nuevaAsignacion() {
    const dialogRef = this.dialog.open(FormularioAsignacionLibroComponent, {
      width: '550px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.setTab('asignaciones');
      }
    });
  }
}
