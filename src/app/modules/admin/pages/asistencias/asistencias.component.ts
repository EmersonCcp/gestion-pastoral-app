import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asistencia } from 'src/app/shared/interfaces/entities/asistencia.entity';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.component.html',
  styleUrls: ['./asistencias.component.scss']
})
export class AsistenciasComponent implements OnInit {
  asistencias: Asistencia[] = [];
  periodos: Periodo[] = [];
  grupos: Grupo[] = [];
  loading = false;
  selectedPeriodoId: number | null = null;
  selectedGrupoId: number | null = null;
  total_items = 0;
  page = 1;
  per_page = 20;

  constructor(
    private service: AsistenciaService,
    private periodoService: PeriodoService,
    private grupoService: GrupoService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadData();
  }

  loadCatalogs() {
    this.periodoService.getAll({ per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
    });
    this.grupoService.getAll({ per_page: 200 }).subscribe((res: any) => {
      if (res.ok) this.grupos = res.data.filter((g: any) => g.parent_id !== null);
    });
  }

  loadData() {
    this.loading = true;
    const filters: any = { per_page: this.per_page, page: this.page };
    if (this.selectedPeriodoId) filters.periodo_id = this.selectedPeriodoId;
    if (this.selectedGrupoId) filters.grupo_id = this.selectedGrupoId;

    this.service.getAll(filters).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.asistencias = res.data;
        this.total_items = res.meta?.paging?.total_items || 0;
      }
    });
  }

  onFilterChange() {
    this.page = 1;
    this.loadData();
  }

  nueva() {
    this.router.navigate(['/admin/asistencias/nueva/new']);
  }

  editar(a: Asistencia) {
    this.router.navigate([`/admin/asistencias/${a.id}/edit`]);
  }

  eliminar(a: Asistencia) {
    this.alertService.confirmDelete(() => {
      this.service.delete(a.id).subscribe((res: any) => {
        if (res.ok) {
          this.alertService.successOrError('Asistencia eliminada');
          this.loadData();
        }
      });
    });
  }
}
