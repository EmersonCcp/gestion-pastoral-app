import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IPermiso } from 'src/app/shared/interfaces/entities/permiso.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PermisoService } from 'src/app/shared/services/permiso.service';

@Component({
  selector: 'app-formulario-permiso',
  templateUrl: './formulario-permiso.component.html',
  styleUrls: ['./formulario-permiso.component.scss'],
})
export class FormularioPermisoComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: PermisoService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FormularioPermisoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPermiso | null,
  ) {
    this.form = this.initForm(data || null);
  }

  initForm(data?: IPermiso | null) {
    return this.fb.group({
      accion: [data?.accion || '', Validators.required],
      sujeto: [data?.sujeto || '', Validators.required],
      descripcion: [data?.descripcion || ''],
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.alertService.loader();

    const dto: IPermiso = {
      createdAt: this.data?.createdAt || new Date(),
      ...this.form.value,
    };

    const request$ = this.data
      ? this.service.update(this.data.id, dto)
      : this.service.create(dto);

    request$.subscribe({
      next: (res) => {
        this.alertService.close();

        if (res.ok) {
          this.dialogRef.close(res.data);
          this.alertService.successOrError();
        } else {
          this.showError(res.error?.message);
        }
      },
      error: (err) => {
        this.alertService.close();
        console.error(err);
        this.showError(err?.error?.message);
      },
    });
  }

  private showError(message?: string) {
    this.alertService.successOrError(
      'Operación fallida',
      message || 'Ocurrió un error inesperado',
      'error',
    );
  }

  cerrar() {
    this.dialogRef.close();
  }

  get accionControl(): FormControl {
    return this.form.get('accion') as FormControl;
  }

  get sujetoControl(): FormControl {
    return this.form.get('sujeto') as FormControl;
  }

  get descripcionControl(): FormControl {
    return this.form.get('descripcion') as FormControl;
  }
}
