import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Asignacion } from 'src/app/shared/interfaces/entities/asignacion.entity';
import { Aula } from 'src/app/shared/interfaces/entities/aula.entity';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { Persona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';
import { AulaService } from 'src/app/shared/services/aula.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { PersonaService } from 'src/app/shared/services/persona.service';

interface PersonaAgrupada {
  tipo: string;
  personas: Persona[];
}

const DIAS = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];
const FRECUENCIAS = ['SEMANAL', 'QUINCENAL', 'MENSUAL'];

@Component({
  selector: 'app-formulario-asignacion',
  templateUrl: './formulario-asignacion.component.html',
  styleUrls: ['./formulario-asignacion.component.scss'],
})
export class FormularioAsignacionComponent implements OnInit, OnDestroy {
  form: FormGroup;
  editMode = false;
  asignacionId: number | null = null;
  loading = false;

  // Selects data
  grupos: Grupo[] = [];
  periodos: Periodo[] = [];
  aulas: Aula[] = [];
  dias = DIAS;
  frecuencias = FRECUENCIAS;

  // Person search
  searchControl = new FormControl('');
  searchResults: Persona[] = [];
  searchResultsAgrupados: PersonaAgrupada[] = [];
  searching = false;

  // Selected personas
  selectedPersonas: Persona[] = [];
  selectedAgrupados: PersonaAgrupada[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: AsignacionService,
    private grupoService: GrupoService,
    private periodoService: PeriodoService,
    private aulaService: AulaService,
    private personaService: PersonaService,
    private alertService: AlertService,
  ) {
    this.form = this.fb.group({
      grupo_id: [null, Validators.required],
      periodo_id: [null, Validators.required],
      aula_id: [null],
      dia_reunion: [null],
      frecuencia: [null],
      hora_inicio: [null],
      hora_fin: [null],
    });
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.setupSearch();

    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.paramMap.get('mode');
    this.editMode = mode === 'edit';

    if (this.editMode && id && id !== 'nueva') {
      this.asignacionId = +id;
      this.loadAsignacion(this.asignacionId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCatalogs() {
    this.loading = true;
    let loadedCount = 0;
    const totalToLoad = 3;

    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad && !this.asignacionId) {
        this.loading = false;
      }
    };

    this.grupoService.getAll({ per_page: 200 }).subscribe((res: any) => {
      if (res.ok)
        this.grupos = res.data.filter((g: Grupo) => g.parent_id !== null);
      checkLoading();
    });
    this.periodoService.getAll({ per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
      checkLoading();
    });
    this.aulaService.getAll({ per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.aulas = res.data;
      checkLoading();
    });
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        if (term && term.length >= 2) {
          this.buscarPersonas(term);
        } else {
          this.searchResults = [];
          this.searchResultsAgrupados = [];
        }
      });
  }

  buscarPersonas(term: string) {
    this.searching = true;
    this.personaService
      .getAll({ nombre: term, per_page: 20 })
      .subscribe((res: any) => {
        this.searching = false;
        if (res.ok) {
          // Filter out already selected
          const selectedIds = this.selectedPersonas.map((p) => p.id);
          this.searchResults = res.data.filter(
            (p: Persona) => !selectedIds.includes(p.id),
          );
          this.searchResultsAgrupados = this.agruparPorTipo(this.searchResults);
        }
      });
  }

  agruparPorTipo(personas: Persona[]): PersonaAgrupada[] {
    const map = new Map<string, Persona[]>();
    personas.forEach((p) => {
      const tipo = p.tipoPersona?.nombre || 'SIN TIPO';
      if (!map.has(tipo)) map.set(tipo, []);
      map.get(tipo)!.push(p);
    });
    return Array.from(map.entries()).map(([tipo, personas]) => ({
      tipo,
      personas,
    }));
  }

  agregarPersona(persona: Persona) {
    if (!this.selectedPersonas.find((p) => p.id === persona.id)) {
      this.selectedPersonas = [...this.selectedPersonas, persona];
      this.selectedAgrupados = this.agruparPorTipo(this.selectedPersonas);
    }
    // Remove from results
    this.searchResults = this.searchResults.filter((p) => p.id !== persona.id);
    this.searchResultsAgrupados = this.agruparPorTipo(this.searchResults);
    this.searchControl.setValue('', { emitEvent: false });
    this.searchResults = [];
    this.searchResultsAgrupados = [];
  }

  quitarPersona(persona: Persona) {
    this.selectedPersonas = this.selectedPersonas.filter(
      (p) => p.id !== persona.id,
    );
    this.selectedAgrupados = this.agruparPorTipo(this.selectedPersonas);
  }

  loadAsignacion(id: number) {
    this.loading = true;
    this.service.getById(id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        const a: Asignacion = res.data;
        this.form.patchValue({
          grupo_id: a.grupo_id,
          periodo_id: a.periodo_id,
          aula_id: a.aula_id,
          dia_reunion: a.dia_reunion,
          frecuencia: a.frecuencia,
          hora_inicio: a.hora_inicio,
          hora_fin: a.hora_fin,
        });
        this.selectedPersonas = a.personas || [];
        this.selectedAgrupados = this.agruparPorTipo(this.selectedPersonas);
      }
    });
  }

  guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    this.alertService.loader();

    const payload = {
      ...this.form.value,
      persona_ids: this.selectedPersonas.map((p) => p.id),
    };

    const request$ =
      this.editMode && this.asignacionId
        ? this.service.update(this.asignacionId, payload)
        : this.service.create(payload);

    request$.subscribe({
      next: (res: any) => {
        this.loading = false;
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Asignación guardada');
          this.router.navigate(['/admin/asignaciones']);
        } else {
          this.alertService.successOrError(
            'Error',
            res.error?.message,
            'error',
          );
        }
      },
      error: () => {
        this.loading = false;
        this.alertService.close();
        this.alertService.successOrError('Error inesperado', '', 'error');
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/asignaciones']);
  }

  get grupoControl() {
    return this.form.get('grupo_id') as FormControl;
  }
  get periodoControl() {
    return this.form.get('periodo_id') as FormControl;
  }
}
