import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { Libro } from 'src/app/shared/interfaces/entities/libro.entity';
import { TipoPersona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LibroService } from 'src/app/shared/services/libro.service';
import { TipoPersonaService } from 'src/app/shared/services/tipo-persona.service';

@Component({
  selector: 'app-formulario-libro',
  templateUrl: './formulario-libro.component.html'
})
export class FormularioLibroComponent implements OnInit {
  loading = false;
  id = 0;
  form: FormGroup;
  editMode = false;
  tiposPersonas: TipoPersona[] = [];

  constructor(
    private service: LibroService,
    private tipoPersonaService: TipoPersonaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadTiposPersonas();
    this.activatedRoute.params.pipe(take(1)).subscribe((param) => {
      this.id = Number(param['id']) || 0;
      this.editMode = this.id !== 0;
      if (this.id > 0) this.loadData();
    });
  }

  private loadData() {
    this.loading = true;
    this.service.getById(this.id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.form.patchValue(res.data);
      }
    });
  }

  loadTiposPersonas() {
    this.tipoPersonaService.getAll({ per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.tiposPersonas = res.data;
    });
  }

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      tipo_persona_id: [null, [Validators.required]],
      estado: [true]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.alertService.loader();
    const data = this.form.value;
    const request$ = this.id === 0 ? this.service.create(data) : this.service.update(this.id, data);

    request$.subscribe((res: any) => {
      this.alertService.close();
      if (res.ok) {
        this.alertService.successOrError('Libro guardado');
        this.router.navigate(['/admin/libros']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/libros']);
  }
}
