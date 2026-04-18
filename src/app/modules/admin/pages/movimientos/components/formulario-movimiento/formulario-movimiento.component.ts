import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { Movimiento } from 'src/app/shared/interfaces/entities/movimiento.entity';
import { Parroquia } from 'src/app/shared/interfaces/entities/parroquia.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MovimientoService } from 'src/app/shared/services/movimiento.service';
import { ParroquiaService } from 'src/app/shared/services/parroquia.service';

@Component({
  selector: 'app-formulario-movimiento',
  templateUrl: './formulario-movimiento.component.html',
  styleUrls: ['./formulario-movimiento.component.scss']
})
export class FormularioMovimientoComponent implements OnInit {
  loading = false;
  id = 0;
  form: FormGroup;
  disabled = false;
  sigla = 'movimientos';
  editMode = false;
  parroquias: Parroquia[] = [];

  constructor(
    private service: MovimientoService,
    private parroquiaService: ParroquiaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadParroquias();
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

  loadParroquias() {
    this.parroquiaService.getAll({ page: 1, per_page: 500 }).subscribe((res: any) => {
      if (res.ok) {
        this.parroquias = res.data;
      }
    });
  }

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      parroquia_id: [null],
      estado: [true],
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
      parroquia_id: this.form.value.parroquia_id ? Number(this.form.value.parroquia_id) : null
    };
    
    this.save(dto);
  }

  get nombreControl(): FormControl {
    return this.form.get('nombre') as FormControl;
  }
  
  get parroquiaControl(): FormControl {
    return this.form.get('parroquia_id') as FormControl;
  }
}
