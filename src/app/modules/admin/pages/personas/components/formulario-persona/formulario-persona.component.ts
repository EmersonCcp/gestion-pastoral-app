import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { TipoPersona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { TipoPersonaService } from 'src/app/shared/services/tipo-persona.service';

@Component({
  selector: 'app-formulario-persona',
  templateUrl: './formulario-persona.component.html',
  styleUrls: ['./formulario-persona.component.scss']
})
export class FormularioPersonaComponent implements OnInit {
  loading = false;
  id = 0;
  form: FormGroup;
  disabled = false;
  sigla = 'personas';
  editMode = false;
  tipos: TipoPersona[] = [];

  constructor(
    private service: PersonaService,
    private tipoService: TipoPersonaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadTipos();
    this.activatedRoute.params.pipe(take(1)).subscribe((param) => {
      this.handleParams(param);
    });
  }

  handleParams(param: any) {
    this.id = Number(param['id']) || 0;
    this.editMode = this.id !== 0;
    const mode = param['mode'];
    this.disabled = mode === 'view';

    if (this.id > 0) {
      this.loadData();
    }

    if (this.disabled) {
      this.form.disable();
    }
  }

  private loadData() {
    this.loading = true;
    this.service.getById(this.id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.form.patchValue(res.data);
      } else {
        const errorMsg = res?.error?.message || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
      }
    });
  }

  loadTipos() {
    this.loading = true;
    this.tipoService.getAll({ per_page: 100 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.tipos = res.data;
      }
    });
  }

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      documento: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: [''],
      genero: [''],
      fecha_nacimiento: [''],
      tipo_persona_id: [null, [Validators.required]],
    });
  }

  goBack() {
    this.router.navigate([`admin/${this.sigla}`]);
  }

  private save(data: any) {
    const request$ =
      this.id === 0
        ? this.service.create(data)
        : this.service.update(this.id, data);

    request$.subscribe({
      next: (res: any) => {
        this.alertService.close();
        if (!res.ok) {
          this.alertService.successOrError(res.error.message, '', 'error');
          return;
        }
        this.alertService.successOrError('Registro guardado');
        this.router.navigate([`admin/${this.sigla}`]);
      },
      error: () => {
        this.alertService.close();
        this.alertService.successOrError('Error inesperado', '', 'error');
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.alertService.loader();
    
    const dto = {
      ...this.form.value,
      tipo_persona_id: Number(this.form.value.tipo_persona_id)
    };
    
    this.save(dto);
  }

  get nombreControl(): FormControl { return this.form.get('nombre') as FormControl; }
  get apellidoControl(): FormControl { return this.form.get('apellido') as FormControl; }
  get documentoControl(): FormControl { return this.form.get('documento') as FormControl; }
  get emailControl(): FormControl { return this.form.get('email') as FormControl; }
  get telefonoControl(): FormControl { return this.form.get('telefono') as FormControl; }
  get direccionControl(): FormControl { return this.form.get('direccion') as FormControl; }
  get generoControl(): FormControl { return this.form.get('genero') as FormControl; }
  get fechaNacimientoControl(): FormControl { return this.form.get('fecha_nacimiento') as FormControl; }
}
