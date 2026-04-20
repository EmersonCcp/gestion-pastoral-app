import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { DesarrolloClase } from 'src/app/shared/interfaces/entities/desarrollo-clase.entity';
import { EstadoAsistencia } from 'src/app/shared/interfaces/entities/asistencia.entity';
import { Libro } from 'src/app/shared/interfaces/entities/libro.entity';
import { Tema } from 'src/app/shared/interfaces/entities/tema.entity';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DesarrolloClaseService } from 'src/app/shared/services/desarrollo-clase.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { LibroService } from 'src/app/shared/services/libro.service';
import { TemaService } from 'src/app/shared/services/tema.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';

@Component({
  selector: 'app-formulario-desarrollo-clase',
  templateUrl: './formulario-desarrollo-clase.component.html'
})
export class FormularioDesarrolloClaseComponent implements OnInit {
  form: FormGroup;
  editMode = false;
  id = 0;
  loading = false;
  
  grupos: Grupo[] = [];
  periodos: Periodo[] = [];
  librosAsignados: Libro[] = [];
  temasDelLibro: Tema[] = [];
  selectedTemaIds: number[] = [];
  
  loadingPersonas = false;
  estadosAsistencia = Object.values(EstadoAsistencia);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: DesarrolloClaseService,
    private grupoService: GrupoService,
    private libroService: LibroService,
    private temaService: TemaService,
    private periodoService: PeriodoService,
    private asignacionService: AsignacionService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      grupo_id: [null, Validators.required],
      periodo_id: [null, Validators.required],
      libro_id: [null],
      observaciones: [''],
      asistencia_personas: this.fb.array([])
    });
  }

  get asistenciaPersonas() {
    return this.form.get('asistencia_personas') as FormArray;
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.route.params.pipe(take(1)).subscribe(params => {
      this.id = +params['id'] || 0;
      this.editMode = this.id > 0;
      if (this.editMode) this.loadData();
    });
  }

  loadCatalogs() {
    this.grupoService.getAll({ per_page: 500 }).subscribe((res: any) => {
      if (res.ok) this.grupos = res.data.filter((g: any) => g.parent_id !== null);
    });
    this.periodoService.getAll({ per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
    });
  }

  onGrupoChange() {
    const grupoId = this.form.get('grupo_id')?.value;
    if (!grupoId) return;

    this.loading = true;
    this.grupoService.getById(grupoId).subscribe((res: any) => {
      this.loading = false;
      if (res.ok && res.data.libros) {
        this.librosAsignados = res.data.libros;
      } else {
        this.librosAsignados = [];
      }
    });

    this.checkLoadAttendance();
  }

  onLibroChange() {
    const libroId = this.form.get('libro_id')?.value;
    if (!libroId) {
      this.temasDelLibro = [];
      return;
    }

    this.temaService.getByLibro(libroId).subscribe((res: any) => {
      if (res.ok) {
        this.temasDelLibro = res.data.sort((a: any, b: any) => a.numero_tema - b.numero_tema);
      }
    });
  }

  checkLoadAttendance() {
    const grupoId = this.form.get('grupo_id')?.value;
    const periodoId = this.form.get('periodo_id')?.value;
    if (grupoId && periodoId) {
      this.loadPersonas(grupoId, periodoId);
    }
  }

  loadPersonas(grupoId: number, periodoId: number) {
    this.loadingPersonas = true;
    this.asistenciaPersonas.clear();
    this.asignacionService.getAll({ grupo_id: grupoId, periodo_id: periodoId, per_page: 100 }).subscribe((res: any) => {
      this.loadingPersonas = false;
      if (res.ok) {
        const personasMap = new Map();
        res.data.forEach((a: any) => a.personas?.forEach((p: any) => personasMap.set(p.id, p)));
        Array.from(personasMap.values()).forEach(p => this.addPersonaControl(p));
      }
    });
  }
  addPersonaControl(persona: any, estado = EstadoAsistencia.PRESENTE) {
    this.asistenciaPersonas.push(this.fb.group({
      persona_id: [persona.id],
      nombre_completo: [`${persona.apellido}, ${persona.nombre}`],
      estado: [estado, Validators.required],
      observacion: ['']
    }));
  }

  toggleTema(temaId: number) {
    const idx = this.selectedTemaIds.indexOf(temaId);
    if (idx === -1) this.selectedTemaIds.push(temaId);
    else this.selectedTemaIds.splice(idx, 1);
  }

  isTemaSelected(temaId: number): boolean {
    return this.selectedTemaIds.includes(temaId);
  }

  loadData() {
    this.loading = true;
    this.service.getById(this.id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        const d = res.data;
        this.form.patchValue(d);
        if (d.asistencia) {
          this.form.patchValue({ periodo_id: d.asistencia.periodo_id });
        }
        this.selectedTemaIds = d.temas ? d.temas.map((t: any) => t.id) : [];
        
        // 1. Cargamos los libros del grupo
        if (d.grupo_id) {
          this.grupoService.getById(d.grupo_id).subscribe((gres: any) => {
            if (gres.ok) this.librosAsignados = gres.data.libros || [];
          });
        }

        // 2. Cargamos los temas del libro
        if (d.libro_id) {
          this.onLibroChange();
        }

        // 3. Cargamos la asistencia guardada
        if (d.asistencia && d.asistencia.personas) {
          this.asistenciaPersonas.clear();
          d.asistencia.personas.forEach((ap: any) => {
            this.asistenciaPersonas.push(this.fb.group({
              persona_id: [ap.persona_id],
              nombre_completo: [`${ap.persona?.apellido}, ${ap.persona?.nombre}`],
              estado: [ap.estado, Validators.required],
              observacion: [ap.observacion || '']
            }));
          });
        }
      }
    });
  }

  onSubmit() {
    const hasLibro = !!this.form.value.libro_id && this.form.value.libro_id !== 'null';
    
    // Si hay libro, debe haber al menos un tema. Si no hay libro, no es obligatorio.
    if (this.form.invalid || (hasLibro && this.selectedTemaIds.length === 0)) {
      this.alertService.successOrError('Completa los campos' + (hasLibro ? ' y selecciona al menos un tema' : ''), '', 'warning');
      return;
    }

    this.alertService.loader();
    const payload = {
      ...this.form.value,
      temas_ids: this.selectedTemaIds,
      asistencia: {
        fecha: this.form.value.fecha,
        grupo_id: this.form.value.grupo_id,
        periodo_id: this.form.value.periodo_id,
        persona_estados: this.form.value.asistencia_personas
      }
    };


    const request$ = this.editMode ? this.service.update(this.id, payload) : this.service.create(payload);
    request$.subscribe((res: any) => {
      this.alertService.close();
      if (res.ok) {
        this.alertService.successOrError('Clase registrada con éxito');
        this.router.navigate(['/admin/desarrollo-clase']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/desarrollo-clase']);
  }
}
