import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Movimiento } from 'src/app/shared/interfaces/entities/movimiento.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { MovimientoService } from 'src/app/shared/services/movimiento.service';

@Component({
  selector: 'app-formulario-grupo',
  templateUrl: './formulario-grupo.component.html',
  styleUrls: ['./formulario-grupo.component.scss']
})
export class FormularioGrupoComponent implements OnInit {
  loading = false;
  id = 0;
  form: FormGroup;
  disabled = false;
  sigla = 'grupos';
  editMode = false;
  movimientos: Movimiento[] = [];
  gruposPadre: Grupo[] = [];

  constructor(
    private service: GrupoService,
    private movimientoService: MovimientoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadMovimientos();
    this.loadGruposPadre();
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

  loadMovimientos() {
    this.loading = true;
    this.movimientoService.getAll({ page: 1, per_page: 500 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.movimientos = res.data;
      }
    });
  }

  loadGruposPadre() {
    // Solo cargamos grupos que no tengan ya un padre (para mantener la estructura simple, o permitirla)
    // En este caso, permitimos todos menos el actual para evitar circularidad
    this.loading = true;
    this.service.getAll({ page: 1, per_page: 500 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.gruposPadre = res.data.filter((g: Grupo) => g.id !== this.id);
      }
    });
  }

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      movimiento_id: [null, [Validators.required]],
      parent_id: [null],
      estado: [true],
    });
  }

  onParentChange() {
    const parentId = this.form.get('parent_id')?.value;
    if (parentId && parentId !== 'null') {
      const parent = this.gruposPadre.find(g => g.id == parentId);
      if (parent && parent.movimiento_id) {
        this.form.patchValue({ movimiento_id: parent.movimiento_id });
      }
    }
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
      movimiento_id: Number(this.form.value.movimiento_id),
      parent_id: this.form.value.parent_id && this.form.value.parent_id !== 'null' ? Number(this.form.value.parent_id) : null
    };
    
    this.save(dto);
  }

  get nombreControl(): FormControl {
    return this.form.get('nombre') as FormControl;
  }
}
