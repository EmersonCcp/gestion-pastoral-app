import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InventarioService } from 'src/app/shared/services/inventario.service';
import { FormularioMovimientoInventarioComponent } from '../formulario-movimiento-inventario/formulario-movimiento-inventario.component';

@Component({
  selector: 'app-listado-movimientos-inventario',
  templateUrl: './listado-movimientos-inventario.component.html'
})
export class ListadoMovimientosInventarioComponent implements OnInit {
  movimientos: any[] = [];
  loading = false;
  total = 0;
  page = 1;
  perPage = 10;
  @Output() changed = new EventEmitter<void>(); // Use if needed or just internal reload

  constructor(
    private inventarioService: InventarioService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    this.loading = true;
    this.inventarioService.getHistorial({ page: this.page, per_page: this.perPage }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.movimientos = res.data;
        this.total = res.total;
      }
    });
  }

  nuevoMovimiento() {
    this.dialog.open(FormularioMovimientoInventarioComponent).afterClosed().subscribe(res => {
      if (res) this.cargarMovimientos();
    });
  }

  getBadgeClass(tipo: string): string {
    return tipo === 'INGRESO' 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
      : 'bg-rose-50 text-rose-700 border-rose-100';
  }

  getMotivoLabel(motivo: string): string {
    const labels: any = {
      'COMPRA': 'Compra',
      'DONACION': 'Donación',
      'DEVOLUCION_PRESTAMO': 'Devolución',
      'BAJA_PERDIDA': 'Pérdida',
      'BAJA_DANIADO': 'Dañado',
      'TRANSFERENCIA': 'Transferencia',
      'ENTREGA_PERSONA': 'Entrega',
      'AJUSTE_MANUAL': 'Ajuste'
    };
    return labels[motivo] || motivo;
  }
}
