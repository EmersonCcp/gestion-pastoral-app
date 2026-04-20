import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Asistencia, EstadoAsistencia } from 'src/app/shared/interfaces/entities/asistencia.entity';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';

@Component({
  selector: 'app-formulario-asistencia',
  templateUrl: './formulario-asistencia.component.html',
  styleUrls: ['./formulario-asistencia.component.scss']
})
export class FormularioAsistenciaComponent implements OnInit {
  form: FormGroup;
  editMode = false;
  asistenciaId: number | null = null;
  loading = false;
  loadingPersonas = false;

  periodos: Periodo[] = [];
  grupos: Grupo[] = [];
  estados = Object.values(EstadoAsistencia);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: AsistenciaService,
    private periodoService: PeriodoService,
    private grupoService: GrupoService,
    private asignacionService: AsignacionService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      observacion: [''],
      grupo_id: [null, Validators.required],
      periodo_id: [null, Validators.required],
      persona_estados: this.fb.array([])
    });
  }

  get personaEstados() {
    return this.form.get('persona_estados') as FormArray;
  }

  ngOnInit(): void {
    this.loadCatalogs();
    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.paramMap.get('mode');
    this.editMode = mode === 'edit';

    if (this.editMode && id && id !== 'nueva') {
      this.asistenciaId = +id;
      this.loadAsistencia(this.asistenciaId);
    }
  }

  loadCatalogs() {
    this.loading = true;
    let loadedCount = 0;
    const totalToLoad = 2;

    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad && !this.asistenciaId) {
        this.loading = false;
      }
    };

    this.periodoService.getAll({ per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
      checkLoading();
    });
    this.grupoService.getAll({ per_page: 200 }).subscribe((res: any) => {
      if (res.ok) this.grupos = res.data.filter((g: any) => g.parent_id !== null);
      checkLoading();
    });
  }

  onSelectionChange() {
    const grupo_id = this.form.get('grupo_id')?.value;
    const periodo_id = this.form.get('periodo_id')?.value;

    if (!this.editMode && grupo_id && periodo_id) {
      this.loadPersonasFromAsignacion(grupo_id, periodo_id);
    }
  }

  loadPersonasFromAsignacion(grupo_id: number, periodo_id: number) {
    this.loadingPersonas = true;
    this.personaEstados.clear();
    
    // Fetch asignaciones for this group and period
    this.asignacionService.getAll({ grupo_id, periodo_id, per_page: 50 }).subscribe((res: any) => {
      this.loadingPersonas = false;
      if (res.ok && res.data.length > 0) {
        // Collect all unique personas from all matching asignaciones
        const personasMap = new Map<number, any>();
        res.data.forEach((asignacion: any) => {
          asignacion.personas?.forEach((p: any) => {
            personasMap.set(p.id, p);
          });
        });

        Array.from(personasMap.values()).forEach(p => {
          this.addPersonaControl(p);
        });
      }
    });
  }

  addPersonaControl(persona: any, estado = EstadoAsistencia.PRESENTE, obs = '') {
    this.personaEstados.push(this.fb.group({
      persona_id: [persona.id],
      nombre_completo: [`${persona.apellido}, ${persona.nombre}`],
      tipo: [persona.tiposPersonas?.map((t: any) => t.nombre).join(', ') || 'S/T'],
      estado: [estado, Validators.required],
      observacion: [obs]
    }));
  }

  loadAsistencia(id: number) {
    this.loading = true;
    this.service.getById(id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        const a: Asistencia = res.data;
        this.form.patchValue({
          fecha: a.fecha,
          observacion: a.observacion,
          grupo_id: a.grupo_id,
          periodo_id: a.periodo_id
        });

        this.personaEstados.clear();
        a.personas?.forEach((ap: any) => {
          this.addPersonaControl(ap.persona, ap.estado, ap.observacion);
        });
      }
    });
  }

  guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    this.alertService.loader();

    const data = this.form.getRawValue();
    // Only send what the backend expects for persona_estados
    data.persona_estados = data.persona_estados.map((p: any) => ({
      persona_id: p.persona_id,
      estado: p.estado,
      observacion: p.observacion
    }));

    const request$ = this.editMode && this.asistenciaId
      ? this.service.update(this.asistenciaId, data)
      : this.service.create(data);

    request$.subscribe({
      next: (res: any) => {
        this.loading = false;
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Asistencia guardada');
          this.router.navigate(['/admin/asistencias']);
        }
      },
      error: () => {
        this.loading = false;
        this.alertService.close();
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/asistencias']);
  }

  castToFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }
}
