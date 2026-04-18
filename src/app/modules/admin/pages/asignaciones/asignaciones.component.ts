import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asignacion } from 'src/app/shared/interfaces/entities/asignacion.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.component.html',
  styleUrls: ['./asignaciones.component.scss']
})
export class AsignacionesComponent implements OnInit {
  asignaciones: Asignacion[] = [];
  periodos: Periodo[] = [];
  loading = true;
  selectedPeriodoId: number | null = null;
  total_items = 0;
  page = 1;
  per_page = 20;

  constructor(
    private service: AsignacionService,
    private periodoService: PeriodoService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPeriodos();
    this.loadData();
  }

  loadPeriodos() {
    this.periodoService.getAll({ per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
    });
  }

  loadData() {
    this.loading = false;
    const filters: any = { per_page: this.per_page, page: this.page };
    if (this.selectedPeriodoId) filters.periodo_id = this.selectedPeriodoId;

    this.service.getAll(filters).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.asignaciones = res.data;
        this.total_items = res.meta?.paging?.total_items || 0;
      }
    });
  }

  onFilterChange() {
    this.page = 1;
    this.loadData();
  }

  nueva() {
    this.router.navigate(['/admin/asignaciones/nueva/new']);
  }

  editar(a: Asignacion) {
    this.router.navigate([`/admin/asignaciones/${a.id}/edit`]);
  }

  eliminar(a: Asignacion) {
    this.alertService.confirmDelete(() => {
      this.service.delete(a.id).subscribe((res: any) => {
        if (res.ok) {
          this.alertService.successOrError('Asignación eliminada');
          this.loadData();
        }
      });
    });
  }

  getPersonasCount(a: Asignacion): number {
    return a.personas?.length || 0;
  }
}
