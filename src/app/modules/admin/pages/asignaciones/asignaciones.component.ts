import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asignacion } from 'src/app/shared/interfaces/entities/asignacion.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.component.html',
  styleUrls: ['./asignaciones.component.scss']
})
export class AsignacionesComponent implements OnInit {
  asignaciones: Asignacion[] = [];
  periodos: Periodo[] = [];
  grupos: Grupo[] = [];
  loading = true;
  selectedPeriodoId: number | null = null;
  selectedGrupoId: number | null = null;
  search = '';
  total_items = 0;
  total_pages = 0;
  page = 1;
  per_page = 10; // Reducimos a 10 para consistencia con app-table-admin

  private searchTimeout: any;

  constructor(
    private service: AsignacionService,
    private periodoService: PeriodoService,
    private grupoService: GrupoService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPeriodos();
    this.loadGrupos();
    this.loadData();
  }

  loadPeriodos() {
    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;
    this.periodoService.getAll({ per_page: 100, movimiento_id: movId }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
    });
  }

  loadGrupos() {
    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;
    this.grupoService.getAll({ per_page: 100, movimiento_id: movId }).subscribe((res: any) => {
      if (res.ok) this.grupos = res.data;
    });
  }

  loadData() {
    this.loading = true;
    const movId = this.authService.getSelectedMovimientoId();
    const filters: any = { per_page: this.per_page, page: this.page };
    if (movId) filters.movimiento_id = movId;
    if (this.selectedPeriodoId) filters.periodo_id = this.selectedPeriodoId;
    if (this.selectedGrupoId) filters.grupo_id = this.selectedGrupoId;
    if (this.search) filters.search = this.search;

    this.service.getAll(filters).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.asignaciones = res.data;
        this.total_items = res.meta?.paging?.total_items || 0;
        this.total_pages = res.meta?.paging?.total_pages || 0;
      }
    });
  }

  onFilterChange() {
    this.page = 1;
    this.loadData();
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

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (this.search === '') {
      this.page = 1;
      this.loadData();
      return;
    }

    if (this.search.length < 3) return;

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
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

  irAClonar() {
    this.router.navigate(['/admin/asignaciones/clonar']);
  }
}
