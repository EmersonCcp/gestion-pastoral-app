import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asignacion } from 'src/app/shared/interfaces/entities/asignacion.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Persona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-clonar-asignaciones',
  templateUrl: './clonar-asignaciones.component.html',
  styleUrls: ['./clonar-asignaciones.component.scss']
})
export class ClonarAsignacionesComponent implements OnInit {
  periodos: Periodo[] = [];
  asignacionesOrigen: Asignacion[] = [];
  gruposOrigen: Grupo[] = [];
  participantes: Persona[] = [];

  periodoOrigenId: number | null = null;
  periodoDestinoId: number | null = null;
  grupoId: number | null = null;
  selectedPersonaIds = new Set<number>();

  loadingPeriodos = false;
  loadingAsignaciones = false;
  submitting = false;

  constructor(
    private asignacionService: AsignacionService,
    private periodoService: PeriodoService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPeriodos();
  }

  loadPeriodos() {
    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;

    this.loadingPeriodos = true;
    this.periodoService.getAll({ per_page: 100, movimiento_id: movId }).subscribe({
      next: (res: any) => {
        this.loadingPeriodos = false;
        if (res.ok) {
          this.periodos = res.data;
        }
      },
      error: () => {
        this.loadingPeriodos = false;
        this.alertService.successOrError('Error al cargar períodos');
      }
    });
  }

  onPeriodoOrigenChange() {
    this.grupoId = null;
    this.gruposOrigen = [];
    this.participantes = [];
    this.selectedPersonaIds.clear();
    this.asignacionesOrigen = [];

    if (!this.periodoOrigenId) return;

    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;

    this.loadingAsignaciones = true;
    this.asignacionService.getAll({ periodo_id: this.periodoOrigenId, movimiento_id: movId, per_page: 200 }).subscribe({
      next: (res: any) => {
        this.loadingAsignaciones = false;
        if (res.ok) {
          this.asignacionesOrigen = res.data;
          
          // Extraer grupos únicos con asignaciones en este período
          const gruposMap = new Map<number, Grupo>();
          this.asignacionesOrigen.forEach(a => {
            if (a.grupo && a.grupo.id) {
              gruposMap.set(a.grupo.id, a.grupo);
            }
          });
          this.gruposOrigen = Array.from(gruposMap.values());
        }
      },
      error: () => {
        this.loadingAsignaciones = false;
        this.alertService.successOrError('Error al cargar asignaciones de origen');
      }
    });
  }

  onGrupoChange() {
    this.participantes = [];
    this.selectedPersonaIds.clear();

    if (!this.grupoId) return;

    const asignacion = this.asignacionesOrigen.find(a => a.grupo_id === this.grupoId);
    if (asignacion && asignacion.personas) {
      this.participantes = asignacion.personas;
      // Seleccionar todos por defecto
      this.participantes.forEach(p => this.selectedPersonaIds.add(p.id));
    }
  }

  isPersonaSelected(id: number): boolean {
    return this.selectedPersonaIds.has(id);
  }

  togglePersonaSelection(id: number) {
    if (this.selectedPersonaIds.has(id)) {
      this.selectedPersonaIds.delete(id);
    } else {
      this.selectedPersonaIds.add(id);
    }
  }

  isAllSelected(): boolean {
    return this.participantes.length > 0 && this.selectedPersonaIds.size === this.participantes.length;
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedPersonaIds.clear();
    } else {
      this.participantes.forEach(p => this.selectedPersonaIds.add(p.id));
    }
  }

  ejecutarClonar() {
    if (!this.periodoOrigenId) {
      this.alertService.successOrError('Debes seleccionar un período de origen');
      return;
    }
    if (!this.periodoDestinoId) {
      this.alertService.successOrError('Debes seleccionar un período de destino');
      return;
    }
    if (this.periodoOrigenId === this.periodoDestinoId) {
      this.alertService.successOrError('El período de origen y destino no pueden ser el mismo');
      return;
    }
    if (!this.grupoId) {
      this.alertService.successOrError('Debes seleccionar un grupo');
      return;
    }

    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) {
      this.alertService.successOrError('No se pudo identificar el movimiento activo');
      return;
    }

    const payload = {
      periodo_origen_id: Number(this.periodoOrigenId),
      periodo_destino_id: Number(this.periodoDestinoId),
      movimiento_id: movId,
      grupo_id: Number(this.grupoId),
      persona_ids: Array.from(this.selectedPersonaIds)
    };

    this.submitting = true;
    this.asignacionService.clonar(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.ok) {
          this.alertService.successOrError(res.message || 'Grupo clonado exitosamente.');
          this.router.navigate(['/admin/asignaciones']);
        } else {
          this.alertService.successOrError(res.message || 'Error al clonar asignación');
        }
      },
      error: (err) => {
        this.submitting = false;
        this.alertService.successOrError(err.error?.message || 'Error al clonar asignación');
      }
    });
  }

  volver() {
    this.router.navigate(['/admin/asignaciones']);
  }
}
