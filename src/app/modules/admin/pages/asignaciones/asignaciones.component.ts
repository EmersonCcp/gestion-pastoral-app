import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asignacion } from 'src/app/shared/interfaces/entities/asignacion.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { AuthService } from 'src/app/shared/services/auth.service';

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

  // Clonación
  isClonarModalOpen = false;
  clonarDto = {
    periodo_origen_id: null as number | null,
    periodo_destino_id: null as number | null,
    copiar_personas: true
  };

  constructor(
    private service: AsignacionService,
    private periodoService: PeriodoService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPeriodos();
    this.loadData();
  }

  loadPeriodos() {
    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;
    this.periodoService.getAll({ per_page: 100, movimiento_id: movId }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
    });
  }

  loadData() {
    this.loading = true;
    const movId = this.authService.getSelectedMovimientoId();
    const filters: any = { per_page: this.per_page, page: this.page };
    if (movId) filters.movimiento_id = movId;
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

  abrirClonarModal() {
    this.clonarDto = {
      periodo_origen_id: this.selectedPeriodoId,
      periodo_destino_id: null,
      copiar_personas: true
    };
    this.isClonarModalOpen = true;
  }

  cerrarClonarModal() {
    this.isClonarModalOpen = false;
  }

  ejecutarClonar() {
    if (!this.clonarDto.periodo_origen_id) {
      this.alertService.successOrError('Debes seleccionar un período de origen');
      return;
    }
    if (!this.clonarDto.periodo_destino_id) {
      this.alertService.successOrError('Debes seleccionar un período de destino');
      return;
    }
    if (this.clonarDto.periodo_origen_id === this.clonarDto.periodo_destino_id) {
      this.alertService.successOrError('El período de origen y destino no pueden ser el mismo');
      return;
    }

    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) {
      this.alertService.successOrError('No se pudo identificar el movimiento activo');
      return;
    }

    const payload = {
      periodo_origen_id: Number(this.clonarDto.periodo_origen_id),
      periodo_destino_id: Number(this.clonarDto.periodo_destino_id),
      copiar_personas: !!this.clonarDto.copiar_personas,
      movimiento_id: movId
    };

    this.service.clonar(payload).subscribe((res: any) => {
      if (res.ok) {
        this.alertService.successOrError(res.message || 'Se clonaron las asignaciones.');
        this.cerrarClonarModal();
        this.selectedPeriodoId = payload.periodo_destino_id;
        this.loadData();
      } else {
        this.alertService.successOrError(res.message || 'Error al clonar asignaciones');
      }
    });
  }
}
