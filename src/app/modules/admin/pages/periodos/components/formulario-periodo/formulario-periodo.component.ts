import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';

@Component({
  selector: 'app-formulario-periodo',
  templateUrl: './formulario-periodo.component.html',
  styleUrls: ['./formulario-periodo.component.scss']
})
export class FormularioPeriodoComponent implements OnInit {
  loading = false;
  id = 0;
  form: FormGroup;
  disabled = false;
  sigla = 'periodos';
  editMode = false;

  constructor(
    private service: PeriodoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
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
    this.service.getById(this.id).subscribe((res: any) => {
      if (res.ok) {
        this.form.patchValue(res.data);
      } else {
        const errorMsg = res?.error?.message || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
      }
    });
  }

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      fecha_inicio: ['', [Validators.required]],
      fecha_fin: ['', [Validators.required]],
      activo: [true],
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
    this.save(this.form.value);
  }

  get nombreControl(): FormControl {
    return this.form.get('nombre') as FormControl;
  }
}
