import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DesarrolloClase } from 'src/app/shared/interfaces/entities/desarrollo-clase.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DesarrolloClaseService } from 'src/app/shared/services/desarrollo-clase.service';
import { MovimientoService } from 'src/app/shared/services/movimiento.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Movimiento } from 'src/app/shared/interfaces/entities/movimiento.entity';

@Component({
  selector: 'app-desarrollo-clase',
  templateUrl: './desarrollo-clase.component.html'
})
export class DesarrolloClaseComponent implements OnInit {
  sesiones: DesarrolloClase[] = [];
  loading = false;
  total_items = 0;
  page = 1;
  per_page = 20;
  movimientos: Movimiento[] = [];
  selectedMovimientoId: number | null = null;

  constructor(
    private service: DesarrolloClaseService,
    private movimientoService: MovimientoService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadData();
  }

  loadCatalogs() {
    // We can get movements assigned to the user or all if superuser
    this.movimientos = this.authService.getUserMovimientos();
    this.selectedMovimientoId = this.authService.getSelectedMovimientoId();
    
    // If no movements in user object but we have access, we could fetch them
    if (this.movimientos.length === 0) {
      this.movimientoService.getAll({ per_page: 100 }).subscribe((res: any) => {
        if (res.ok) {
          this.movimientos = res.data;
        }
      });
    }
  }

  loadData() {
    this.loading = true;
    const filters: any = { page: this.page, per_page: this.per_page };
    if (this.selectedMovimientoId) {
      filters.movimiento_id = this.selectedMovimientoId;
    }

    this.service.getAll(filters).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.sesiones = res.data;
        this.total_items = res.meta?.paging?.total_items || 0;
      }
    });
  }

  onFilterChange() {
    this.page = 1;
    this.loadData();
  }

  nueva() {
    this.router.navigate(['/admin/desarrollo-clase/0/new']);
  }

  editar(s: DesarrolloClase) {
    this.router.navigate([`/admin/desarrollo-clase/${s.id}/edit`]);
  }

  eliminar(s: DesarrolloClase) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader()
      this.service.delete(s.id).subscribe((res: any) => {
        console.log(res);
        
        this.alertService.close()
        if (res.ok) {
          this.alertService.successOrError('Sesión eliminada');
          this.loadData();
        }
      });
    });
  }
}
